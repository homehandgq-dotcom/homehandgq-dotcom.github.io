import { Download, Printer } from "lucide-react";
import { requirePermission } from "@/lib/auth/admin";
import { listApplicationsAdmin } from "@/lib/admin/applications";
import { listMembershipTypes, listIndustries } from "@/lib/data/membership";
import { listChapters } from "@/lib/data/chapters";
import { ApplicationsTable } from "@/components/admin/ApplicationsTable";
import { Pagination } from "@/components/ui/Pagination";
import type { ApplicationStatus } from "@/lib/supabase/types";

export const dynamic = "force-dynamic";

const STATUS_OPTIONS: { key: ApplicationStatus | "all"; label: string }[] = [
  { key: "all", label: "全部状态" },
  { key: "submitted", label: "已提交" },
  { key: "under_review", label: "审核中" },
  { key: "more_info_required", label: "需补充信息" },
  { key: "approved", label: "已批准" },
  { key: "rejected", label: "未通过" },
  { key: "archived", label: "已归档" },
];

export default async function AdminApplicationsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const admin = await requirePermission("applications.review");
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page) || 1);

  const filters = {
    q: sp.q,
    status: (sp.status as ApplicationStatus | "all") || "all",
    state: sp.state,
    industryId: sp.industryId,
    membershipTypeId: sp.membershipTypeId,
    chapterId: sp.chapterId,
    page,
    pageSize: 20,
  };

  const [{ items, total, pageSize }, membershipTypes, industries, chapters] = await Promise.all([
    listApplicationsAdmin(filters),
    listMembershipTypes(),
    listIndustries(),
    listChapters(),
  ]);

  const qs = new URLSearchParams();
  Object.entries(sp).forEach(([k, v]) => {
    if (v && k !== "page") qs.set(k, v);
  });
  const exportQs = qs.toString();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-navy-900">会员申请管理</h1>
          <p className="mt-1 text-sm text-ink-500">共 {total} 条记录（当前筛选条件下）</p>
        </div>
        <div className="flex gap-2">
          <a
            href={`/api/admin/applications/export?${exportQs}${exportQs ? "&" : ""}format=csv`}
            className="flex items-center gap-1.5 rounded border border-navy-200 px-4 py-2 text-sm font-semibold text-navy-800 hover:bg-navy-50"
          >
            <Download className="h-4 w-4" aria-hidden /> 导出 CSV
          </a>
          <a
            href={`/api/admin/applications/export?${exportQs}${exportQs ? "&" : ""}format=xlsx`}
            className="flex items-center gap-1.5 rounded border border-navy-200 px-4 py-2 text-sm font-semibold text-navy-800 hover:bg-navy-50"
          >
            <Download className="h-4 w-4" aria-hidden /> 导出 Excel
          </a>
          <a
            href="#"
            className="hidden items-center gap-1.5 rounded border border-navy-200 px-4 py-2 text-sm font-semibold text-navy-800 hover:bg-navy-50 print:flex"
          >
            <Printer className="h-4 w-4" aria-hidden /> 打印
          </a>
        </div>
      </div>

      <form method="get" className="grid grid-cols-2 gap-3 rounded-lg border border-navy-100 bg-white p-4 sm:grid-cols-3 lg:grid-cols-6">
        <input
          name="q"
          defaultValue={sp.q}
          placeholder="搜索姓名/邮箱/电话/公司/编号"
          className="input col-span-2 lg:col-span-2"
        />
        <select name="status" defaultValue={filters.status} className="input">
          {STATUS_OPTIONS.map((o) => (
            <option key={o.key} value={o.key}>
              {o.label}
            </option>
          ))}
        </select>
        <select name="membershipTypeId" defaultValue={sp.membershipTypeId || ""} className="input">
          <option value="">全部会员类型</option>
          {membershipTypes.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name_zh}
            </option>
          ))}
        </select>
        <select name="industryId" defaultValue={sp.industryId || ""} className="input">
          <option value="">全部行业</option>
          {industries.map((i) => (
            <option key={i.id} value={i.id}>
              {i.name_zh}
            </option>
          ))}
        </select>
        <select name="chapterId" defaultValue={sp.chapterId || ""} className="input">
          <option value="">全部分会</option>
          {chapters.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name_zh}
            </option>
          ))}
        </select>
        <button type="submit" className="rounded bg-navy-900 px-4 py-2 text-sm font-semibold text-white">
          筛选
        </button>
      </form>

      <ApplicationsTable
        rows={items as never}
        canDelete={admin.role.key === "super_admin" || admin.role.key === "membership_admin"}
      />

      <Pagination
        page={page}
        pageSize={pageSize}
        total={total}
        buildHref={(p) => {
          const params = new URLSearchParams(exportQs);
          if (p > 1) params.set("page", String(p));
          else params.delete("page");
          const s = params.toString();
          return `/admin/applications${s ? `?${s}` : ""}`;
        }}
      />
    </div>
  );
}
