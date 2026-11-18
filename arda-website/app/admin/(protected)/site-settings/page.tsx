import Link from "next/link";
import { requirePermission } from "@/lib/auth/admin";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function SiteSettingsPage() {
  await requirePermission("content.publish");

  // 临时诊断：数据库查询失败（不管是原本的 Supabase 报错，还是极少见的网络层
  // 异常）都不让整个页面崩溃变成"无法加载"的空白页，而是把具体错误信息显示
  // 在页面上，方便直接截图反馈定位问题
  let data: { key: string; description: string | null }[] = [];
  let queryErrorMessage: string | null = null;
  try {
    const supabase = await createClient();
    const { data: rows, error } = await supabase.from("site_settings").select("*").order("key", { ascending: true });
    if (error) throw error;
    data = rows ?? [];
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-navy-900">站点设置</h1>
        <p className="mt-1 text-sm text-ink-500">
          以键值对方式管理首页统计数字、首屏文案、联系方式、SEO 默认值等结构化站点内容；每项以 JSON 编辑。
        </p>
      </div>

      {queryErrorMessage && (
        <div className="rounded-lg border border-red-300 bg-red-50 p-4 text-sm text-red-800">
          <p className="font-bold">数据查询失败（这就是列表显示为空的原因）：</p>
          <p className="mt-1 break-all font-mono text-xs">{queryErrorMessage}</p>
        </div>
      )}

      <div className="overflow-hidden rounded-lg border border-navy-100 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-navy-100 bg-mist text-xs font-semibold uppercase text-ink-500">
            <tr>
              <th className="px-4 py-3">键 Key</th>
              <th className="px-4 py-3">说明</th>
              <th className="px-4 py-3">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-navy-100">
            {(data ?? []).map((row) => (
              <tr key={row.key} className="hover:bg-mist/60">
                <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-navy-900">{row.key}</td>
                <td className="px-4 py-3 text-ink-600">{row.description || "—"}</td>
                <td className="whitespace-nowrap px-4 py-3">
                  <Link
                    href={`/admin/site-settings/${encodeURIComponent(row.key)}`}
                    className="font-semibold text-navy-700 hover:underline"
                  >
                    编辑
                  </Link>
                </td>
              </tr>
            ))}
            {(data ?? []).length === 0 && (
              <tr>
                <td colSpan={3} className="px-4 py-12 text-center text-sm text-ink-400">
                  暂无站点设置项
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
