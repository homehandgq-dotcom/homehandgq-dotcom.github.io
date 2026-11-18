"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { assertPermission } from "@/lib/auth/admin";
import { writeAuditLog, getRequestIp } from "@/lib/utils/audit";

type ActionResult = { ok: true } | { ok: false; error: string };

const memberUpdateSchema = z.object({
  id: z.string().uuid(),
  membership_type_id: z.string().uuid(),
  display_name_zh: z.string().min(1),
  display_name_en: z.string().min(1),
  company_name_zh: z.string().optional(),
  company_name_en: z.string().optional(),
  logo_url: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  industry_id: z.string().optional(),
  website: z.string().optional(),
  is_public: z.boolean(),
  status: z.enum(["active", "inactive", "expired"]),
});

export async function updateMember(raw: unknown): Promise<ActionResult> {
  const parsed = memberUpdateSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: "参数校验失败" };

  try {
    const admin = await assertPermission("applications.review");
    const supabase = await createClient();

    const { id, ...rest } = parsed.data;
    const payload = {
      ...rest,
      industry_id: rest.industry_id || null,
      logo_url: rest.logo_url || null,
      website: rest.website || null,
    };

    const { data: before } = await supabase.from("members").select("*").eq("id", id).maybeSingle();
    const { error } = await supabase.from("members").update(payload).eq("id", id);
    if (error) return { ok: false, error: error.message };

    const h = await headers();
    await writeAuditLog({
      actorId: admin.id,
      action: "members.update",
      entityTable: "members",
      entityId: id,
      beforeJson: before,
      afterJson: payload,
      ipAddress: getRequestIp(h),
    });

    revalidatePath("/admin/members");
    revalidatePath(`/admin/members/${id}`);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "保存失败" };
  }
}

export async function deleteMember(id: string): Promise<ActionResult> {
  try {
    const admin = await assertPermission("applications.delete");
    const supabase = await createClient();

    const { data: before } = await supabase.from("members").select("*").eq("id", id).maybeSingle();
    const { error } = await supabase.from("members").delete().eq("id", id);
    if (error) return { ok: false, error: error.message };

    const h = await headers();
    await writeAuditLog({
      actorId: admin.id,
      action: "members.delete",
      entityTable: "members",
      entityId: id,
      beforeJson: before,
      ipAddress: getRequestIp(h),
    });

    revalidatePath("/admin/members");
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "删除失败" };
  }
}
