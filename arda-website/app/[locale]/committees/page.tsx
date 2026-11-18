import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { listCommittees } from "@/lib/data/committees";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { PageHero } from "@/components/site/PageHero";
import { Container, EmptyState } from "@/components/ui/primitives";
import { CommitteeCard } from "@/components/site/cards/CommitteeCard";
import { zhCountNumeral } from "@/lib/utils/format";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = (isLocale(rawLocale) ? rawLocale : "zh") as Locale;
  const dict = getDictionary(locale);
  return { title: dict.nav.committees };
}

export default async function CommitteesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  if (!isLocale(rawLocale)) notFound();
  const locale = rawLocale as Locale;
  const dict = getDictionary(locale);
  const committees = await listCommittees();
  // 简介文字里的委员会数量、名称以前是写死的"六大...委员会"，后台增减委员会
  // 后容易跟实际数量对不上（比如加了第七个"多元产业发展委员会"后还显示"六大"）。
  // 改成根据实际条数现算数量，具体名称改用"涵盖xxx等多个专业领域"这种不需要
  // 逐一列举的说法，不管以后委员会怎么增减都不会再对不上
  const count = committees.length;
  const countLabelZh = count > 0 ? `${zhCountNumeral(count)}大专业委员会` : "专业委员会";
  const countLabelEn = count > 0 ? `${count} professional committees` : "professional committees";

  return (
    <>
      <Breadcrumbs locale={locale} items={[{ label: dict.nav.committees }]} />
      <PageHero
        kicker="Committees"
        title={dict.nav.committees}
        desc={
          locale === "zh"
            ? `协会设立${countLabelZh}，涵盖品牌连锁、供应链、科技与AI等多个专业领域，为会员提供专业支持。`
            : `ARDA operates ${countLabelEn} covering branding & franchise, supply chain, technology & AI, and other specialized areas to support members.`
        }
      />
      <Container className="py-14 lg:py-20">
        {committees.length === 0 ? (
          <EmptyState title={dict.common.noResults} />
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {committees.map((c) => (
              <CommitteeCard key={c.id} locale={locale} committee={c} />
            ))}
          </div>
        )}
      </Container>
    </>
  );
}
