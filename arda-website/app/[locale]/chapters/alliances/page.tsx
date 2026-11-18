import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getPageBySlug } from "@/lib/data/pages";
import { listPartners } from "@/lib/data/partners";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { PageHero } from "@/components/site/PageHero";
import { RichText } from "@/components/ui/RichText";
import { Container, EmptyState } from "@/components/ui/primitives";
import { CoverImage } from "@/components/ui/CoverImage";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = (isLocale(rawLocale) ? rawLocale : "zh") as Locale;
  return { title: locale === "zh" ? "行业联盟" : "Industry Alliances" };
}

export default async function AlliancesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  if (!isLocale(rawLocale)) notFound();
  const locale = rawLocale as Locale;
  const dict = getDictionary(locale);
  const [page, strategic, corporate] = await Promise.all([
    getPageBySlug("custom", "chapters-alliances"),
    listPartners("strategic"),
    listPartners("corporate"),
  ]);
  const partners = [...strategic, ...corporate];

  return (
    <>
      <Breadcrumbs
        locale={locale}
        items={[{ label: dict.nav.chapters, href: `/${locale}/chapters` }, { label: locale === "zh" ? "行业联盟" : "Industry Alliances" }]}
      />
      <PageHero kicker="Chapters & Global Network" title={locale === "zh" ? "行业联盟" : "Industry Alliances"} />
      <Container className="py-14 lg:py-20">
        <div className="mx-auto max-w-3xl">
          <RichText html={page ? (locale === "zh" ? page.body_zh : page.body_en) : null} />
        </div>
        <div className="mt-12">
          {partners.length === 0 ? (
            <EmptyState title={locale === "zh" ? "联盟机构信息筹备中" : "Alliance directory coming soon"} />
          ) : (
            <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
              {partners.map((p) => (
                <div key={p.id} className="flex items-center justify-center rounded-lg border border-navy-100 bg-white p-4">
                  <CoverImage
                    src={p.logo_url}
                    alt={locale === "zh" ? p.name_zh : p.name_en}
                    className="h-14 w-full"
                    objectFit="contain"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </Container>
    </>
  );
}
