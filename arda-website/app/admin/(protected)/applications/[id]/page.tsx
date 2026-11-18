import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requirePermission } from "@/lib/auth/admin";
import { getApplicationById } from "@/lib/admin/applications";
import { ApplicationReviewPanel } from "@/components/admin/ApplicationReviewPanel";
import { Badge } from "@/components/ui/primitives";

export const dynamic = "force-dynamic";

export default async function ApplicationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requirePermission("applications.review");
  const { id } = await params;
  const app = await getApplicationById(id);
  if (!app) notFound();

  return (
    <div className="space-y-6">
      <Link href="/admin/applications" className="flex items-center gap-1.5 text-sm font-semibold text-navy-700">
        <ArrowLeft className="h-4 w-4" aria-hidden /> 返回列表
      </Link>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-navy-900">
            {app.real_name} {app.english_name ? `(${app.english_name})` : ""}
          </h1>
          <p className="mt-1 font-mono text-xs text-ink-500">{app.application_no}</p>
        </div>
        <Badge tone="navy">{app.status}</Badge>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <Section title="基本信息">
            <Field label="真实姓名" value={app.real_name} />
            <Field label="英文姓名" value={app.english_name} />
            <Field label="手机" value={app.phone} />
            <Field label="邮箱" value={app.email} />
            <Field label="公司（中）" value={app.company_name_zh} />
            <Field label="公司（英）" value={app.company_name_en} />
            <Field label="职位" value={app.title} />
            <Field label="会员类型" value={app.membership_types?.name_zh} />
            <Field label="州" value={app.state} />
            <Field label="城市" value={app.city} />
            <Field label="公司地址" value={app.company_address} />
            <Field label="公司网站" value={app.company_website} />
            <Field label="社交媒体" value={app.social_media} />
          </Section>

          <Section title="行业信息">
            <Field label="行业分类" value={app.industries?.name_zh} />
            <Field label="企业类型" value={app.business_type} />
            <Field label="企业规模" value={app.company_size} />
            <Field label="门店数量" value={app.store_count} />
            <Field label="员工数量" value={app.employee_count} />
            <Field label="成立年份" value={app.founded_year} />
            <Field label="服务区域" value={app.service_area} />
            <Field label="意向分会" value={app.chapters?.name_zh} />
            <Field label="推荐人" value={app.referrer} />
          </Section>

          {app.bio && (
            <Section title="简介">
              <p className="text-sm leading-relaxed text-ink-700">{app.bio}</p>
            </Section>
          )}

          {app.remarks && (
            <Section title="备注">
              <p className="text-sm leading-relaxed text-ink-700">{app.remarks}</p>
            </Section>
          )}

          <Section title="确认信息">
            <Field label="同意隐私政策" value={app.agree_privacy ? "是" : "否"} />
            <Field label="同意协会联系" value={app.agree_contact ? "是" : "否"} />
            <Field label="信息真实性确认" value={app.confirm_accuracy ? "是" : "否"} />
            <Field label="电子签名" value={app.e_signature} />
            <Field label="提交时间" value={app.submitted_at ? new Date(app.submitted_at).toLocaleString("zh-CN") : "—"} />
            <Field label="IP 地址" value={app.ip_address} />
          </Section>
        </div>

        <ApplicationReviewPanel
          applicationId={app.id}
          currentStatus={app.status}
          currentNotes={app.internal_notes}
          currentRejectionReason={app.rejection_reason}
        />
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-navy-100 bg-white p-6">
      <h2 className="mb-4 text-sm font-bold text-navy-900">{title}</h2>
      <dl className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">{children}</dl>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string | number | null | undefined }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wide text-ink-400">{label}</dt>
      <dd className="mt-0.5 text-sm text-navy-900">{value ?? "—"}</dd>
    </div>
  );
}
