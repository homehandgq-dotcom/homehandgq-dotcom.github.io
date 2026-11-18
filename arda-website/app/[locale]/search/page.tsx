import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { globalSearch } from "@/lib/data/navigation";
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
  return { title: dict.common.search, robots: { index: false } };
}

export default async function SearchPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string }>;
}) {
  const { locale: rawLocale } = await params;
  if (!isLocale(rawLocale)) notFound();
  const locale = rawLocale as Locale;
  const dict = getDictionary(locale);
  const { q = "" } = await searchParams;

  const results = q ? await globalSearch(q) : null;
  const totalCount = results
    ? results.news.length + results.events.length + results.committees.length + results.chapters.length + results.pages.length
    : 0;

  return (
    <>
      <Breadcrumbs locale={locale} items={[{ label: dict.common.search }]} />
      <PageHero kicker="Search" title={dict.common.search} />
      <Container className="py-14 lg:py-20">
        <form action={`/${locale}/search`} className="mb-10 flex max-w-xl gap-2">
          <input
            type="search"
            name="q"
            defaultValue={q}
            placeholder={locale === "zh" ? "搜索新闻、活动、委员会、分会…" : "Search news, events, committees, chapters…"}
            className="input"
            autoFocus
          />
          <button type="submit" className="shrink-0 rounded bg-navy-900 px-5 text-sm font-semibold text-white">
            {dict.common.search}
          </button>
        </form>

        {!q && (
          <p className="text-sm text-ink-500">
            {locale === "zh" ? "请输入关键词开始搜索。" : "Enter a keyword to start searching."}
          </p>
        )}

        {q && totalCount === 0 && <EmptyState title={dict.common.noResults} />}

        {results && (
          <div className="space-y-10">
            <ResultGroup
              title={locale === "zh" ? "新闻" : "News"}
              items={results.news.map((n) => ({
                href: `/${locale}/news/${n.slug}`,
                title: locale === "zh" ? n.title_zh : n.title_en,
              }))}
            />
            <ResultGroup
              title={locale === "zh" ? "活动" : "Events"}
              items={results.events.map((e) => ({
                href: `/${locale}/events/${e.slug}`,
                title: locale === "zh" ? e.title_zh : e.title_en,
              }))}
            />
            <ResultGroup
              title={locale === "zh" ? "委员会" : "Committees"}
              items={results.committees.map((c) => ({
                href: `/${locale}/committees/${c.slug}`,
                title: locale === "zh" ? c.name_zh : c.name_en,
              }))}
            />
            <ResultGroup
              title={locale === "zh" ? "分会" : "Chapters"}
              items={results.chapters.map((c) => ({
                href: `/${locale}/chapters/${c.slug}`,
                title: locale === "zh" ? c.name_zh : c.name_en,
              }))}
            />
            <ResultGroup
              title={locale === "zh" ? "页面" : "Pages"}
              items={results.pages.map((p) => ({
                href: `/${locale}/${p.group === "legal" ? "legal/" : p.group === "services" ? "services/" : "about/"}${p.slug}`,
                title: locale === "zh" ? p.title_zh : p.title_en,
              }))}
            />
          </div>
        )}
      </Container>
    </>
  );
}

function ResultGroup({ title, items }: { title: string; items: { href: string; title: string }[] }) {
  if (items.length === 0) return null;
  return (
    <div>
      <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-gold-600">{title}</h2>
      <ul className="divide-y divide-navy-100 rounded-lg border border-navy-100">
        {items.map((item, i) => (
          <li key={i}>
            <Link href={item.href} className="block px-4 py-3 text-sm font-medium text-navy-900 hover:bg-navy-50">
              {item.title}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
