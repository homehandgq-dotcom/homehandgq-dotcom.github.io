import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { listEvents } from "@/lib/data/events";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { PageHero } from "@/components/site/PageHero";
import { Container, EmptyState } from "@/components/ui/primitives";
import { EventCard } from "@/components/site/cards/EventCard";
import { Pagination } from "@/components/ui/Pagination";
import { cn } from "@/lib/utils/cn";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = (isLocale(rawLocale) ? rawLocale : "zh") as Locale;
  const dict = getDictionary(locale);
  return { title: dict.nav.events };
}

const categories = [
  { slug: "forum", zh: "论坛与峰会", en: "Forums & Summits" },
  { slug: "training", zh: "培训与教育", en: "Training & Education" },
  { slug: "delegation", zh: "商务考察", en: "Business Delegations" },
  { slug: "exchange", zh: "国际交流", en: "International Exchange" },
];

export default async function EventsListPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ when?: string; category?: string; page?: string }>;
}) {
  const { locale: rawLocale } = await params;
  if (!isLocale(rawLocale)) notFound();
  const locale = rawLocale as Locale;
  const dict = getDictionary(locale);
  const sp = await searchParams;
  const when = (sp.when as "upcoming" | "past" | "all") || "all";
  const category = sp.category || "all";
  const page = Math.max(1, Number(sp.page) || 1);

  const { items, total, pageSize } = await listEvents({ when, category, page, pageSize: 9 });

  function buildHref(overrides: Record<string, string | number>) {
    const params = new URLSearchParams();
    if (when !== "all") params.set("when", when);
    if (category !== "all") params.set("category", category);
    if (page > 1) params.set("page", String(page));
    Object.entries(overrides).forEach(([k, v]) => {
      if (v === "" || v === "all" || v === 1) params.delete(k);
      else params.set(k, String(v));
    });
    const qs = params.toString();
    return `/${locale}/events${qs ? `?${qs}` : ""}`;
  }

  return (
    <>
      <Breadcrumbs locale={locale} items={[{ label: dict.nav.events }]} />
      <PageHero kicker="Programs & Events" title={dict.nav.events} />
      <Container className="py-14 lg:py-20">
        <div className="mb-6 flex flex-wrap gap-2">
          {[
            { key: "all", zh: "全部", en: "All" },
            { key: "upcoming", zh: "即将举行", en: "Upcoming" },
            { key: "past", zh: "往届活动", en: "Past" },
          ].map((w) => (
            <Link
              key={w.key}
              href={buildHref({ when: w.key })}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-semibold",
                when === w.key ? "bg-navy-900 text-white" : "bg-mist text-ink-600 hover:bg-navy-50"
              )}
            >
              {locale === "zh" ? w.zh : w.en}
            </Link>
          ))}
        </div>
        <div className="mb-8 flex flex-wrap gap-2">
          <Link
            href={buildHref({ category: "all" })}
            className={cn(
              "rounded border px-3 py-1.5 text-xs font-semibold",
              category === "all" ? "border-navy-900 bg-navy-900 text-white" : "border-navy-200 text-ink-600"
            )}
          >
            {dict.common.all}
          </Link>
          {categories.map((c) => (
            <Link
              key={c.slug}
              href={buildHref({ category: c.slug })}
              className={cn(
                "rounded border px-3 py-1.5 text-xs font-semibold",
                category === c.slug ? "border-navy-900 bg-navy-900 text-white" : "border-navy-200 text-ink-600"
              )}
            >
              {locale === "zh" ? c.zh : c.en}
            </Link>
          ))}
        </div>

        {items.length === 0 ? (
          <EmptyState title={dict.common.noResults} />
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((event) => (
              <EventCard key={event.id} locale={locale} event={event} />
            ))}
          </div>
        )}

        <Pagination page={page} pageSize={pageSize} total={total} buildHref={(p) => buildHref({ page: p })} />
      </Container>
    </>
  );
}
