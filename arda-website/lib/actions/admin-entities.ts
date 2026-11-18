"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { assertPermission } from "@/lib/auth/admin";
import { writeAuditLog, getRequestIp } from "@/lib/utils/audit";
import { getEntityConfig } from "@/lib/admin/entityRegistry";
import type { FieldConfig } from "@/lib/admin/entityRegistry";
import { removeStorageObject } from "@/lib/storage/signedUrl";

/**
 * 「各界名人祝贺」「协会刊物」两个实体对应私有 Storage 桶的对象路径字段。
 * 用于：1) 更新记录时，若某个文件字段的路径发生变化（替换视频/PDF/封面），
 *       在数据库更新成功后清理旧对象，避免孤儿文件；
 *       2) 删除记录时，连带清理其引用的全部文件，避免删除后仍能通过旧签名
 *          URL（在其自然过期前）访问到已删除记录的文件。
 * 替换流程始终"先上传新文件 → 成功后才更新数据库记录 → 最后才删除旧文件"，
 * 任一环节失败都不会丢失原文件（见 VideoUploadField / PdfUploadField 实现）。
 */
const ENTITY_STORAGE_FILES: Record<string, { bucket: "videos" | "publications"; pathColumns: string[] }> = {
  videos: { bucket: "videos", pathColumns: ["video_path", "cover_path"] },
  publications: { bucket: "publications", pathColumns: ["pdf_path", "cover_path"] },
};

type ActionResult = { ok: true; id: string } | { ok: false; error: string };
type SimpleResult = { ok: true } | { ok: false; error: string };

function columnKeys(field: FieldConfig): string[] {
  return field.bilingual ? [`${field.key}_zh`, `${field.key}_en`] : [field.key];
}

/** 将表单收集到的原始值，按字段类型转换为数据库可接受的值 */
function coerceValue(type: FieldConfig["type"], raw: unknown, valueKind?: FieldConfig["valueKind"]): unknown {
  if (type === "hidden") {
    if (valueKind === "boolean") return Boolean(raw);
    if (valueKind === "number") {
      if (raw === "" || raw === null || raw === undefined) return null;
      const n = Number(raw);
      return Number.isFinite(n) ? n : null;
    }
    return typeof raw === "string" ? (raw.trim() === "" ? null : raw) : raw ?? null;
  }
  if (type === "number") {
    if (raw === "" || raw === null || raw === undefined) return null;
    const n = Number(raw);
    return Number.isFinite(n) ? n : null;
  }
  if (type === "checkbox") {
    return Boolean(raw);
  }
  if (type === "tags") {
    if (Array.isArray(raw)) return raw.filter((v) => typeof v === "string" && v.trim() !== "");
    if (typeof raw === "string") {
      return raw
        .split(/\r?\n|,/)
        .map((s) => s.trim())
        .filter(Boolean);
    }
    return [];
  }
  if (type === "datetime" || type === "date") {
    if (!raw || raw === "") return null;
    const d = new Date(raw as string);
    return Number.isNaN(d.getTime()) ? null : d.toISOString();
  }
  if (type === "select") {
    return raw === "" || raw === undefined ? null : raw;
  }
  if (type === "multiselect") {
    if (Array.isArray(raw)) return raw.filter((v) => typeof v === "string" && v.trim() !== "");
    return [];
  }
  // text / textarea / richtext / image / file / url / slug / video / pdf / private_image
  if (typeof raw === "string") return raw.trim() === "" ? null : raw;
  return raw ?? null;
}

function buildPayload(
  fields: FieldConfig[],
  values: Record<string, unknown>
): { payload: Record<string, unknown>; missing: string[] } {
  const payload: Record<string, unknown> = {};
  const missing: string[] = [];

  for (const field of fields) {
    const cols = columnKeys(field);
    for (const col of cols) {
      let coerced = coerceValue(field.type, values[col], field.valueKind);
      // sort_order 在所有表里都是 "not null default 0"——留空时 coerceValue 会把它
      // 转成 null，如果原样连 null 一起提交，Postgres 会因为显式传了 null 值而报
      // "violates not-null constraint"（只有完全不传这个字段时才会退回用默认值 0）。
      // 所以这里留空就直接补成 0，跟数据库默认值保持一致，避免新建记录时保存失败。
      if (field.key === "sort_order" && coerced === null) {
        coerced = 0;
      }
      payload[col] = coerced;
      if (field.required && (coerced === null || coerced === undefined || coerced === "")) {
        missing.push(col);
      }
    }
  }
  return { payload, missing };
}

