import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { listChapters } from "@/lib/data/chapters";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { PageHero } from "@/components/site/PageHero";
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
  const dict = getDictionary(locale);
  return { title: dict.nav.chapters };
}

const subLinks = [
  { slug: "alliances", zh: "行业联盟", en: "Industry Alliances" },
  { slug: "international-partners", zh: "国际合作伙伴", en: "International Partners" },
  { slug: "global-network", zh: "全球网络", en: "Global Network" },
];

export default async function ChaptersPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  if (!isLocale(rawLocale)) notFound();
  const locale = rawLocale as Locale;
  const dict = getDictionary(locale);
  const chapters = await listChapters();
  const stateChapters = chapters.filter((c) => c.region_type !== "overseas");
  const overseas = chapters.filter((c) => c.region_type === "overseas");

  return (
    <>
      <Breadcrumbs locale={locale} items={[{ label: dict.nav.chapters }]} />
      <PageHero
        kicker="Chapters & Global Network"
        title={dict.nav.chapters}
        desc={
          locale === "zh"
            ? "协会在全美多个州及城市设立地方分会，并持续拓展海外合作机构网络。"
            : "ARDA maintains local chapters across multiple U.S. states and cities, and continues to expand its overseas partner network."
        }
        decoration="network"
      />
      <Container className="py-14 lg:py-20">
        <div className="mb-10 flex flex-wrap gap-3">
          {subLinks.map((l) => (
            <Link
              key={l.slug}
              href={`/${locale}/chapters/${l.slug}`}
              className="rounded-full border border-navy-200 px-4 py-2 text-sm font-semibold text-navy-800 hover:bg-navy-50"
            >
              {locale === "zh" ? l.zh : l.en}
            </Link>
          ))}
        </div>

        <h2 className="mb-6 text-lg font-bold text-navy-900">
          {locale === "zh" ? "全美地方分会" : "U.S. Local Chapters"}
        </h2>
        {stateChapters.length === 0 ? (
          <EmptyState title={dict.common.noResults} />
        ) : (
          <div className="mb-14 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {stateChapters.map((c) => (
              <ChapterCard key={c.id} locale={locale} chapter={c} />
            ))}
          </div>
        )}

        {overseas.length > 0 && (
          <>
            <h2 className="mb-6 text-lg font-bold text-navy-900">
              {locale === "zh" ? "海外合作机构" : "Overseas Partners"}
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {overseas.map((c) => (
                <ChapterCard key={c.id} locale={locale} chapter={c} />
              ))}
            </div>
          </>
        )}
      </Container>
    </>
  );
}
