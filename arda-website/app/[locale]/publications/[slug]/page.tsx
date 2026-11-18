import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Download } from "lucide-react";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { getPublicationBySlug } from "@/lib/data/publications";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { Container } from "@/components/ui/primitives";
import { ShareButtons } from "@/components/site/ShareButtons";
import { PdfReader } from "@/components/site/publications/PdfReader";
import { formatDate } from "@/lib/utils/format";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale: rawLocale, slug } = await params;
  const locale = (isLocale(rawLocale) ? rawLocale : "zh") as Locale;
  const pub = await getPublicationBySlug(slug);
  if (!pub) return {};
  return { title: locale === "zh" ? pub.name_zh : pub.name_en || pub.name_zh };
}

export default async function PublicationDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale: rawLocale, slug } = await params;
  if (!isLocale(rawLocale)) notFound();
  const locale = rawLocale as Locale;

  const pub = await getPublicationBySlug(slug);
  if (!pub) notFound();
  if (!pub.pdfUrl) notFound();

  const name = locale === "zh" ? pub.name_zh : pub.name_en || pub.name_zh;
  const issue = locale === "zh" ? pub.issue_label_zh : pub.issue_label_en || pub.issue_label_zh;
  const intro = locale === "zh" ? pub.intro_zh : pub.intro_en || pub.intro_zh;
  const sectionTitle = locale === "zh" ? "协会刊物" : "Publications";

  return (
    <>
      <Breadcrumbs locale={locale} items={[{ label: sectionTitle, href: `/${locale}/publications` }, { label: name }]} />
      <Container className="py-10 lg:py-14">
        <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-navy-900">{name}</h1>
            <p className="mt-1 text-sm text-ink-500">
              {[issue, pub.publish_date ? formatDate(pub.publish_date, locale) : null, pub.page_count ? `${pub.page_count} ${locale === "zh" ? "页" : "pages"}` : null]
                .filter(Boolean)
                .join(" · ")}
            </p>
            {intro && <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-600">{intro}</p>}
          </div>
          <div className="flex flex-col items-end gap-2">
            <ShareButtons locale={locale} title={name} />
            {pub.download_enabled && pub.pdfUrl && (
              <a
                href={pub.pdfUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 rounded border border-navy-200 px-3 py-1.5 text-xs font-medium text-navy-800 hover:bg-navy-50"
              >
                <Download className="h-3.5 w-3.5" /> {locale === "zh" ? "下载 PDF" : "Download PDF"}
              </a>
            )}
          </div>
        </div>

        <PdfReader locale={locale} pdfUrl={pub.pdfUrl} />

        {!pub.download_enabled && (
          <p className="mt-3 text-xs text-ink-400">
            {locale === "zh"
              ? "本刊物未开放下载按钮；关闭下载入口仅隐藏前台按钮，无法保证完全阻止文件被保存。"
              : "Download is disabled for this publication. Hiding the download button only removes the UI entry point and cannot fully prevent the file from being saved."}
          </p>
        )}
      </Container>
    </>
  );
}
