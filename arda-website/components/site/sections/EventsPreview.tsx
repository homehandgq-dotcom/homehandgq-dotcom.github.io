import { Section, SectionHeading, EmptyState } from "@/components/ui/primitives";
import { EventCard } from "@/components/site/cards/EventCard";
import { LinkButton } from "@/components/ui/Button";
import { RevealGroup, RevealItem } from "@/components/motion/Reveal";
import type { Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import type { EventItem } from "@/lib/supabase/types";

export function EventsPreview({ locale, items }: { locale: Locale; items: EventItem[] }) {
  const dict = getDictionary(locale);
  return (
    <Section tone="mist">
      <div className="container-arda">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <SectionHeading kicker="Programs & Events" title={dict.home.eventsTitle} />
          <LinkButton href={`/${locale}/events`} variant="secondary" size="sm" arrow>
            {dict.common.viewAll}
          </LinkButton>
        </div>
        {items.length === 0 ? (
          <EmptyState
            title={locale === "zh" ? "暂无即将举行的活动" : "No upcoming events yet"}
            desc={
              locale === "zh"
                ? "协会的论坛、峰会与培训活动将陆续在此发布。"
                : "Forums, summits and training programs will be announced here."
            }
          />
        ) : (
          <RevealGroup className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((event) => (
              <RevealItem key={event.id}>
                <EventCard locale={locale} event={event} />
              </RevealItem>
            ))}
          </RevealGroup>
        )}
      </div>
    </Section>
  );
}
