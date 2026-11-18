import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { getVideoBySlug } from "@/lib/data/videos";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { Container } from "@/components/ui/primitives";
import { ShareButtons } from "@/components/site/ShareButtons";
import { VideoPlayer } from "@/components/site/videos/VideoPlayer";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale: rawLocale, slug } = await params;
  const locale = (isLocale(rawLocale) ? rawLocale : "zh") as Locale;
  const video = await getVideoBySlug(slug);
  if (!video) return {};
  const title = locale === "zh" ? video.title_zh : video.title_en || video.title_zh;
  return { title };
}

export default async function VideoDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale: rawLocale, slug } = await params;
  if (!isLocale(rawLocale)) notFound();
  const locale = rawLocale as Locale;

  const video = await getVideoBySlug(slug);
  if (!video) notFound();

  const title = locale === "zh" ? video.title_zh : video.title_en || video.title_zh;
  const personName = locale === "zh" ? video.person_name_zh : video.person_name_en || video.person_name_zh;
  const personTitle = locale === "zh" ? video.person_title_zh : video.person_title_en || video.person_title_zh;
  const intro = locale === "zh" ? video.intro_zh : video.intro_en || video.intro_zh;
  const categoryLabel = video.category ? (locale === "zh" ? video.category.name_zh : video.category.name_en) : null;
  const sectionTitle = locale === "zh" ? "ARDA 视界" : "ARDA Videos";

  return (
    <>
      <Breadcrumbs locale={locale} items={[{ label: sectionTitle, href: `/${locale}/videos` }, { label: title }]} />
      <Container className="py-14 lg:py-20">
        <div className="mx-auto max-w-3xl space-y-6">
          <VideoPlayer locale={locale} video={video} />
          <div className="text-center">
            {categoryLabel && (
              <p className="mb-2 inline-block rounded-full bg-gold-100 px-3 py-1 text-xs font-semibold text-gold-700">
                {categoryLabel}
              </p>
            )}
            <h1 className="text-xl font-bold text-navy-900">{title}</h1>
            {(personName || personTitle) && (
              <p className="mt-1 text-sm text-ink-500">{[personName, personTitle].filter(Boolean).join(" · ")}</p>
            )}
            {intro && <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-ink-600">{intro}</p>}
          </div>
          <div className="flex justify-center border-t border-navy-100 pt-5">
            <ShareButtons locale={locale} title={title} />
          </div>
        </div>
      </Container>
    </>
  );
}
