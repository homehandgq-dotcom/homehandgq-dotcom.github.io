import { Section, SectionHeading, EmptyState } from "@/components/ui/primitives";
import { CoverImage } from "@/components/ui/CoverImage";
import type { Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import type { PublicMember } from "@/lib/data/membership";

export function FeaturedMembers({ locale, items }: { locale: Locale; items: PublicMember[] }) {
  const dict = getDictionary(locale);
  return (
    <Section>
      <div className="container-arda">
        <SectionHeading kicker="Members" title={dict.home.membersTitle} align="center" />
        {items.length === 0 ? (
          <EmptyState
            title={locale === "zh" ? "会员企业展示区" : "Member Companies"}
            desc={
              locale === "zh"
                ? "审核通过并授权公开展示的会员企业将展示于此。"
                : "Approved members who opt in to public display will be featured here."
            }
          />
        ) : (
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
            {items.map((m) => (
              <div
                key={m.id}
                className="card-interactive flex flex-col items-center gap-3 rounded-lg border border-navy-100 bg-white p-5 text-center"
              >
                <CoverImage
                  src={m.logo_url}
                  alt={locale === "zh" ? m.display_name_zh : m.display_name_en}
                  className="h-16 w-16 rounded-full"
                  objectFit="contain"
                />
                <p className="text-sm font-semibold text-navy-900">
                  {locale === "zh" ? m.display_name_zh : m.display_name_en}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </Section>
  );
}
