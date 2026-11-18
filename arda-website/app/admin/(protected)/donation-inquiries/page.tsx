import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/admin";
import { createClient } from "@/lib/supabase/server";
import { DonationInquiriesInbox, type DonationRow } from "@/components/admin/DonationInquiriesInbox";

export const dynamic = "force-dynamic";

export default async function DonationInquiriesPage() {
  const admin = await requireAdmin();
  if (!["super_admin", "membership_admin"].includes(admin.role.key)) {
    redirect("/admin?error=forbidden");
  }

  // 临时诊断：数据库查询失败时不让整个页面崩溃变成"无法加载"的空白页，
  // 而是把具体错误信息显示在页面上，方便直接截图反馈定位问题
  let data: unknown[] | null = null;
  let count: number | null = null;
  let queryErrorMessage: string | null = null;
  try {
    const supabase = await createClient();
    const res = await supabase
      .from("donations_or_sponsorship_inquiries")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .limit(100);
    if (res.error) throw res.error;
    data = res.data;
    count = res.count;
  } catch (err) {
    queryErrorMessage =
      err && typeof err === "object" && "message" in err
        ? [
            (err as { message?: string }).message,
            (err as { details?: string }).details,
            (err as { hint?: string }).hint,
          ]
            .filter(Boolean)
            .join(" | ")
        : err instanceof Error
          ? err.message
          : "未知错误";
  }

  const rows = (data ?? []) as unknown as DonationRow[];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-navy-900">捐赠与赞助意向</h1>
        <p className="mt-1 text-sm text-ink-500">
          共 {count ?? rows.length} 条记录 · 协会现阶段未开通线上收款，本页仅用于记录意向并由工作人员后续联系
        </p>
      </div>

      {queryErrorMessage && (
        <div className="rounded-lg border border-red-300 bg-red-50 p-4 text-sm text-red-800">
          <p className="font-bold">数据查询失败（这就是列表显示为空的原因）：</p>
          <p className="mt-1 break-all font-mono text-xs">{queryErrorMessage}</p>
        </div>
      )}

      <DonationInquiriesInbox rows={rows} canDelete={admin.role.key === "super_admin"} />
    </div>
  );
}
