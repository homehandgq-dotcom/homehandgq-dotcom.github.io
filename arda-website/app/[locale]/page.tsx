import type { Metadata } from "next";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { notFound } from "next/navigation";
import { Hero } from "@/components/site/sections/Hero";
import { StatsBand } from "@/components/site/sections/StatsBand";
import { VideosSection } from "@/components/site/sections/VideosSection";
import { MissionGrid } from "@/components/site/sections/MissionGrid";
import { NewsPreview } from "@/components/site/sections/NewsPreview";
import { PublicationsSection } from "@/components/site/sections/PublicationsSection";
import { EventsPreview } from "@/components/site/sections/EventsPreview";
import { CommitteesSection } from "@/components/site/sections/CommitteesSection";
import { ChaptersSection } from "@/components/site/sections/ChaptersSection";
import { ValueGrid } from "@/components/site/sections/ValueGrid";
import { ServicesGrid } from "@/components/site/sections/ServicesGrid";
import { FeaturedMembers } from "@/components/site/sections/FeaturedMembers";
import { PartnersStrip } from "@/components/site/sections/PartnersStrip";
import { DualCta } from "@/components/site/sections/DualCta";
import { AboutIntroSection } from "@/components/site/sections/AboutIntroSection";
import { LeadershipSection } from "@/components/site/sections/LeadershipSection";
import { EmpowerSection } from "@/components/site/sections/EmpowerSection";
import { BenefitsSection } from "@/components/site/sections/BenefitsSection";
import { CommunitySection } from "@/components/site/sections/CommunitySection";
import { MembershipTypesSection } from "@/components/site/sections/MembershipTypesSection";
import { getDictionary } from "@/lib/i18n/dictionaries";

import { getHeroSlides, getHomeStats, getMissionItems, getMembershipValueItems } from "@/lib/data/siteSettings";
import { getHomeBenefits, getHomeEmpower, getHomeCommunity } from "@/lib/data/homeSections";
import { getFeaturedNews } from "@/lib/data/news";
import { getFeaturedVideos } from "@/lib/data/videos";
import { getFeaturedPublications } from "@/lib/data/publications";
import { getUpcomingEvents } from "@/lib/data/events";
import { listCommittees } from "@/lib/data/committees";
import { listChapters } from "@/lib/data/chapters";
import { listPagesByGroup, getPageBySlug } from "@/lib/data/pages";
import { getFeaturedMembers, listMembershipTypes } from "@/lib/data/membership";
import { getFeaturedPartners } from "@/lib/data/partners";
import { listTopLeadership } from "@/lib/data/leadership";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = (isLocale(rawLocale) ? rawLocale : "zh") as Locale;
  const dict = getDictionary(locale);
  return {
    title: dict.brand.fullName,
    description:
      locale === "zh"
        ? "美国餐饮业发展协会（ARDA）致力于成为全美最具影响力的亚裔餐饮行业组织。"
        : "ARDA is building the most influential Asian-American restaurant industry organization in the U.S.",
    alternates: {
      canonical: `/${locale}`,
      languages: { zh: "/zh", en: "/en" },
    },
    openGraph: {
      title: dict.brand.fullName,
      type: "website",
      locale: locale === "zh" ? "zh_CN" : "en_US",
    },
  };
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  if (!isLocale(rawLocale)) notFound();
  const locale = rawLocale as Locale;

  const [
    heroSlides,
    stats,
    missionItems,
    membershipValueItems,
    news,
    events,
    committees,
    chapters,
    services,
    featuredMembers,
    featuredPartners,
    featuredVideos,
    featuredPublications,
    aboutPage,
    topLeadership,
    benefits,
    empower,
    community,
    membershipTypes,
  ] = await Promise.all([
    getHeroSlides(),
    getHomeStats(),
    getMissionItems(),
    getMembershipValueItems(),
    getFeaturedNews(3),
    getUpcomingEvents(3),
    listCommittees(),
    listChapters(),
    listPagesByGroup("services"),
    getFeaturedMembers(8),
    // 主页合作伙伴原来写死只取 8 个，模板放不下更多；现改为取 24 个，
    // 实际显示哪几家仍由后台「首页展示」勾选决定（现行口径为 7 个战略伙伴）
    getFeaturedPartners(24),
    getFeaturedVideos(6),
    getFeaturedPublications(4),
    getPageBySlug("about", "overview"),
    listTopLeadership(12),
    getHomeBenefits(),
    getHomeEmpower(),
    getHomeCommunity(),
    listMembershipTypes(),
  ]);

  const dict = getDictionary(locale);

  // 主页按定稿方案一页到底：首屏 → 使命 → 协会简介全文 → 领导架构 → 委员会 →
  // 行业服务 → 赋能餐饮实体（新）→ 在协会能获得什么（新）→ 会员价值 → 会员类别 →
  // 分会全名单 → 协会活动与社群（新）→ 活动 / 新闻 / 视频 / 刊物 → 会员企业与合作伙伴 → 加入与捐赠
  // 子页面一个不删、原链接不变，主页看不完的仍可点进去看全文
  return (
    <>
      <Hero locale={locale} slide={heroSlides[0] ?? null} />
      <StatsBand locale={locale} stats={stats} />
      <MissionGrid locale={locale} items={missionItems} />
      <AboutIntroSection locale={locale} page={aboutPage} />
      <LeadershipSection locale={locale} people={topLeadership} />
      <CommitteesSection locale={locale} items={committees} />
      <ServicesGrid locale={locale} items={services} />
      <EmpowerSection locale={locale} data={empower} />
      <BenefitsSection locale={locale} data={benefits} />
      <ValueGrid
        locale={locale}
        kicker="Membership"
        title={dict.home.valueTitle}
        items={membershipValueItems}
        ctaHref={`/${locale}/membership/benefits`}
        ctaLabel={dict.common.learnMore}
      />
      <MembershipTypesSection locale={locale} items={membershipTypes} />
      {/* 分会原来在主页写死只显示前 8 个（拉斯维加斯、夏威夷、海外合作伙伴被截掉），现改为全名单显示 */}
      <ChaptersSection locale={locale} items={chapters} />
      <CommunitySection locale={locale} data={community} />
      <EventsPreview locale={locale} items={events} />
      <NewsPreview locale={locale} items={news} />
      <VideosSection locale={locale} items={featuredVideos} />
      <PublicationsSection locale={locale} items={featuredPublications} />
      <FeaturedMembers locale={locale} items={featuredMembers} />
      <PartnersStrip locale={locale} items={featuredPartners} />
      <DualCta locale={locale} />
    </>
  );
}
