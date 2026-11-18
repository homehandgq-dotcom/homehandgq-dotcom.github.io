import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { FileText, Lock, Download as DownloadIcon } from "lucide-react";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { listDownloads } from "@/lib/data/downloads";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { PageHero } from "@/components/site/PageHero";
import { Container, EmptyState, Badge } from "@/components/ui/primitives";
import type { Download } from "@/lib/supabase/types";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = (isLocale(rawLocale) ? rawLocale : "zh") as Locale;
  return { title: locale === "zh" ? "资源中心" : "Resources" };
}

const categories: { key: Download["category"]; zh: string; en: string }[] = [
  { key: "industry_report", zh: "行业报告", en: "Industry Reports" },
  { key: "policy_update", zh: "政策更新", en: "Policy Updates" },
  { key: "restaurant_resource", zh: "餐饮资源", en: "Restaurant Resources" },
  { key: "member_resource", zh: "会员资源", en: "Member Resources" },
  { key: "general", zh: "其他文件", en: "General" },
];

export default async function ResourcesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  if (!isLocale(rawLocale)) notFound();
  const locale = rawLocale as Locale;
  const dict = getDictionary(locale);
  const all = await listDownloads();

  return (
    <>
      <Breadcrumbs locale={locale} items={[{ label: locale === "zh" ? "资源中心" : "Resources" }]} />
      <PageHero
        kicker="Resources"
        title={locale === "zh" ? "资源中心" : "Resources"}
        desc={
          locale === "zh"
            ? "行业报告、政策更新与协会文件下载。标注「仅会员可见」的资源需完成会员申请审核后获取访问权限。"
            : "Industry reports, policy updates and Association documents. Items marked \"Member Only\" require an approved membership to access."
        }
      />
      <Container className="space-y-14 py-14 lg:py-20">
        {categories.map((cat) => {
          const items = all.filter((d) => d.category === cat.key);
          if (items.length === 0) return null;
          return (
            <div key={cat.key}>
              <h2 className="mb-6 text-lg font-bold text-navy-900">{locale === "zh" ? cat.zh : cat.en}</h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {items.map((d) => (
                  <div key={d.id} className="flex items-start gap-4 rounded-lg border border-navy-100 bg-white p-5">
                    <FileText className="mt-0.5 h-5 w-5 shrink-0 text-gold-500" aria-hidden />
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-navy-900">{locale === "zh" ? d.title_zh : d.title_en}</p>
                      {(d.description_zh || d.description_en) && (
                        <p className="mt-1 line-clamp-2 text-sm text-ink-600">
                          {locale === "zh" ? d.description_zh : d.description_en}
                        </p>
                      )}
                      <div className="mt-3 flex items-center gap-3">
                        {d.access_level === "member_only" ? (
                          <Badge tone="gold">
                            <Lock className="mr-1 inline h-3 w-3" aria-hidden />
                            {locale === "zh" ? "仅会员可见" : "Member Only"}
                          </Badge>
                        ) : (
                          <a
                            href={d.file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 text-sm font-semibold text-navy-700 hover:underline"
                          >
                            <DownloadIcon className="h-4 w-4" aria-hidden />
                            {locale === "zh" ? "下载" : "Download"}
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        {all.length === 0 && (
          <EmptyState
            title={locale === "zh" ? "资源筹备中" : "Resources coming soon"}
            desc={locale === "zh" ? "协会将陆续发布行业报告与相关文件。" : "Industry reports and documents will be published here."}
          />
        )}
      </Container>
    </>
  );
}
