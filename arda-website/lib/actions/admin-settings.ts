"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { assertPermission } from "@/lib/auth/admin";
import { writeAuditLog, getRequestIp } from "@/lib/utils/audit";

type ActionResult = { ok: true } | { ok: false; error: string };

export async function updateSiteSetting(key: string, rawJson: string): Promise<ActionResult> {
  let parsedValue: unknown;
  try {
    parsedValue = JSON.parse(rawJson);
  } catch {
    return { ok: false, error: "JSON 格式不正确，请检查语法（引号、逗号、括号是否配对）" };
  }

  try {
    const admin = await assertPermission("content.publish");
    const supabase = await createClient();

    const { data: before } = await supabase.from("site_settings").select("*").eq("key", key).maybeSingle();
    const { error } = await supabase.from("site_settings").update({ value_json: parsedValue }).eq("key", key);
    if (error) return { ok: false, error: error.message };

    const h = await headers();
    await writeAuditLog({
      actorId: admin.id,
      action: "site_settings.update",
      entityTable: "site_settings",
      entityId: key,
      beforeJson: before,
      afterJson: parsedValue,
      ipAddress: getRequestIp(h),
    });

    revalidatePath("/admin/site-settings");
    revalidatePath(`/admin/site-settings/${key}`);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "保存失败" };
  }
}
