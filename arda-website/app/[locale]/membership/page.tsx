import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getMembershipValueItems } from "@/lib/data/siteSettings";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { PageHero } from "@/components/site/PageHero";
import { Container } from "@/components/ui/primitives";
import { LinkButton } from "@/components/ui/Button";
import { CheckCircle2 } from "lucide-react";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = (isLocale(rawLocale) ? rawLocale : "zh") as Locale;
  return { title: locale === "zh" ? "为什么加入" : "Why Join" };
}

export default async function MembershipHomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  if (!isLocale(rawLocale)) notFound();
  const locale = rawLocale as Locale;
  const dict = getDictionary(locale);
  const values = await getMembershipValueItems();

  const quickLinks = [
    { href: "types", zh: "会员类别", en: "Membership Types" },
    { href: "benefits", zh: "会员权益", en: "Member Benefits" },
    { href: "directory", zh: "会员名录", en: "Member Directory" },
    { href: "faq", zh: "常见问题", en: "Membership FAQ" },
    { href: "status", zh: "申请状态查询", en: "Application Status" },
  ];

  return (
    <>
      <Breadcrumbs locale={locale} items={[{ label: dict.nav.membership }]} />
      <PageHero
        kicker="Membership"
        title={locale === "zh" ? "为什么加入美国餐饮业发展协会" : "Why Join ARDA"}
        desc={
          locale === "zh"
            ? "加入协会，接入全美跨区域、跨族裔的餐饮从业者网络，获取产业资源、专业培训与品牌曝光机会。"
            : "Join a nationwide, cross-ethnic network of restaurant professionals and gain access to industry resources, professional training and brand visibility."
        }
      />
      <Container className="py-14 lg:py-20">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {values.map((v, i) => (
            <div key={i} className="flex gap-3 rounded-lg border border-navy-100 p-5">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-gold-500" aria-hidden />
              <div>
                <p className="text-sm font-bold text-navy-900">{locale === "zh" ? v.title_zh : v.title_en}</p>
                <p className="mt-1 text-sm text-ink-600">{locale === "zh" ? v.desc_zh : v.desc_en}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-wrap gap-4">
          <LinkButton href={`/${locale}/membership/apply`} size="lg">
            {dict.nav.applyNow}
          </LinkButton>
          <LinkButton href={`/${locale}/membership/types`} variant="secondary" size="lg">
            {locale === "zh" ? "查看会员类别" : "View Membership Types"}
          </LinkButton>
        </div>

        <div className="mt-14 grid grid-cols-2 gap-3 border-t border-navy-100 pt-10 sm:grid-cols-5">
          {quickLinks.map((l) => (
            <LinkButton
              key={l.href}
              href={`/${locale}/membership/${l.href}`}
              variant="ghost"
              className="justify-center border border-navy-100 text-center"
            >
              {locale === "zh" ? l.zh : l.en}
            </LinkButton>
          ))}
        </div>
      </Container>
    </>
  );
}
