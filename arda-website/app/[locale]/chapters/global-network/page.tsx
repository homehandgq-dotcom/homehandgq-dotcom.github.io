import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getPageBySlug } from "@/lib/data/pages";
import { listChapters } from "@/lib/data/chapters";
import { listPartners } from "@/lib/data/partners";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { PageHero } from "@/components/site/PageHero";
import { RichText } from "@/components/ui/RichText";
import { Container } from "@/components/ui/primitives";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = (isLocale(rawLocale) ? rawLocale : "zh") as Locale;
  return { title: locale === "zh" ? "全球网络" : "Global Network" };
}

export default async function GlobalNetworkPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  if (!isLocale(rawLocale)) notFound();
  const locale = rawLocale as Locale;
  const dict = getDictionary(locale);
  const [page, chapters, partners] = await Promise.all([
    getPageBySlug("custom", "chapters-global-network"),
    listChapters(),
    listPartners(),
  ]);
  const usChapters = chapters.filter((c) => c.region_type !== "overseas").length;
  const overseasChapters = chapters.filter((c) => c.region_type === "overseas").length;

  return (
    <>
      <Breadcrumbs
        locale={locale}
        items={[{ label: dict.nav.chapters, href: `/${locale}/chapters` }, { label: locale === "zh" ? "全球网络" : "Global Network" }]}
      />
      <PageHero kicker="Chapters & Global Network" title={locale === "zh" ? "全球网络" : "Global Network"} />
      <Container className="py-14 lg:py-20">
        <div className="mx-auto max-w-3xl">
          <RichText html={page ? (locale === "zh" ? page.body_zh : page.body_en) : null} />
        </div>
        <div className="mx-auto mt-12 grid max-w-3xl grid-cols-3 gap-6 text-center">
          <Stat value={usChapters} label={locale === "zh" ? "美国地方分会" : "U.S. Chapters"} />
          <Stat value={overseasChapters} label={locale === "zh" ? "海外合作机构" : "Overseas Partners"} />
          <Stat value={partners.length} label={locale === "zh" ? "合作伙伴总数" : "Total Partners"} />
        </div>
      </Container>
    </>
  );
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <div className="rounded-lg border border-navy-100 bg-white p-6">
      <p className="text-3xl font-extrabold text-navy-900">{value}</p>
      <p className="mt-1 text-xs font-medium text-ink-500">{label}</p>
    </div>
  );
}
