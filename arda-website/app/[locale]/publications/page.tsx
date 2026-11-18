import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { listPublications, PUBLICATION_CATEGORIES } from "@/lib/data/publications";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { PageHero } from "@/components/site/PageHero";
import { Container, EmptyState } from "@/components/ui/primitives";
import { Pagination } from "@/components/ui/Pagination";
import { PublicationCard } from "@/components/site/publications/PublicationCard";
import { cn } from "@/lib/utils/cn";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = (isLocale(rawLocale) ? rawLocale : "zh") as Locale;
  return { title: locale === "zh" ? "协会刊物" : "Publications" };
}

export default async function PublicationsListPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ category?: string; page?: string }>;
}) {
  const { locale: rawLocale } = await params;
  if (!isLocale(rawLocale)) notFound();
  const locale = rawLocale as Locale;
  const dict = getDictionary(locale);
  const sp = await searchParams;
  const category = sp.category || "all";
  const page = Math.max(1, Number(sp.page) || 1);

  const { items, total, pageSize } = await listPublications({ category, page, pageSize: 12 });

  const title = locale === "zh" ? "协会刊物" : "Publications";

  function buildHref(overrides: Record<string, string | number>) {
    const params = new URLSearchParams();
    if (category !== "all") params.set("category", category);
    if (page > 1) params.set("page", String(page));
    Object.entries(overrides).forEach(([k, v]) => {
      if (v === "" || v === "all" || v === 1) params.delete(k);
      else params.set(k, String(v));
    });
    const qs = params.toString();
    return `/${locale}/publications${qs ? `?${qs}` : ""}`;
  }

  return (
    <>
      <Breadcrumbs locale={locale} items={[{ label: title }]} />
      <PageHero
        kicker="Publications"
        title={title}
        desc={
          locale === "zh"
            ? "协会手册、会刊、杂志等公开资料，支持在线阅读。"
            : "Handbooks, journals and magazines available to read online."
        }
      />
      <Container className="py-14 lg:py-20">
        <div className="mb-8 flex flex-wrap gap-2">
          <Link
            href={buildHref({ category: "all" })}
            className={cn(
              "rounded-full px-4 py-2 text-sm font-semibold",
              category === "all" ? "bg-navy-900 text-white" : "bg-mist text-ink-600 hover:bg-navy-50"
            )}
          >
            {dict.common.all}
          </Link>
          {PUBLICATION_CATEGORIES.map((c) => (
            <Link
              key={c.value}
              href={buildHref({ category: c.value })}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-semibold",
                category === c.value ? "bg-navy-900 text-white" : "bg-mist text-ink-600 hover:bg-navy-50"
              )}
            >
              {locale === "zh" ? c.label_zh : c.label_en}
            </Link>
          ))}
        </div>

        {items.length === 0 ? (
          <EmptyState title={dict.common.noResults} />
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {items.map((item) => (
              <PublicationCard key={item.id} locale={locale} item={item} />
            ))}
          </div>
        )}

        <Pagination page={page} pageSize={pageSize} total={total} buildHref={(p) => buildHref({ page: p })} />
      </Container>
    </>
  );
}
