import { Section, SectionHeading, EmptyState } from "@/components/ui/primitives";
import { ChapterCard } from "@/components/site/cards/ChapterCard";
import { LinkButton } from "@/components/ui/Button";
import { RevealGroup, RevealItem } from "@/components/motion/Reveal";
import { NetworkBackground } from "@/components/motion/NetworkBackground";
import type { Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import type { Chapter, LeadershipPerson } from "@/lib/supabase/types";

export function ChaptersSection({
  locale,
  items,
}: {
  locale: Locale;
  items: (Chapter & { leader: Partial<LeadershipPerson> | null })[];
}) {
  const dict = getDictionary(locale);
  return (
    <Section tone="mist" className="relative overflow-hidden">
      <NetworkBackground className="pointer-events-none absolute inset-x-0 top-0 h-24 w-full opacity-60" />
      <div className="container-arda relative">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <SectionHeading kicker="Chapters & Global Network" title={dict.home.chaptersTitle} />
          <LinkButton href={`/${locale}/chapters`} variant="secondary" size="sm" arrow>
            {dict.common.viewAll}
          </LinkButton>
        </div>
        {items.length === 0 ? (
          <EmptyState title={locale === "zh" ? "分会信息筹备中" : "Chapter information coming soon"} />
        ) : (
          <RevealGroup className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {items.map((c) => (
              <RevealItem key={c.id}>
                <ChapterCard locale={locale} chapter={c} />
              </RevealItem>
            ))}
          </RevealGroup>
        )}
      </div>
    </Section>
  );
}
