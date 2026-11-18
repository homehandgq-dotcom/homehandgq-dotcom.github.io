import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getPageBySlug } from "@/lib/data/pages";
import { listChapters } from "@/lib/data/chapters";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { PageHero } from "@/components/site/PageHero";
import { RichText } from "@/components/ui/RichText";
import { Container, EmptyState } from "@/components/ui/primitives";
import { ChapterCard } from "@/components/site/cards/ChapterCard";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = (isLocale(rawLocale) ? rawLocale : "zh") as Locale;
  return { title: locale === "zh" ? "国际合作伙伴" : "International Partners" };
}

export default async function InternationalPartnersPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  if (!isLocale(rawLocale)) notFound();
  const locale = rawLocale as Locale;
  const dict = getDictionary(locale);
  const [page, overseas] = await Promise.all([
    getPageBySlug("custom", "chapters-international-partners"),
    listChapters("overseas"),
  ]);

  return (
    <>
      <Breadcrumbs
        locale={locale}
        items={[{ label: dict.nav.chapters, href: `/${locale}/chapters` }, { label: locale === "zh" ? "国际合作伙伴" : "International Partners" }]}
      />
      <PageHero kicker="Chapters & Global Network" title={locale === "zh" ? "国际合作伙伴" : "International Partners"} />
      <Container className="py-14 lg:py-20">
        <div className="mx-auto max-w-3xl">
          <RichText html={page ? (locale === "zh" ? page.body_zh : page.body_en) : null} />
        </div>
        <div className="mt-12">
          {overseas.length === 0 ? (
            <EmptyState title={locale === "zh" ? "海外合作机构信息筹备中" : "Overseas partner directory coming soon"} />
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {overseas.map((c) => (
                <ChapterCard key={c.id} locale={locale} chapter={c} />
              ))}
            </div>
          )}
        </div>
      </Container>
    </>
  );
}
