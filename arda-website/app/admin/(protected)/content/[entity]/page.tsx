import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { Plus } from "lucide-react";
import { requirePermission, roleHasPermission } from "@/lib/auth/admin";
import { getEntityConfig } from "@/lib/admin/entityRegistry";
import { createClient } from "@/lib/supabase/server";
import { EntityTable } from "@/components/admin/EntityTable";
import { Pagination } from "@/components/ui/Pagination";

export const dynamic = "force-dynamic";

export default async function EntityListPage({
  params,
  searchParams,
}: {
  params: Promise<{ entity: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const admin = await requirePermission("content.publish");
  const { entity } = await params;
  const config = getEntityConfig(entity);
  if (!config) notFound();
  if (!config.allowedRoles.includes(admin.role.key)) {
    redirect("/admin?error=forbidden");
  }

  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page) || 1);
  const pageSize = 20;

  const supabase = await createClient();
  let query = supabase.from(config.table).select(config.selectQuery, { count: "exact" });

  if (config.key === "chapters" && admin.role.key === "chapter_admin" && admin.assigned_chapter_id) {
    query = query.eq("id", admin.assigned_chapter_id);
  }

  if (sp.q && config.searchColumns.length > 0) {
    const q = sp.q.replace(/[%,]/g, "");
    query = query.or(config.searchColumns.map((col) => `${col}.ilike.%${q}%`).join(","));
  }

  const ascending = config.defaultOrderBy === "sort_order" || config.defaultOrderBy === "group";
  query = query.order(config.defaultOrderBy, { ascending });

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  const { data, count, error } = await query.range(from, to);
  if (error) console.error(`[EntityListPage:${entity}]`, error);
  // 临时排查用：把查询报错直接显示在页面上（而不是只写进服务器日志），
  // 方便管理员截图反馈，不需要去 Vercel 后台翻日志
  const queryErrorMessage = error
    ? [error.message, error.details, error.hint].filter(Boolean).join(" | ") || "未知错误"
    : null;

  const rows = (data ?? []) as unknown as { id: string; sort_order?: number; [key: string]: unknown }[];

  // "导航菜单"的"上级菜单"列不走 PostgREST 的外键关联嵌套查询（见 entityRegistry.ts
  // 里的说明——那个写法依赖数据库外键关系被接口层正确识别，曾经因为接口缓存没
  // 跟上而导致整个列表报错）。这里改成单独查一次纯 id/label_zh，在代码里拼出
  // "上级菜单"这一列，不依赖任何数据库端的关联关系是否被识别。
  if (config.key === "navigation" && rows.length > 0) {
    const { data: allNavItems } = await supabase.from("navigation_items").select("id, label_zh");
    const labelById = new Map((allNavItems ?? []).map((n) => [n.id as string, n.label_zh as string]));
    for (const row of rows) {
      const parentId = row.parent_id as string | null | undefined;
      row.parent = parentId && labelById.has(parentId) ? { label_zh: labelById.get(parentId) } : null;
    }
  }

  const total = count ?? 0;

  const qs = new URLSearchParams();
  if (sp.q) qs.set("q", sp.q);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-navy-900">{config.labelZh}</h1>
          <p className="mt-1 text-sm text-ink-500">共 {total} 条记录</p>
        </div>
        {!(config.key === "chapters" && admin.role.key === "chapter_admin") && (
          <Link
            href={`/admin/content/${entity}/new`}
            className="flex items-center gap-1.5 rounded bg-navy-900 px-4 py-2.5 text-sm font-bold text-white hover:bg-navy-800"
          >
            <Plus className="h-4 w-4" aria-hidden /> 新建
          </Link>
        )}
      </div>

      {queryErrorMessage && (
        <div className="rounded-lg border border-red-300 bg-red-50 p-4 text-sm text-red-800">
          <p className="font-bold">数据查询失败（这就是列表显示为空的原因）：</p>
          <p className="mt-1 break-all font-mono text-xs">{queryErrorMessage}</p>
        </div>
      )}

      <form method="get" className="flex gap-3">
        <input
          name="q"
          defaultValue={sp.q}
          placeholder="搜索标题 / Slug"
          className="input max-w-sm"
        />
        <button type="submit" className="rounded bg-navy-900 px-4 py-2 text-sm font-semibold text-white">
          搜索
        </button>
      </form>

      <EntityTable
        config={config}
        rows={rows}
        canDelete={roleHasPermission(admin.role.key, "content.delete")}
        canReorder={roleHasPermission(admin.role.key, "content.publish")}
      />

      <Pagination
        page={page}
        pageSize={pageSize}
        total={total}
        buildHref={(p) => {
          const params = new URLSearchParams(qs);
          if (p > 1) params.set("page", String(p));
          else params.delete("page");
          const s = params.toString();
          return `/admin/content/${entity}${s ? `?${s}` : ""}`;
        }}
      />
    </div>
  );
}
