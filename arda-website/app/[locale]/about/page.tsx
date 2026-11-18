import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { getPageBySlug } from "@/lib/data/pages";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { PageHero } from "@/components/site/PageHero";
import { RichText } from "@/components/ui/RichText";
import { Container } from "@/components/ui/primitives";
import { aboutSubpages } from "@/lib/site/aboutConfig";
import { getDictionary } from "@/lib/i18n/dictionaries";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = (isLocale(rawLocale) ? rawLocale : "zh") as Locale;
  const page = await getPageBySlug("about", "overview");
  return {
    title: page ? (locale === "zh" ? page.seo_title_zh || page.title_zh : page.seo_title_en || page.title_en) : undefined,
    description: page
      ? locale === "zh"
        ? page.seo_description_zh || undefined
        : page.seo_description_en || undefined
      : undefined,
  };
}

export default async function AboutOverviewPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  if (!isLocale(rawLocale)) notFound();
  const locale = rawLocale as Locale;
  const dict = getDictionary(locale);

  const page = await getPageBySlug("about", "overview");

  return (
    <>
      <Breadcrumbs locale={locale} items={[{ label: dict.nav.about }]} />
      <PageHero kicker="ARDA" title={page ? (locale === "zh" ? page.title_zh : page.title_en) : dict.nav.about} />
      <Container className="py-14 lg:py-20">
        <div className="grid grid-cols-1 gap-14 lg:grid-cols-[1fr_320px]">
          <RichText html={page ? (locale === "zh" ? page.body_zh : page.body_en) : null} />
          <aside className="space-y-2 lg:sticky lg:top-24 lg:self-start">
            <p className="mb-3 text-xs font-bold uppercase tracking-wide text-gold-600">
              {locale === "zh" ? "关于我们" : "About"}
            </p>
            <nav className="flex flex-col divide-y divide-navy-100 rounded-lg border border-navy-100 bg-white">
              {aboutSubpages.map((sp) => (
                <Link
                  key={sp.slug}
                  href={`/${locale}/about/${sp.slug}`}
                  className="px-4 py-3 text-sm font-medium text-navy-800 hover:bg-navy-50"
                >
                  {locale === "zh" ? sp.title_zh : sp.title_en}
                </Link>
              ))}
            </nav>
          </aside>
        </div>
      </Container>
    </>
  );
}
