import { Section, SectionHeading } from "@/components/ui/primitives";
import { LinkButton } from "@/components/ui/Button";
import type { Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import type { MembershipType } from "@/lib/supabase/types";

/** 首页新板块：会员类别六类。直接调后台会员类别数据，与会员类别子页面同一份数据。 */
export function MembershipTypesSection({ locale, items }: { locale: Locale; items: MembershipType[] }) {
  const dict = getDictionary(locale);
  if (items.length === 0) return null;
  return (
    <Section tone="mist" id="membership-types">
      <div className="container-arda">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <SectionHeading
            kicker="Membership"
            title={locale === "zh" ? "会员类别" : "Membership Types"}
            desc={
              locale === "zh"
                ? "会员可参加协会活动、论坛、培训与交流，参与委员会与分会，并出席年度会员大会。现阶段会费口径以协会正式公告为准。"
                : "Members may join Association activities, forums, training and exchanges, take part in committees and chapters, and attend the annual general meeting. Current membership fees follow the Association's official announcements."
            }
          />
          <LinkButton href={`/${locale}/membership/apply`} size="sm" arrow>
            {dict.nav.applyNow}
          </LinkButton>
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((t) => (
            <div key={t.id} className="card-interactive rounded-lg border border-navy-100 bg-white p-6">
              <h3 className="mb-2 text-base font-bold text-navy-900">
                {locale === "zh" ? t.name_zh : t.name_en}
              </h3>
              <p className="text-sm leading-relaxed text-ink-600">
                {locale === "zh" ? t.description_zh : t.description_en}
              </p>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}
