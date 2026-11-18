import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { listNews, getNewsCategories } from "@/lib/data/news";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { PageHero } from "@/components/site/PageHero";
import { Container, EmptyState } from "@/components/ui/primitives";
import { NewsCard } from "@/components/site/cards/NewsCard";
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
  return { title: dict.nav.news };
}

export default async function NewsListPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ category?: string; q?: string; page?: string }>;
}) {
  const { locale: rawLocale } = await params;
  if (!isLocale(rawLocale)) notFound();
  const locale = rawLocale as Locale;
  const dict = getDictionary(locale);
  const sp = await searchParams;
  const category = sp.category || "all";
  const q = sp.q || "";
  const page = Math.max(1, Number(sp.page) || 1);

  const [{ items, total, pageSize }, categories] = await Promise.all([
    listNews({ categorySlug: category, q, page, pageSize: 9 }),
    getNewsCategories(),
  ]);

  function buildHref(overrides: Record<string, string | number>) {
    const params = new URLSearchParams();
    if (category !== "all") params.set("category", category);
    if (q) params.set("q", q);
    if (page > 1) params.set("page", String(page));
    Object.entries(overrides).forEach(([k, v]) => {
      if (v === "" || v === "all" || v === 1) params.delete(k);
      else params.set(k, String(v));
    });
    const qs = params.toString();
    return `/${locale}/news${qs ? `?${qs}` : ""}`;
  }

  return (
    <>
      <Breadcrumbs locale={locale} items={[{ label: dict.nav.news }]} />
      <PageHero kicker="News & Media" title={dict.nav.news} />
      <Container className="py-14 lg:py-20">
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2">
            <Link
              href={buildHref({ category: "all" })}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-semibold",
                category === "all" ? "bg-navy-900 text-white" : "bg-mist text-ink-600 hover:bg-navy-50"
              )}
            >
              {dict.common.all}
            </Link>
            {categories.map((c) => (
              <Link
                key={c.id}
                href={buildHref({ category: c.slug })}
                className={cn(
                  "rounded-full px-4 py-2 text-sm font-semibold",
                  category === c.slug ? "bg-navy-900 text-white" : "bg-mist text-ink-600 hover:bg-navy-50"
                )}
              >
                {locale === "zh" ? c.name_zh : c.name_en}
              </Link>
            ))}
          </div>
          <form action={`/${locale}/news`} className="flex gap-2">
            {category !== "all" && <input type="hidden" name="category" value={category} />}
            <input
              type="search"
              name="q"
              defaultValue={q}
              placeholder={locale === "zh" ? "搜索新闻标题…" : "Search news…"}
              className="h-10 w-56 rounded border border-navy-200 px-3 text-sm"
            />
            <button type="submit" className="rounded bg-navy-900 px-4 text-sm font-semibold text-white">
              {dict.common.search}
            </button>
          </form>
        </div>

        {items.length === 0 ? (
          <EmptyState title={dict.common.noResults} />
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((post) => (
              <NewsCard key={post.id} locale={locale} post={post} />
            ))}
          </div>
        )}

        <Pagination page={page} pageSize={pageSize} total={total} buildHref={(p) => buildHref({ page: p })} />
      </Container>
    </>
  );
}
