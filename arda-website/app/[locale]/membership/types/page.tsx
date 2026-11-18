import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { listMembershipTypes } from "@/lib/data/membership";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { PageHero } from "@/components/site/PageHero";
import { Container } from "@/components/ui/primitives";
import { LinkButton } from "@/components/ui/Button";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = (isLocale(rawLocale) ? rawLocale : "zh") as Locale;
  return { title: locale === "zh" ? "会员类别" : "Membership Types" };
}

export default async function MembershipTypesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  if (!isLocale(rawLocale)) notFound();
  const locale = rawLocale as Locale;
  const dict = getDictionary(locale);
  const types = await listMembershipTypes();

  return (
    <>
      <Breadcrumbs
        locale={locale}
        items={[{ label: dict.nav.membership, href: `/${locale}/membership` }, { label: locale === "zh" ? "会员类别" : "Membership Types" }]}
      />
      <PageHero kicker="Membership" title={locale === "zh" ? "会员类别" : "Membership Types"} />
      <Container className="py-14 lg:py-20">
        <div className="mb-10 rounded-lg border border-gold-200 bg-gold-50 p-5 text-sm text-navy-900">
          {locale === "zh"
            ? "现阶段会员费政策以协会正式公告为准。"
            : "Current membership fee policy will be announced officially by the Association."}
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {types.map((t) => (
            <div key={t.id} className="flex flex-col rounded-lg border border-navy-100 bg-white p-6">
              <h2 className="mb-2 text-base font-bold text-navy-900">
                {locale === "zh" ? t.name_zh : t.name_en}
              </h2>
              <p className="flex-1 text-sm text-ink-600">
                {locale === "zh" ? t.description_zh : t.description_en}
              </p>
            </div>
          ))}
        </div>
        <div className="mt-12">
          <LinkButton href={`/${locale}/membership/apply`} size="lg">
            {dict.nav.applyNow}
          </LinkButton>
        </div>
      </Container>
    </>
  );
}
