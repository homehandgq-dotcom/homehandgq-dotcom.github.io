import { Section, SectionHeading } from "@/components/ui/primitives";
import { PeopleGrid } from "@/components/site/PeopleGrid";
import { LinkButton } from "@/components/ui/Button";
import type { Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import type { LeadershipPerson } from "@/lib/supabase/types";

/** 首页新板块：领导架构。直接调后台人员数据（董事局 / 执行理事会 / 荣誉职衔），头像与简介同步后台，不用重复录。 */
export function LeadershipSection({ locale, people }: { locale: Locale; people: LeadershipPerson[] }) {
  const dict = getDictionary(locale);
  if (people.length === 0) return null;
  return (
    <Section tone="mist" id="leadership">
      <div className="container-arda">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <SectionHeading kicker="Leadership" title={locale === "zh" ? "领导架构" : "Leadership"} />
          <LinkButton href={`/${locale}/about`} variant="secondary" size="sm" arrow>
            {dict.common.viewAll}
          </LinkButton>
        </div>
        <PeopleGrid locale={locale} people={people} />
      </div>
    </Section>
  );
}
