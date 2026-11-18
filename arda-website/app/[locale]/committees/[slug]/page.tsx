import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getCommitteeBySlug } from "@/lib/data/committees";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { PageHero } from "@/components/site/PageHero";
import { RichText } from "@/components/ui/RichText";
import { Container } from "@/components/ui/primitives";
import { PeopleGrid } from "@/components/site/PeopleGrid";
import { LinkButton } from "@/components/ui/Button";
import { EventCard } from "@/components/site/cards/EventCard";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale: rawLocale, slug } = await params;
  const locale = (isLocale(rawLocale) ? rawLocale : "zh") as Locale;
  const result = await getCommitteeBySlug(slug);
  if (!result) return {};
  const { committee } = result;
  return { title: locale === "zh" ? committee.name_zh : committee.name_en };
}

export default async function CommitteeDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale: rawLocale, slug } = await params;
  if (!isLocale(rawLocale)) notFound();
  const locale = rawLocale as Locale;
  const dict = getDictionary(locale);

  const result = await getCommitteeBySlug(slug);
  if (!result) notFound();
  const { committee, members, events } = result;

  const name = locale === "zh" ? committee.name_zh : committee.name_en;

  return (
    <>
      <Breadcrumbs
        locale={locale}
        items={[{ label: dict.nav.committees, href: `/${locale}/committees` }, { label: name }]}
      />
      <PageHero kicker="Committees" title={name} />
      <Container className="py-14 lg:py-20">
        <div className="grid grid-cols-1 gap-14 lg:grid-cols-[1fr_320px]">
          <div className="space-y-12">
            {members.length > 0 && (
              <div>
                <h2 className="mb-4 text-lg font-bold text-navy-900">
                  {locale === "zh" ? "人物介绍" : "Profile"}
                </h2>
                <PeopleGrid locale={locale} people={members} />
              </div>
            )}

            <div>
              <h2 className="mb-3 text-lg font-bold text-navy-900">
                {locale === "zh" ? "委员会介绍" : "Introduction"}
              </h2>
              <RichText html={locale === "zh" ? committee.intro_zh : committee.intro_en} />
            </div>

            {(committee.responsibilities_zh || committee.responsibilities_en) && (
              <div>
                <h2 className="mb-3 text-lg font-bold text-navy-900">
                  {locale === "zh" ? "主要职责" : "Key Responsibilities"}
                </h2>
                <RichText html={locale === "zh" ? committee.responsibilities_zh : committee.responsibilities_en} />
              </div>
            )}

            {(committee.annual_plan_zh || committee.annual_plan_en) && (
              <div>
                <h2 className="mb-3 text-lg font-bold text-navy-900">
                  {locale === "zh" ? "年度计划" : "Annual Plan"}
                </h2>
                <RichText html={locale === "zh" ? committee.annual_plan_zh : committee.annual_plan_en} />
              </div>
            )}

            {events.length > 0 && (
              <div>
                <h2 className="mb-4 text-lg font-bold text-navy-900">
                  {locale === "zh" ? "相关活动" : "Related Events"}
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
            <LinkButton href={`/${locale}/membership/apply`} className="w-full justify-center">
              {locale === "zh" ? "申请加入委员会" : "Apply to Join"}
            </LinkButton>
            <LinkButton href={`/${locale}/contact`} variant="secondary" className="w-full justify-center">
              {dict.nav.contact}
            </LinkButton>
          </aside>
        </div>
      </Container>
    </>
  );
}
