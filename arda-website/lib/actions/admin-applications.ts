"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { assertPermission } from "@/lib/auth/admin";
import { writeAuditLog, getRequestIp } from "@/lib/utils/audit";
import type { ApplicationStatus } from "@/lib/supabase/types";

type ActionResult = { ok: true } | { ok: false; error: string };

const statusUpdateSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(["draft", "submitted", "under_review", "more_info_required", "approved", "rejected", "archived"]),
  internal_notes: z.string().max(5000).optional(),
  rejection_reason: z.string().max(2000).optional(),
});

export async function updateApplicationStatus(raw: unknown): Promise<ActionResult> {
  const parsed = statusUpdateSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: "参数校验失败" };

  try {
    const admin = await assertPermission("applications.review");
    const supabase = await createClient();

    const { data: before } = await supabase
      .from("member_applications")
      .select("status, internal_notes, rejection_reason")
      .eq("id", parsed.data.id)
      .maybeSingle();

    const { error } = await supabase
      .from("member_applications")
      .update({
        status: parsed.data.status as ApplicationStatus,
        internal_notes: parsed.data.internal_notes,
        rejection_reason: parsed.data.status === "rejected" ? parsed.data.rejection_reason : null,
        reviewed_by: admin.id,
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", parsed.data.id);

    if (error) return { ok: false, error: error.message };

    const h = await headers();
    await writeAuditLog({
      actorId: admin.id,
      action: "application.status_change",
      entityTable: "member_applications",
      entityId: parsed.data.id,
      beforeJson: before,
      afterJson: { status: parsed.data.status, internal_notes: parsed.data.internal_notes },
      ipAddress: getRequestIp(h),
    });

    revalidatePath("/admin/applications");
    revalidatePath(`/admin/applications/${parsed.data.id}`);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "操作失败" };
  }
}

export async function bulkUpdateApplicationStatus(
  ids: string[],
  status: ApplicationStatus
): Promise<ActionResult> {
  try {
    const admin = await assertPermission("applications.review");
    if (ids.length === 0) return { ok: false, error: "未选择任何记录" };

    const supabase = await createClient();
    const { error } = await supabase
      .from("member_applications")
      .update({ status, reviewed_by: admin.id, reviewed_at: new Date().toISOString() })
      .in("id", ids);

    if (error) return { ok: false, error: error.message };

    const h = await headers();
    await writeAuditLog({
      actorId: admin.id,
      action: "application.bulk_status_change",
      entityTable: "member_applications",
      entityId: ids.join(","),
      afterJson: { status, count: ids.length },
      ipAddress: getRequestIp(h),
    });

    revalidatePath("/admin/applications");
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "操作失败" };
  }
}

export async function deleteApplication(id: string): Promise<ActionResult> {
  try {
    const admin = await assertPermission("applications.delete");
    const supabase = await createClient();

    const { data: before } = await supabase.from("member_applications").select("*").eq("id", id).maybeSingle();
    const { error } = await supabase.from("member_applications").delete().eq("id", id);
    if (error) return { ok: false, error: error.message };

    const h = await headers();
    await writeAuditLog({
      actorId: admin.id,
      action: "application.delete",
      entityTable: "member_applications",
      entityId: id,
      beforeJson: before,
      ipAddress: getRequestIp(h),
    });

    revalidatePath("/admin/applications");
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "操作失败" };
  }
}

/** 将已批准的申请转为正式会员（写入 members 表） */
export async function convertApplicationToMember(id: string, isPublic: boolean): Promise<ActionResult> {
  try {
    const admin = await assertPermission("applications.review");
    const supabase = await createClient();

    const { data: application } = await supabase
      .from("member_applications")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (!application) return { ok: false, error: "申请不存在" };
    if (application.status !== "approved") return { ok: false, error: "仅已批准的申请可转为正式会员" };
    if (!application.membership_type_id) return { ok: false, error: "缺少会员类型" };

    const { error } = await supabase.from("members").upsert(
      {
        application_id: application.id,
        membership_type_id: application.membership_type_id,
        display_name_zh: application.real_name,
        display_name_en: application.english_name || application.real_name,
        company_name_zh: application.company_name_zh,
        company_name_en: application.company_name_en,
        logo_url: application.logo_url,
        city: application.city,
        state: application.state,
        industry_id: application.industry_id,
        website: application.company_website,
        is_public: isPublic,
        status: "active",
      },
      { onConflict: "application_id" }
    );

    if (error) return { ok: false, error: error.message };

    const h = await headers();
    await writeAuditLog({
      actorId: admin.id,
      action: "application.convert_to_member",
      entityTable: "members",
      entityId: id,
      ipAddress: getRequestIp(h),
    });

    revalidatePath("/admin/members");
    revalidatePath(`/admin/applications/${id}`);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "操作失败" };
  }
}
