import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { listPagesByGroup } from "@/lib/data/pages";
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
  const dict = getDictionary(locale);
  return { title: dict.nav.services };
}

export default async function ServicesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  if (!isLocale(rawLocale)) notFound();
  const locale = rawLocale as Locale;
  const dict = getDictionary(locale);
  const services = await listPagesByGroup("services");

  return (
    <>
      <Breadcrumbs locale={locale} items={[{ label: dict.nav.services }]} />
      <PageHero
        kicker="Association Services"
        title={dict.nav.services}
        desc={
          locale === "zh"
            ? "协会围绕商业发展、品牌连锁、供应链、科技、资本、法律政策、人才培养、国际合作与媒体推广九大方向为会员提供服务。"
            : "ARDA supports members across nine areas: business development, brand & franchise, supply chain, technology, capital, legal & policy, talent, international cooperation, and media promotion."
        }
      />
      <Container className="py-14 lg:py-20">
        {services.length === 0 ? (
          <EmptyState title={dict.common.noResults} />
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((s) => (
              <Link
                key={s.id}
                href={`/${locale}/services/${s.slug}`}
                className="group flex flex-col justify-between rounded-lg border border-navy-100 bg-white p-6 transition-shadow hover:shadow-md"
              >
                <div>
                  <h2 className="mb-2 text-base font-bold text-navy-900 group-hover:text-navy-700">
                    {locale === "zh" ? s.title_zh : s.title_en}
                  </h2>
                  <p className="line-clamp-3 text-sm text-ink-600">
                    {(locale === "zh" ? s.body_zh : s.body_en)?.replace(/<[^>]+>/g, "")}
                  </p>
                </div>
                <span className="mt-4 flex items-center gap-1 text-xs font-semibold text-gold-600">
                  {dict.common.learnMore}
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                </span>
              </Link>
            ))}
          </div>
        )}
      </Container>
    </>
  );
}
