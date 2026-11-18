import { NextResponse } from "next/server";
import Papa from "papaparse";
import { requirePermissionApi } from "@/lib/auth/apiGuard";
import { createClient } from "@/lib/supabase/server";
import { writeAuditLog, getRequestIp } from "@/lib/utils/audit";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const guard = await requirePermissionApi("content.publish");
  if (!guard.ok) return guard.response;

  const supabase = await createClient();
  const { data } = await supabase
    .from("newsletter_subscribers")
    .select("email, locale_pref, is_confirmed, subscribed_at")
    .order("subscribed_at", { ascending: false });

  const rows = (data ?? []).map((r) => ({
    email: r.email,
    locale_pref: r.locale_pref,
    is_confirmed: r.is_confirmed ? "是" : "否",
    subscribed_at: new Date(r.subscribed_at).toLocaleString("zh-CN"),
  }));

  await writeAuditLog({
    actorId: guard.admin.id,
    action: "newsletter.export",
    entityTable: "newsletter_subscribers",
    afterJson: { count: rows.length },
    ipAddress: getRequestIp(request.headers),
  });

  const csv = Papa.unparse({
    fields: ["邮箱", "语言偏好", "已确认", "订阅时间"],
    data: rows.map((r) => [r.email, r.locale_pref === "zh" ? "中文" : "English", r.is_confirmed, r.subscribed_at]),
  });
  const bom = "﻿";
  const filename = `arda-newsletter-${new Date().toISOString().slice(0, 10)}.csv`;

  return new NextResponse(bom + csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
