"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/auth/admin";
import { writeAuditLog, getRequestIp } from "@/lib/utils/audit";

type ActionResult = { ok: true } | { ok: false; error: string };

const ROLE_KEYS = ["super_admin", "content_admin", "membership_admin", "chapter_admin", "viewer"] as const;

const createSchema = z.object({
  email: z.string().email(),
  full_name: z.string().min(1),
  password: z.string().min(8, "密码至少 8 位"),
  role_key: z.enum(ROLE_KEYS),
  assigned_chapter_id: z.string().optional(),
});

/** 仅超级管理员可创建后台账号：写入 auth.users（Service Role）+ admin_users 资料行 */
export async function createAdminUser(raw: unknown): Promise<ActionResult> {
  const parsed = createSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message || "参数校验失败" };

  try {
    const actor = await requireAdmin();
    if (actor.role.key !== "super_admin") return { ok: false, error: "仅超级管理员可创建后台账号" };

    const { email, full_name, password, role_key, assigned_chapter_id } = parsed.data;
    const admin = createAdminClient();

    const { data: roleRow } = await admin.from("roles").select("id").eq("key", role_key).maybeSingle();
    if (!roleRow) return { ok: false, error: "角色不存在" };

    const { data: created, error: createErr } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });
    if (createErr || !created.user) return { ok: false, error: createErr?.message || "创建登录账号失败" };

    const { error: insertErr } = await admin.from("admin_users").insert({
      id: created.user.id,
      email,
      full_name,
      role_id: roleRow.id,
      assigned_chapter_id: role_key === "chapter_admin" ? assigned_chapter_id || null : null,
      is_active: true,
    });
    if (insertErr) {
      // 回滚：资料行写入失败时删除刚创建的登录账号，避免产生无资料的孤立账号
      await admin.auth.admin.deleteUser(created.user.id);
      return { ok: false, error: insertErr.message };
    }

    const h = await headers();
    await writeAuditLog({
      actorId: actor.id,
      action: "admin_users.create",
      entityTable: "admin_users",
      entityId: created.user.id,
      afterJson: { email, full_name, role_key },
      ipAddress: getRequestIp(h),
    });

    revalidatePath("/admin/users");
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "创建失败" };
  }
}

const updateSchema = z.object({
  id: z.string().uuid(),
  role_key: z.enum(ROLE_KEYS),
  assigned_chapter_id: z.string().optional(),
  is_active: z.boolean(),
});

export async function updateAdminUser(raw: unknown): Promise<ActionResult> {
  const parsed = updateSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: "参数校验失败" };

  try {
    const actor = await requireAdmin();
    if (actor.role.key !== "super_admin") return { ok: false, error: "仅超级管理员可修改账号" };
    if (parsed.data.id === actor.id && !parsed.data.is_active) {
      return { ok: false, error: "不能停用自己的账号" };
    }

    const supabase = await createClient();
    const { data: roleRow } = await supabase.from("roles").select("id").eq("key", parsed.data.role_key).maybeSingle();
    if (!roleRow) return { ok: false, error: "角色不存在" };

    const { data: before } = await supabase.from("admin_users").select("*").eq("id", parsed.data.id).maybeSingle();
    const { error } = await supabase
      .from("admin_users")
      .update({
        role_id: roleRow.id,
        assigned_chapter_id: parsed.data.role_key === "chapter_admin" ? parsed.data.assigned_chapter_id || null : null,
        is_active: parsed.data.is_active,
      })
      .eq("id", parsed.data.id);
    if (error) return { ok: false, error: error.message };

    const h = await headers();
    await writeAuditLog({
      actorId: actor.id,
      action: "admin_users.update",
      entityTable: "admin_users",
      entityId: parsed.data.id,
      beforeJson: before,
      afterJson: parsed.data,
      ipAddress: getRequestIp(h),
    });

    revalidatePath("/admin/users");
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "保存失败" };
  }
}
