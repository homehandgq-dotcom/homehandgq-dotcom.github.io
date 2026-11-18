import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { listPublicMembers, listMembershipTypes } from "@/lib/data/membership";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { PageHero } from "@/components/site/PageHero";
import { Container, EmptyState } from "@/components/ui/primitives";
import { CoverImage } from "@/components/ui/CoverImage";
import { Pagination } from "@/components/ui/Pagination";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = (isLocale(rawLocale) ? rawLocale : "zh") as Locale;
  return { title: locale === "zh" ? "会员名录" : "Member Directory" };
}

export default async function MemberDirectoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const { locale: rawLocale } = await params;
  if (!isLocale(rawLocale)) notFound();
  const locale = rawLocale as Locale;
  const dict = getDictionary(locale);
  const sp = await searchParams;
  const q = sp.q || "";
  const page = Math.max(1, Number(sp.page) || 1);

  const [{ items, total, pageSize }] = await Promise.all([
    listPublicMembers({ q, page, pageSize: 12 }),
    listMembershipTypes(),
  ]);

  function buildHref(overrides: Record<string, string | number>) {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (page > 1) params.set("page", String(page));
    Object.entries(overrides).forEach(([k, v]) => {
      if (v === "" || v === 1) params.delete(k);
      else params.set(k, String(v));
    });
    const qs = params.toString();
    return `/${locale}/membership/directory${qs ? `?${qs}` : ""}`;
  }

  return (
    <>
      <Breadcrumbs
        locale={locale}
        items={[{ label: dict.nav.membership, href: `/${locale}/membership` }, { label: locale === "zh" ? "会员名录" : "Member Directory" }]}
      />
      <PageHero
        kicker="Membership"
        title={locale === "zh" ? "会员名录" : "Member Directory"}
        desc={
          locale === "zh"
            ? "以下为经审核批准、并授权公开展示的会员企业与个人。会员的联系方式等内部信息不对外公开。"
            : "Below are approved members who have opted in to public display. Members' contact details and internal information remain private."
        }
      />
      <Container className="py-14 lg:py-20">
        <form action={`/${locale}/membership/directory`} className="mb-8 flex max-w-md gap-2">
          <input
            type="search"
            name="q"
            defaultValue={q}
            placeholder={locale === "zh" ? "搜索会员名称…" : "Search members…"}
            className="input"
          />
          <button type="submit" className="shrink-0 rounded bg-navy-900 px-5 text-sm font-semibold text-white">
            {dict.common.search}
          </button>
        </form>

        {items.length === 0 ? (
          <EmptyState
            title={locale === "zh" ? "会员名录筹备中" : "Member directory coming soon"}
            desc={
              locale === "zh"
                ? "首批会员审核通过后将展示于此。"
                : "The first cohort of approved members will be listed here."
            }
          />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((m) => (
              <div key={m.id} className="flex items-center gap-4 rounded-lg border border-navy-100 bg-white p-5">
                <CoverImage
                  src={m.logo_url}
                  alt={locale === "zh" ? m.display_name_zh : m.display_name_en}
                  className="h-14 w-14 shrink-0 rounded-full"
                  objectFit="contain"
                />
                <div className="min-w-0">
                  <p className="truncate font-bold text-navy-900">
                    {locale === "zh" ? m.display_name_zh : m.display_name_en}
                  </p>
                  {(m.company_name_zh || m.company_name_en) && (
                    <p className="truncate text-sm text-ink-600">
                      {locale === "zh" ? m.company_name_zh : m.company_name_en}
                    </p>
                  )}
                  {(m.city || m.state) && (
                    <p className="mt-0.5 text-xs text-ink-400">{[m.city, m.state].filter(Boolean).join(", ")}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <Pagination page={page} pageSize={pageSize} total={total} buildHref={(p) => buildHref({ page: p })} />
      </Container>
    </>
  );
}
