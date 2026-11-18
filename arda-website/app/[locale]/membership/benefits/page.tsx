import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getMembershipValueItems } from "@/lib/data/siteSettings";
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
  return { title: locale === "zh" ? "会员权益" : "Member Benefits" };
}

export default async function MembershipBenefitsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  if (!isLocale(rawLocale)) notFound();
  const locale = rawLocale as Locale;
  const dict = getDictionary(locale);
  const values = await getMembershipValueItems();

  return (
    <>
      <Breadcrumbs
        locale={locale}
        items={[{ label: dict.nav.membership, href: `/${locale}/membership` }, { label: locale === "zh" ? "会员权益" : "Member Benefits" }]}
      />
      <PageHero kicker="Membership" title={locale === "zh" ? "会员权益" : "Member Benefits"} />
      <Container className="py-14 lg:py-20">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {values.map((v, i) => (
            <div key={i} className="flex gap-4 rounded-lg border border-navy-100 bg-white p-6">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-navy-900 text-gold-300">
                <CheckCircle2 className="h-5 w-5" aria-hidden />
              </span>
              <div>
                <p className="font-bold text-navy-900">{locale === "zh" ? v.title_zh : v.title_en}</p>
                <p className="mt-1 text-sm text-ink-600">{locale === "zh" ? v.desc_zh : v.desc_en}</p>
              </div>
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
