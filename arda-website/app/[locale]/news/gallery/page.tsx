import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getGalleryMedia } from "@/lib/data/news";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { PageHero } from "@/components/site/PageHero";
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
  return { title: locale === "zh" ? "图片中心" : "Photo Gallery" };
}

export default async function GalleryPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  if (!isLocale(rawLocale)) notFound();
  const locale = rawLocale as Locale;
  const dict = getDictionary(locale);
  const media = await getGalleryMedia();

  return (
    <>
      <Breadcrumbs
        locale={locale}
        items={[{ label: dict.nav.news, href: `/${locale}/news` }, { label: locale === "zh" ? "图片中心" : "Photo Gallery" }]}
      />
      <PageHero kicker="News & Media" title={locale === "zh" ? "图片中心" : "Photo Gallery"} />
      <Container className="py-14 lg:py-20">
        {media.length === 0 ? (
          <EmptyState
            title={locale === "zh" ? "暂无图片" : "No photos yet"}
            desc={locale === "zh" ? "活动与新闻配图将陆续发布于此。" : "Event and news photos will be published here."}
          />
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {media.map((m) => (
              <CoverImage
                key={m.id}
                src={m.url}
                alt={(locale === "zh" ? m.alt_zh : m.alt_en) || ""}
                className="aspect-square rounded-lg"
              />
            ))}
          </div>
        )}
      </Container>
    </>
  );
}
