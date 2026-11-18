import Link from "next/link";
import { Users, FileClock, CheckCircle2, XCircle, Building2, User, CalendarDays, Inbox } from "lucide-react";
import { requireAdmin } from "@/lib/auth/admin";
import { getDashboardData } from "@/lib/admin/dashboardData";
import { StatCard } from "@/components/admin/StatCard";
import { TrendLineChart, SimpleBarChart, SimplePieChart } from "@/components/admin/charts/Charts";
import { formatDate } from "@/lib/utils/format";

export const dynamic = "force-dynamic";

const statusLabel: Record<string, string> = {
  draft: "草稿", submitted: "已提交", under_review: "审核中",
  more_info_required: "需补充信息", approved: "已批准", rejected: "未通过", archived: "已归档",
};

export default async function AdminDashboardPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  await requireAdmin();
  const data = await getDashboardData();
  const sp = await searchParams;

  return (
    <div className="space-y-8">
      {sp.error === "forbidden" && (
        <div className="rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          您的账号角色无权访问该页面。如需相应权限，请联系超级管理员调整。
        </div>
      )}
      <div>
        <h1 className="text-xl font-bold text-navy-900">总览 Dashboard</h1>
        <p className="mt-1 text-sm text-ink-500">协会运营数据一览</p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        <StatCard label="正式会员总数" value={data.totalMembers} icon={Users} />
        <StatCard label="本月新增申请" value={data.monthNewApplications} icon={FileClock} tone="gold" />
        <StatCard label="待审核" value={data.pendingReview} icon={FileClock} tone="gold" />
        <StatCard label="已批准" value={data.approved} icon={CheckCircle2} tone="green" />
        <StatCard label="被拒绝" value={data.rejected} icon={XCircle} tone="red" />
        <StatCard label="待处理联系信息" value={data.pendingContacts} icon={Inbox} />
        <StatCard label="企业会员申请数" value={data.corporateMembers} icon={Building2} />
        <StatCard label="个人会员申请数" value={data.individualMembers} icon={User} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ChartCard title="最近 30 天申请趋势">
          <TrendLineChart data={data.trend30d} dataKey="count" xKey="date" />
        </ChartCard>
        <ChartCard title="近 12 个月申请趋势">
          <TrendLineChart data={data.trend12m} dataKey="count" xKey="month" />
        </ChartCard>
        <ChartCard title="各会员类别申请分布">
          <SimplePieChart data={data.byMembershipType} dataKey="value" nameKey="label" />
        </ChartCard>
        <ChartCard title="各行业申请分布">
          <SimplePieChart data={data.byIndustry.filter((i) => i.value > 0)} dataKey="value" nameKey="label" />
        </ChartCard>
        <ChartCard title="各州申请分布">
          <SimpleBarChart data={data.byState} dataKey="value" xKey="key" />
        </ChartCard>
        <ChartCard title="各分会意向申请人数">
          <SimpleBarChart data={data.byChapter} dataKey="value" xKey="label" />
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-navy-100 bg-white p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-bold text-navy-900">最新申请</h2>
            <Link href="/admin/applications" className="text-xs font-semibold text-navy-700 hover:underline">
              查看全部 →
            </Link>
          </div>
          <ul className="divide-y divide-navy-100">
            {data.recentApplications.map((a) => (
              <li key={a.id} className="flex items-center justify-between py-2.5 text-sm">
                <div className="min-w-0">
                  <p className="truncate font-medium text-navy-900">
                    {a.real_name} {a.company_name_zh ? `· ${a.company_name_zh}` : ""}
                  </p>
                  <p className="text-xs text-ink-400">{a.application_no}</p>
                </div>
                <span className="shrink-0 rounded-full bg-navy-50 px-2.5 py-1 text-xs font-semibold text-navy-700">
                  {statusLabel[a.status] || a.status}
                </span>
              </li>
            ))}
            {data.recentApplications.length === 0 && <p className="py-6 text-center text-sm text-ink-400">暂无申请</p>}
          </ul>
        </div>

        <div className="rounded-lg border border-navy-100 bg-white p-5">
          <div className="mb-4 flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-gold-500" aria-hidden />
            <h2 className="text-sm font-bold text-navy-900">即将举行的活动</h2>
          </div>
          <ul className="divide-y divide-navy-100">
            {data.upcomingEvents.map((e) => (
              <li key={e.id} className="py-2.5 text-sm">
                <p className="font-medium text-navy-900">{e.title_zh}</p>
                <p className="text-xs text-ink-400">{formatDate(e.start_at, "zh")}</p>
              </li>
            ))}
            {data.upcomingEvents.length === 0 && <p className="py-6 text-center text-sm text-ink-400">暂无活动</p>}
          </ul>
        </div>
      </div>
    </div>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-navy-100 bg-white p-5">
      <h2 className="mb-3 text-sm font-bold text-navy-900">{title}</h2>
      {children}
    </div>
  );
}
