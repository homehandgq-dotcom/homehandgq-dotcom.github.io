import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getPageBySlug } from "@/lib/data/pages";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { PageHero } from "@/components/site/PageHero";
import { RichText } from "@/components/ui/RichText";
import { Container } from "@/components/ui/primitives";
import { LinkButton } from "@/components/ui/Button";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale: rawLocale, slug } = await params;
  const locale = (isLocale(rawLocale) ? rawLocale : "zh") as Locale;
  const page = await getPageBySlug("services", slug);
  if (!page) return {};
  return {
    title: locale === "zh" ? page.seo_title_zh || page.title_zh : page.seo_title_en || page.title_en,
    description: locale === "zh" ? page.seo_description_zh || undefined : page.seo_description_en || undefined,
  };
}

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale: rawLocale, slug } = await params;
  if (!isLocale(rawLocale)) notFound();
  const locale = rawLocale as Locale;
  const dict = getDictionary(locale);

  const page = await getPageBySlug("services", slug);
  if (!page) notFound();

  const title = locale === "zh" ? page.title_zh : page.title_en;

  return (
    <>
      <Breadcrumbs
        locale={locale}
        items={[{ label: dict.nav.services, href: `/${locale}/services` }, { label: title }]}
      />
      <PageHero kicker="Association Services" title={title} />
      <Container className="py-14 lg:py-20">
        <div className="mx-auto max-w-3xl">
          <RichText html={locale === "zh" ? page.body_zh : page.body_en} />
          <div className="mt-10 flex flex-wrap gap-4 border-t border-navy-100 pt-8">
            <LinkButton href={`/${locale}/membership/apply`}>{dict.nav.applyNow}</LinkButton>
            <LinkButton href={`/${locale}/contact`} variant="secondary">
              {dict.nav.contact}
            </LinkButton>
          </div>
        </div>
      </Container>
    </>
  );
}
