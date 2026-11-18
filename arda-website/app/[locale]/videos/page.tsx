import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { listVideos, listVideoCategoriesWithCounts } from "@/lib/data/videos";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { PageHero } from "@/components/site/PageHero";
import { Container, EmptyState } from "@/components/ui/primitives";
import { Pagination } from "@/components/ui/Pagination";
import { VideoGrid } from "@/components/site/videos/VideoGrid";
import { cn } from "@/lib/utils/cn";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = (isLocale(rawLocale) ? rawLocale : "zh") as Locale;
  return { title: locale === "zh" ? "协会视频" : "Videos" };
}

export default async function VideosListPage({
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

  const [{ items, total, pageSize }, categories] = await Promise.all([
    listVideos({ category, page, pageSize: 9 }),
    listVideoCategoriesWithCounts(),
  ]);

  // 分类为空（没有任何已发布视频）时不显示对应筛选项
  const visibleCategories = categories.filter((c) => c.count > 0);

  const title = locale === "zh" ? "ARDA 视界" : "ARDA Videos";

  function buildHref(overrides: Record<string, string | number>) {
    const params = new URLSearchParams();
    if (category !== "all") params.set("category", category);
    if (page > 1) params.set("page", String(page));
    Object.entries(overrides).forEach(([k, v]) => {
      if (v === "" || v === "all" || v === 1) params.delete(k);
      else params.set(k, String(v));
    });
    const qs = params.toString();
    return `/${locale}/videos${qs ? `?${qs}` : ""}`;
  }

  return (
    <>
      <Breadcrumbs locale={locale} items={[{ label: title }]} />
      <PageHero
        kicker="ARDA Videos"
        title={title}
        desc={
          locale === "zh"
            ? "记录协会发展，汇聚行业声音，分享精彩时刻。"
            : "Documenting our journey, bringing together industry voices, and sharing memorable moments."
        }
      />
      <Container className="py-14 lg:py-20">
        {visibleCategories.length > 0 && (
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
            {visibleCategories.map((c) => (
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
        )}

        {items.length === 0 ? (
          <EmptyState title={dict.common.noResults} />
        ) : (
          <VideoGrid locale={locale} items={items} />
        )}

        <Pagination page={page} pageSize={pageSize} total={total} buildHref={(p) => buildHref({ page: p })} />
      </Container>
    </>
  );
}
