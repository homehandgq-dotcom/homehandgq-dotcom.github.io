import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/admin";
import { createClient } from "@/lib/supabase/server";
import { Pagination } from "@/components/ui/Pagination";

export const dynamic = "force-dynamic";

interface AuditRow {
  id: string;
  action: string;
  entity_table: string;
  entity_id: string | null;
  ip_address: string | null;
  created_at: string;
  actor: { email: string; full_name: string | null } | null;
}

export default async function AuditLogPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const admin = await requireAdmin();
  if (!["super_admin", "viewer"].includes(admin.role.key)) redirect("/admin?error=forbidden");

  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page) || 1);
  const pageSize = 50;

  const supabase = await createClient();
  let query = supabase
    .from("audit_logs")
    .select("id, action, entity_table, entity_id, ip_address, created_at, actor:admin_users(email, full_name)", {
      count: "exact",
    });

  if (sp.action) query = query.ilike("action", `%${sp.action}%`);
  if (sp.entity_table) query = query.eq("entity_table", sp.entity_table);

  query = query.order("created_at", { ascending: false });
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  const { data, count } = await query.range(from, to);
  const rows = (data ?? []) as unknown as AuditRow[];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-navy-900">操作日志</h1>
        <p className="mt-1 text-sm text-ink-500">共 {count ?? rows.length} 条记录 · 仅记录，不可编辑或删除</p>
      </div>

      <form method="get" className="flex flex-wrap gap-3">
        <input name="action" defaultValue={sp.action} placeholder="按操作类型筛选，如 news.create" className="input max-w-xs" />
        <input name="entity_table" defaultValue={sp.entity_table} placeholder="按数据表筛选，如 news_posts" className="input max-w-xs" />
        <button type="submit" className="rounded bg-navy-900 px-4 py-2 text-sm font-semibold text-white">
          筛选
        </button>
      </form>

      <div className="overflow-x-auto rounded-lg border border-navy-100 bg-white">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead className="border-b border-navy-100 bg-mist text-xs font-semibold uppercase text-ink-500">
            <tr>
              <th className="px-3 py-3">时间</th>
              <th className="px-3 py-3">操作人</th>
              <th className="px-3 py-3">操作</th>
              <th className="px-3 py-3">数据表</th>
              <th className="px-3 py-3">记录 ID</th>
              <th className="px-3 py-3">IP</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-navy-100">
            {rows.map((r) => (
              <tr key={r.id} className="hover:bg-mist/60">
                <td className="whitespace-nowrap px-3 py-3 text-xs text-ink-500">
                  {new Date(r.created_at).toLocaleString("zh-CN")}
                </td>
                <td className="whitespace-nowrap px-3 py-3 text-ink-700">
                  {r.actor?.full_name || r.actor?.email || "系统"}
                </td>
                <td className="whitespace-nowrap px-3 py-3 font-mono text-xs text-navy-800">{r.action}</td>
                <td className="whitespace-nowrap px-3 py-3 text-ink-600">{r.entity_table}</td>
                <td className="whitespace-nowrap px-3 py-3 font-mono text-xs text-ink-400">
                  {(r.entity_id || "—").slice(0, 24)}
                </td>
                <td className="whitespace-nowrap px-3 py-3 text-xs text-ink-400">{r.ip_address || "—"}</td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={6} className="px-3 py-12 text-center text-sm text-ink-400">
                  暂无日志记录
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Pagination
        page={page}
        pageSize={pageSize}
        total={count ?? 0}
        buildHref={(p) => {
          const params = new URLSearchParams();
          if (sp.action) params.set("action", sp.action);
          if (sp.entity_table) params.set("entity_table", sp.entity_table);
          if (p > 1) params.set("page", String(p));
          const s = params.toString();
          return `/admin/audit-log${s ? `?${s}` : ""}`;
        }}
      />
    </div>
  );
}