/** 通用内容保存：新建（id 为 null）或编辑既有记录。权限与字段范围由 entityRegistry 声明驱动 */
export async function saveEntityRecord(
  entityKey: string,
  id: string | null,
  values: Record<string, unknown>
): Promise<ActionResult> {
  const config = getEntityConfig(entityKey);
  if (!config) return { ok: false, error: "未知内容类型" };

  try {
    const admin = await assertPermission("content.publish");

    // 分会管理员仅可编辑本人所属分会，不可新建/编辑他人分会（数据库 RLS 同样强制此约束）
    if (
      config.key === "chapters" &&
      admin.role.key === "chapter_admin" &&
      (id === null || id !== admin.assigned_chapter_id)
    ) {
      return { ok: false, error: "分会管理员仅可编辑本人所属分会" };
    }

    const { payload, missing } = buildPayload(config.fields, values);
    if (missing.length > 0) {
      return { ok: false, error: `请完整填写必填字段：${missing.join(", ")}` };
    }

    // 状态切换为「已发布」且未设置发布时间时，自动填充当前时间——仅对确实有
    // published_at 列的表生效（partners、downloads 这两张表没有这一列，
    // hasPublishedAt 显式设为 false，否则保存时会报 schema cache 找不到该列）
    const hasPublishedAt = config.hasPublishedAt ?? config.hasStatus;
    if (hasPublishedAt && payload.status === "published" && !payload.published_at) {
      payload.published_at = new Date().toISOString();
    }

    const supabase = await createClient();
    let resultId = id;
    let before: unknown = null;

    if (id) {
      const { data: existing } = await supabase.from(config.table).select("*").eq("id", id).maybeSingle();
      before = existing;
      const { error } = await supabase.from(config.table).update(payload).eq("id", id);
      if (error) return { ok: false, error: error.message };

      // 文件字段路径发生变化（替换视频 / PDF / 封面）：数据库已成功切换到新路径后，
      // 再清理旧对象，保证"先成功切换、再删旧文件"的顺序，旧文件在切换成功前始终保留。
      const storageSpec = ENTITY_STORAGE_FILES[entityKey];
      if (storageSpec && before) {
        const beforeRow = before as Record<string, unknown>;
        for (const col of storageSpec.pathColumns) {
          const oldPath = beforeRow[col];
          const newPath = payload[col];
          if (typeof oldPath === "string" && oldPath && oldPath !== newPath) {
            await removeStorageObject(storageSpec.bucket, oldPath);
          }
        }
      }
    } else {
      const { data, error } = await supabase.from(config.table).insert(payload).select("id").single();
      if (error) return { ok: false, error: error.message };
      resultId = data?.id as string;
    }

    const h = await headers();
    await writeAuditLog({
      actorId: admin.id,
      action: id ? `${entityKey}.update` : `${entityKey}.create`,
      entityTable: config.table,
      entityId: resultId,
      beforeJson: before,
      afterJson: payload,
      ipAddress: getRequestIp(h),
    });

    revalidatePath(`/admin/content/${entityKey}`);
    if (resultId) revalidatePath(`/admin/content/${entityKey}/${resultId}`);

    return { ok: true, id: resultId as string };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "保存失败" };
  }
}

/** 通用内容删除：需要 content.delete 权限（分会管理员默认不具备，仅内容管理员/超级管理员可删除） */
export async function deleteEntityRecord(entityKey: string, id: string): Promise<SimpleResult> {
  const config = getEntityConfig(entityKey);
  if (!config) return { ok: false, error: "未知内容类型" };

  try {
    const admin = await assertPermission("content.delete");
    const supabase = await createClient();

    const { data: before } = await supabase.from(config.table).select("*").eq("id", id).maybeSingle();
    const { error } = await supabase.from(config.table).delete().eq("id", id);
    if (error) {
      // 23503 = foreign_key_violation——例如删除一个仍有视频归属的视频分类
      // （category_id 设置了 on delete restrict），给出比原始 Postgres 报错更易懂的提示。
      if (error.code === "23503") {
        return { ok: false, error: "无法删除：仍有其他记录关联此项，请先处理关联数据后再删除" };
      }
      return { ok: false, error: error.message };
    }

    // 删除记录后，连带清理其专属文件（视频/PDF/封面）。这两类内容的文件与记录
    // 是一对一专属关系（不像 leadership_people.avatar_url 等可能被其他记录复用的
    // 公共素材），因此可以安全地随记录删除一并清理。
    const storageSpec = ENTITY_STORAGE_FILES[entityKey];
    if (storageSpec && before) {
      const beforeRow = before as Record<string, unknown>;
      for (const col of storageSpec.pathColumns) {
        const path = beforeRow[col];
        if (typeof path === "string" && path) {
          await removeStorageObject(storageSpec.bucket, path);
        }
      }
    }

    const h = await headers();
    await writeAuditLog({
      actorId: admin.id,
      action: `${entityKey}.delete`,
      entityTable: config.table,
      entityId: id,
      beforeJson: before,
      ipAddress: getRequestIp(h),
    });

    revalidatePath(`/admin/content/${entityKey}`);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "删除失败" };
  }
}

/** 交换两条记录的 sort_order（用于列表页的上移/下移排序按钮） */
export async function swapEntitySortOrder(
  entityKey: string,
  idA: string,
  sortA: number,
  idB: string,
  sortB: number
): Promise<SimpleResult> {
  const config = getEntityConfig(entityKey);
  if (!config || !config.hasSortOrder) return { ok: false, error: "该内容类型不支持排序" };

  try {
    const admin = await assertPermission("content.publish");
    const supabase = await createClient();

    const [{ error: errA }, { error: errB }] = await Promise.all([
      supabase.from(config.table).update({ sort_order: sortB }).eq("id", idA),
      supabase.from(config.table).update({ sort_order: sortA }).eq("id", idB),
    ]);
    if (errA || errB) return { ok: false, error: (errA || errB)?.message || "排序失败" };

    await writeAuditLog({
      actorId: admin.id,
      action: `${entityKey}.reorder`,
      entityTable: config.table,
      entityId: `${idA},${idB}`,
    });

    revalidatePath(`/admin/content/${entityKey}`);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "排序失败" };
  }
}
