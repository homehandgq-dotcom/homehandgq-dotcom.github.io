import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Globe } from "lucide-react";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { listPartners } from "@/lib/data/partners";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { PageHero } from "@/components/site/PageHero";
import { Container, EmptyState } from "@/components/ui/primitives";
import { CoverImage } from "@/components/ui/CoverImage";
import type { Partner } from "@/lib/supabase/types";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = (isLocale(rawLocale) ? rawLocale : "zh") as Locale;
  const dict = getDictionary(locale);
  return { title: dict.nav.partners };
}

const categories: { key: Partner["category"]; zh: string; en: string }[] = [
  { key: "strategic", zh: "战略合作伙伴", en: "Strategic Partners" },
  { key: "corporate", zh: "企业合作伙伴", en: "Corporate Partners" },
  { key: "media", zh: "媒体合作伙伴", en: "Media Partners" },
  { key: "educational", zh: "教育合作伙伴", en: "Educational Partners" },
  { key: "government_community", zh: "政府与社区合作", en: "Government & Community Relations" },
];

export default async function PartnersPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  if (!isLocale(rawLocale)) notFound();
  const locale = rawLocale as Locale;
  const dict = getDictionary(locale);
  const allPartners = await listPartners();

  return (
    <>
      <Breadcrumbs locale={locale} items={[{ label: dict.nav.partners }]} />
      <PageHero kicker="Partners" title={dict.nav.partners} />
      <Container className="space-y-14 py-14 lg:py-20">
        {categories.map((cat) => {
          const items = allPartners.filter((p) => p.category === cat.key);
          return (
            <div key={cat.key} id={cat.key} className="scroll-mt-28">
              <h2 className="mb-6 text-lg font-bold text-navy-900">
                {locale === "zh" ? cat.zh : cat.en}
              </h2>
              {items.length === 0 ? (
                <EmptyState title={locale === "zh" ? "合作伙伴信息筹备中" : "Partner listing coming soon"} />
              ) : (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {items.map((p) => {
                    const name = locale === "zh" ? p.name_zh : p.name_en;
                    const desc = locale === "zh" ? p.description_zh : p.description_en;
                    return (
                      <div
                        key={p.id}
                        className="flex flex-col items-center gap-3 rounded-lg border border-navy-100 bg-white p-6 text-center"
                      >
                        <CoverImage
                          src={p.logo_url}
                          alt={name}
                          className="h-20 w-full"
                          objectFit="contain"
                          bgClassName="bg-white"
                        />
                        <p className="text-sm font-bold text-navy-900">{name}</p>
                        {desc && <p className="line-clamp-3 text-xs leading-relaxed text-ink-500">{desc}</p>}
                        {p.website && (
                          <a
                            href={p.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-navy-700 hover:underline"
                          >
                            <Globe className="h-3.5 w-3.5" aria-hidden />
                            {locale === "zh" ? "访问官网" : "Visit Website"}
                          </a>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </Container>
    </>
  );
}
