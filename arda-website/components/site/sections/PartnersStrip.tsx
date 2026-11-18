import { Section, SectionHeading, EmptyState } from "@/components/ui/primitives";
import { CoverImage } from "@/components/ui/CoverImage";
import type { Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import type { Partner } from "@/lib/supabase/types";

export function PartnersStrip({ locale, items }: { locale: Locale; items: Partner[] }) {
  const dict = getDictionary(locale);
  return (
    <Section tone="mist">
      <div className="container-arda">
        <SectionHeading kicker="Global Network" title={dict.home.partnersTitle} align="center" />
        {items.length === 0 ? (
          <EmptyState
            title={locale === "zh" ? "合作伙伴展示区" : "Partner Organizations"}
            desc={
              locale === "zh"
                ? "协会的战略、企业、媒体与教育合作伙伴将展示于此。"
                : "ARDA's strategic, corporate, media and educational partners will be featured here."
            }
          />
        ) : (
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-4 lg:grid-cols-6">
            {items.map((p) => (
              <div
                key={p.id}
                className="card-interactive flex items-center justify-center rounded-lg border border-navy-100 bg-white p-4"
              >
                <CoverImage
                  src={p.logo_url}
                  alt={locale === "zh" ? p.name_zh : p.name_en}
                  className="h-14 w-full"
                  objectFit="contain"
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </Section>
  );
}
