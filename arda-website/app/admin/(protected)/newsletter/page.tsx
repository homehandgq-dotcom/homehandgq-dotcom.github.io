import { redirect } from "next/navigation";
import { Download } from "lucide-react";
import { requireAdmin } from "@/lib/auth/admin";
import { createClient } from "@/lib/supabase/server";
import { NewsletterInbox, type SubscriberRow } from "@/components/admin/NewsletterInbox";

export const dynamic = "force-dynamic";

export default async function NewsletterPage() {
  const admin = await requireAdmin();
  if (!["super_admin", "content_admin"].includes(admin.role.key)) {
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
      .from("newsletter_subscribers")
      .select("*", { count: "exact" })
      .order("subscribed_at", { ascending: false })
      .limit(500);
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

  const rows = (data ?? []) as unknown as SubscriberRow[];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-navy-900">订阅名单</h1>
          <p className="mt-1 text-sm text-ink-500">共 {count ?? rows.length} 位订阅者</p>
        </div>
        <a
          href="/api/admin/newsletter/export"
          className="flex items-center gap-1.5 rounded border border-navy-200 px-4 py-2 text-sm font-semibold text-navy-800 hover:bg-navy-50"
        >
          <Download className="h-4 w-4" aria-hidden /> 导出 CSV
        </a>
      </div>

      {queryErrorMessage && (
        <div className="rounded-lg border border-red-300 bg-red-50 p-4 text-sm text-red-800">
          <p className="font-bold">数据查询失败（这就是列表显示为空的原因）：</p>
          <p className="mt-1 break-all font-mono text-xs">{queryErrorMessage}</p>
        </div>
      )}

      <NewsletterInbox rows={rows} canDelete={true} />
    </div>
  );
}
