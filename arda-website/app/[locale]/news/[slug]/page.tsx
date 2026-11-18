import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getNewsBySlug, getRelatedNews } from "@/lib/data/news";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { Container, Badge } from "@/components/ui/primitives";
import { RichText } from "@/components/ui/RichText";
import { NewsCard } from "@/components/site/cards/NewsCard";
import { CoverImage } from "@/components/ui/CoverImage";
import { ShareButtons } from "@/components/site/ShareButtons";
import { formatDate } from "@/lib/utils/format";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale: rawLocale, slug } = await params;
  const locale = (isLocale(rawLocale) ? rawLocale : "zh") as Locale;
  const post = await getNewsBySlug(slug);
  if (!post) return {};
  const title = locale === "zh" ? post.seo_title_zh || post.title_zh : post.seo_title_en || post.title_en;
  const description =
    locale === "zh" ? post.seo_description_zh || post.excerpt_zh || undefined : post.seo_description_en || post.excerpt_en || undefined;
  return {
    title,
    description,
    openGraph: {
      title: title || undefined,
      description,
      type: "article",
      images: post.cover_image ? [post.cover_image] : undefined,
    },
  };
}

export default async function NewsDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale: rawLocale, slug } = await params;
  if (!isLocale(rawLocale)) notFound();
  const locale = rawLocale as Locale;
  const dict = getDictionary(locale);

  const post = await getNewsBySlug(slug);
  if (!post) notFound();

  const related = await getRelatedNews(post.id, post.category_id);
  const title = locale === "zh" ? post.title_zh : post.title_en;
  const category = post.news_categories;

  return (
    <>
      <Breadcrumbs
        locale={locale}
        items={[
          { label: dict.nav.news, href: `/${locale}/news` },
          { label: title },
        ]}
      />
      <Container className="py-14 lg:py-20">
        <div className="mx-auto max-w-3xl">
          <div className="mb-4 flex flex-wrap items-center gap-3">
            {category && <Badge tone="navy">{locale === "zh" ? category.name_zh : category.name_en}</Badge>}
            {post.is_pinned && <Badge tone="gold">{locale === "zh" ? "置顶" : "Pinned"}</Badge>}
          </div>
          <h1 className="text-3xl font-extrabold text-navy-900 lg:text-4xl">{title}</h1>
          <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-ink-500">
            <span>{formatDate(post.published_at, locale)}</span>
            {post.author && <span>{post.author}</span>}
          </div>

          {/* 后台"文章顶部视频"字段填了视频地址时，这里优先播放视频取代封面图；
              没填视频时跟以前一样只显示封面图 */}
          {post.video_url ? (
            <video
              src={post.video_url}
              controls
              className="my-8 aspect-[16/9] w-full rounded-lg bg-black"
            />
          ) : (
            <CoverImage src={post.cover_image} alt={title} className="my-8 aspect-[16/9] rounded-lg" />
          )}

          <RichText html={locale === "zh" ? post.body_zh : post.body_en} />

          {post.tags && post.tags.length > 0 && (
            <div className="mt-8 flex flex-wrap gap-2">
              {post.tags.map((t) => (
                <Badge key={t} tone="neutral">
                  #{t}
                </Badge>
              ))}
            </div>
          )}

          <div className="mt-10 border-t border-navy-100 pt-6">
            <ShareButtons locale={locale} title={title} />
          </div>
        </div>

        {related.length > 0 && (
          <div className="mx-auto mt-16 max-w-5xl">
            <h2 className="mb-6 text-xl font-bold text-navy-900">
              {locale === "zh" ? "相关文章" : "Related Articles"}
            </h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
              {related.map((p) => (
                <NewsCard key={p.id} locale={locale} post={p} />
              ))}
            </div>
          </div>
        )}
      </Container>
    </>
  );
}
