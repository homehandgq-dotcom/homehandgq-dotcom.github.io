import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

export async function writeAuditLog(params: {
  actorId: string | null;
  action: string;
  entityTable: string;
  entityId?: string | null;
  beforeJson?: unknown;
  afterJson?: unknown;
  ipAddress?: string | null;
}) {
  try {
    const admin = createAdminClient();
    await admin.from("audit_logs").insert({
      actor_id: params.actorId,
      action: params.action,
      entity_table: params.entityTable,
      entity_id: params.entityId ?? null,
      before_json: params.beforeJson ?? null,
      after_json: params.afterJson ?? null,
      ip_address: params.ipAddress ?? null,
    });
  } catch (err) {
    // 审计日志写入失败不应阻断主流程，但要在服务端留痕以便排查
    console.error("[audit_log] failed to write:", err);
  }
}

export function getRequestIp(headers: Headers): string | null {
  return (
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headers.get("x-real-ip") ||
    null
  );
}
