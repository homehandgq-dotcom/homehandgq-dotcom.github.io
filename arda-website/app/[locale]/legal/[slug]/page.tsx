import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getPageBySlug } from "@/lib/data/pages";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { PageHero } from "@/components/site/PageHero";
import { RichText } from "@/components/ui/RichText";
import { Container } from "@/components/ui/primitives";

export const dynamic = "force-dynamic";

const LEGAL_SLUGS = [
  "privacy-policy",
  "terms-of-use",
  "cookie-policy",
  "accessibility-statement",
  "conflict-of-interest",
  "financial-transparency",
  "disclaimer",
];

export function generateStaticParams() {
  return LEGAL_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale: rawLocale, slug } = await params;
  const locale = (isLocale(rawLocale) ? rawLocale : "zh") as Locale;
  const page = await getPageBySlug("legal", slug);
  if (!page) return {};
  return { title: locale === "zh" ? page.title_zh : page.title_en };
}

export default async function LegalPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale: rawLocale, slug } = await params;
  if (!isLocale(rawLocale)) notFound();
  const locale = rawLocale as Locale;
  const dict = getDictionary(locale);

  const page = await getPageBySlug("legal", slug);
  if (!page) notFound();
  const title = locale === "zh" ? page.title_zh : page.title_en;

  return (
    <>
      <Breadcrumbs
        locale={locale}
        items={[{ label: locale === "zh" ? "法律信息" : "Legal", href: `/${locale}/legal/privacy-policy` }, { label: title }]}
      />
      <PageHero kicker={dict.footer.legal} title={title} />
      <Container className="py-14 lg:py-20">
        <div className="mx-auto max-w-3xl">
          <RichText html={locale === "zh" ? page.body_zh : page.body_en} />
        </div>
      </Container>
    </>
  );
}
