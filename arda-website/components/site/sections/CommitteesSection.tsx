import { Section, SectionHeading, EmptyState } from "@/components/ui/primitives";
import { CommitteeCard } from "@/components/site/cards/CommitteeCard";
import { LinkButton } from "@/components/ui/Button";
import type { Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { zhCountNumeral } from "@/lib/utils/format";
import type { Committee, LeadershipPerson } from "@/lib/supabase/types";

export function CommitteesSection({
  locale,
  items,
}: {
  locale: Locale;
  items: (Committee & { convener: Partial<LeadershipPerson> | null })[];
}) {
  const dict = getDictionary(locale);
  // 标题里的委员会数量根据实际拿到的委员会条数现算（不再写死"六大"），
  // 后台增减委员会后这里会自动跟着变，不用再改代码
  const count = items.length;
  const title =
    count > 0
      ? locale === "zh"
        ? `${zhCountNumeral(count)}大专业委员会`
        : `${count} Professional Committees`
      : dict.home.committeesTitle;
  return (
    <Section>
      <div className="container-arda">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <SectionHeading kicker="Committees" title={title} />
          <LinkButton href={`/${locale}/committees`} variant="secondary" size="sm">
            {dict.common.viewAll}
          </LinkButton>
        </div>
        {items.length === 0 ? (
          <EmptyState title={locale === "zh" ? "委员会信息筹备中" : "Committee information coming soon"} />
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((c) => (
              <CommitteeCard key={c.id} locale={locale} committee={c} />
            ))}
          </div>
        )}
      </div>
    </Section>
  );
}
