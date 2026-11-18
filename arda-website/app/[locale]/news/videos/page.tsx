import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getVideoMedia } from "@/lib/data/news";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { PageHero } from "@/components/site/PageHero";
import { Container, EmptyState } from "@/components/ui/primitives";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = (isLocale(rawLocale) ? rawLocale : "zh") as Locale;
  return { title: locale === "zh" ? "视频中心" : "Video Gallery" };
}

export default async function VideosPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  if (!isLocale(rawLocale)) notFound();
  const locale = rawLocale as Locale;
  const dict = getDictionary(locale);
  const media = await getVideoMedia();

  return (
    <>
      <Breadcrumbs
        locale={locale}
        items={[{ label: dict.nav.news, href: `/${locale}/news` }, { label: locale === "zh" ? "视频中心" : "Video Gallery" }]}
      />
      <PageHero kicker="News & Media" title={locale === "zh" ? "视频中心" : "Video Gallery"} />
      <Container className="py-14 lg:py-20">
        {media.length === 0 ? (
          <EmptyState
            title={locale === "zh" ? "暂无视频" : "No videos yet"}
            desc={locale === "zh" ? "协会活动视频将陆续发布于此。" : "Event videos will be published here."}
          />
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {media.map((m) => (
              <div key={m.id} className="overflow-hidden rounded-lg border border-navy-100 bg-black">
                <video src={m.url} controls className="aspect-video w-full" />
                {(m.caption_zh || m.caption_en) && (
                  <p className="p-3 text-sm text-ink-600">{locale === "zh" ? m.caption_zh : m.caption_en}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </Container>
    </>
  );
}
