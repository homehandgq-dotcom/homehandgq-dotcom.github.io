import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { listFaqs } from "@/lib/data/membership";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { PageHero } from "@/components/site/PageHero";
import { Container, EmptyState } from "@/components/ui/primitives";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = (isLocale(rawLocale) ? rawLocale : "zh") as Locale;
  return { title: locale === "zh" ? "常见问题" : "Membership FAQ" };
}

export default async function MembershipFaqPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  if (!isLocale(rawLocale)) notFound();
  const locale = rawLocale as Locale;
  const dict = getDictionary(locale);
  const faqs = await listFaqs("membership");

  return (
    <>
      <Breadcrumbs
        locale={locale}
        items={[{ label: dict.nav.membership, href: `/${locale}/membership` }, { label: locale === "zh" ? "常见问题" : "Membership FAQ" }]}
      />
      <PageHero kicker="Membership" title={locale === "zh" ? "常见问题" : "Membership FAQ"} />
      <Container className="py-14 lg:py-20">
        <div className="mx-auto max-w-3xl divide-y divide-navy-100 rounded-lg border border-navy-100">
          {faqs.length === 0 ? (
            <div className="p-8">
              <EmptyState title={dict.common.noResults} />
            </div>
          ) : (
            faqs.map((f) => (
              <details key={f.id} className="group p-5 open:bg-mist">
                <summary className="cursor-pointer list-none text-sm font-bold text-navy-900 marker:content-none">
                  <span className="flex items-center justify-between gap-4">
                    {locale === "zh" ? f.question_zh : f.question_en}
                    <span className="shrink-0 text-gold-500 group-open:rotate-45">+</span>
                  </span>
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-ink-600">
                  {locale === "zh" ? f.answer_zh : f.answer_en}
                </p>
              </details>
            ))
          )}
        </div>
      </Container>
    </>
  );
}
