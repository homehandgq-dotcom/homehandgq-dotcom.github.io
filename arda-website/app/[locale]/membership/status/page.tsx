import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { PageHero } from "@/components/site/PageHero";
import { Container } from "@/components/ui/primitives";
import { StatusLookupForm } from "@/components/forms/StatusLookupForm";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = (isLocale(rawLocale) ? rawLocale : "zh") as Locale;
  return { title: locale === "zh" ? "申请状态查询" : "Application Status", robots: { index: false } };
}

export default async function ApplicationStatusPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  if (!isLocale(rawLocale)) notFound();
  const locale = rawLocale as Locale;
  const dict = getDictionary(locale);

  return (
    <>
      <Breadcrumbs
        locale={locale}
        items={[{ label: dict.nav.membership, href: `/${locale}/membership` }, { label: locale === "zh" ? "申请状态查询" : "Application Status" }]}
      />
      <PageHero kicker="Membership" title={locale === "zh" ? "申请状态查询" : "Application Status"} />
      <Container className="py-14 lg:py-20">
        <div className="mx-auto max-w-lg">
          <StatusLookupForm locale={locale} />
        </div>
      </Container>
    </>
  );
}
