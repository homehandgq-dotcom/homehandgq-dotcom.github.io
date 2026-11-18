import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Mail, Phone, MapPin, Users } from "lucide-react";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getChapterBySlug } from "@/lib/data/chapters";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { PageHero } from "@/components/site/PageHero";
import { RichText } from "@/components/ui/RichText";
import { Container, Card } from "@/components/ui/primitives";
import { CoverImage } from "@/components/ui/CoverImage";
import { NewsCard } from "@/components/site/cards/NewsCard";
import { EventCard } from "@/components/site/cards/EventCard";
import { LinkButton } from "@/components/ui/Button";
import { PeopleGrid } from "@/components/site/PeopleGrid";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale: rawLocale, slug } = await params;
  const locale = (isLocale(rawLocale) ? rawLocale : "zh") as Locale;
  const result = await getChapterBySlug(slug);
  if (!result || !result.chapter) return {};
  return { title: locale === "zh" ? result.chapter.name_zh : result.chapter.name_en };
}

export default async function ChapterDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale: rawLocale, slug } = await params;
  if (!isLocale(rawLocale)) notFound();
  const locale = rawLocale as Locale;
  const dict = getDictionary(locale);

  const result = await getChapterBySlug(slug);
  if (!result) notFound();

  // 临时诊断：分会详情页查询出错时，直接把错误信息显示在页面上，方便定位问题原因
  // （而不是只在服务器日志里，用户在浏览器里完全看不到），问题解决后可以去掉这一段
  if (!result.chapter) {
    return (
      <>
        <Breadcrumbs locale={locale} items={[{ label: dict.nav.chapters, href: `/${locale}/chapters` }, { label: slug }]} />
        <PageHero kicker="Chapters & Global Network" title={locale === "zh" ? "加载出错" : "Failed to Load"} />
        <Container className="py-14 lg:py-20">
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <p className="font-semibold">{locale === "zh" ? "该分会页面数据查询失败：" : "Failed to load this chapter:"}</p>
            <p className="mt-1 font-mono text-xs">{result.error}</p>
          </div>
        </Container>
      </>
    );
  }

  const { chapter, memberCount, officers, news, events, error } = result;
  const name = locale === "zh" ? chapter.name_zh : chapter.name_en;
  const leader = chapter.leader;

  return (
    <>
      <Breadcrumbs
        locale={locale}
        items={[{ label: dict.nav.chapters, href: `/${locale}/chapters` }, { label: name }]}
      />
      <PageHero kicker="Chapters & Global Network" title={name} />
      <Container className="py-14 lg:py-20">
        {error && (
          <div className="mb-8 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <p className="font-semibold">{locale === "zh" ? "部分内容加载出错：" : "Some content failed to load:"}</p>
            <p className="mt-1 font-mono text-xs">{error}</p>
          </div>
        )}
        <div className="grid grid-cols-1 gap-14 lg:grid-cols-[1fr_320px]">
          <div className="space-y-12">
            <RichText html={locale === "zh" ? chapter.intro_zh : chapter.intro_en} />

            {officers.length > 0 && (
              <div>
                <h2 className="mb-4 text-lg font-bold text-navy-900">
                  {locale === "zh" ? "组织架构" : "Chapter Leadership"}
                </h2>
                <PeopleGrid locale={locale} people={officers} />
              </div>
            )}

            {news.length > 0 && (
              <div>
                <h2 className="mb-4 text-lg font-bold text-navy-900">
                  {locale === "zh" ? "分会新闻" : "Chapter News"}
                </h2>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                  {news.map((n) => (
                    <NewsCard key={n.id} locale={locale} post={n as never} />
                  ))}
                </div>
              </div>
            )}

            {events.length > 0 && (
              <div>
                <h2 className="mb-4 text-lg font-bold text-navy-900">
                  {locale === "zh" ? "分会活动" : "Chapter Events"}
                </h2>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                  {events.map((e) => (
                    <EventCard key={e.id} locale={locale} event={e as never} />
                  ))}
                </div>
              </div>
            )}
          </div>

          <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
            <Card className="space-y-4 p-6 text-sm">
              <div className="flex items-center gap-2 font-bold text-navy-900">
                <Users className="h-4 w-4 text-gold-500" aria-hidden />
                {memberCount} {locale === "zh" ? "位会员" : "Members"}
              </div>
              {leader && (
                <div className="flex items-center gap-3 border-t border-navy-100 pt-4">
                  <CoverImage
                    src={leader.avatar_url}
                    alt={locale === "zh" ? leader.name_zh || "" : leader.name_en || ""}
                    className="h-12 w-12 rounded-full"
                  />
                  <div>
                    <p className="font-bold text-navy-900">
                      {locale === "zh" ? leader.name_zh : leader.name_en}
                    </p>
                    <p className="text-xs text-ink-500">{locale === "zh" ? leader.title_zh : leader.title_en}</p>
                  </div>
                </div>
              )}
              <div className="space-y-2 border-t border-navy-100 pt-4 text-ink-600">
                {chapter.contact_email && (
                  <a href={`mailto:${chapter.contact_email}`} className="flex items-center gap-2 hover:text-navy-900">
                    <Mail className="h-4 w-4" aria-hidden /> {chapter.contact_email}
                  </a>
                )}
                {chapter.contact_phone && (
                  <p className="flex items-center gap-2">
                    <Phone className="h-4 w-4" aria-hidden /> {chapter.contact_phone}
                  </p>
                )}
                {chapter.address && (
                  <p className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" aria-hidden /> {chapter.address}
                  </p>
                )}
              </div>
            </Card>
            <LinkButton href={`/${locale}/membership/apply`} className="w-full justify-center">
              {locale === "zh" ? "申请加入本分会" : "Join This Chapter"}
            </LinkButton>
          </aside>
        </div>
      </Container>
    </>
  );
}
