import { CheckCircle2 } from "lucide-react";
import { Section, SectionHeading } from "@/components/ui/primitives";
import { LinkButton } from "@/components/ui/Button";
import type { Locale } from "@/lib/i18n/config";
import type { MissionItem } from "@/lib/data/siteSettings";

export function ValueGrid({
  locale,
  title,
  kicker,
  items,
  ctaHref,
  ctaLabel,
}: {
  locale: Locale;
  title: string;
  kicker: string;
  items: MissionItem[];
  ctaHref: string;
  ctaLabel: string;
}) {
  if (items.length === 0) return null;
  return (
    <Section>
      <div className="container-arda grid grid-cols-1 gap-12 lg:grid-cols-[1fr_1.4fr]">
        <div>
          <SectionHeading kicker={kicker} title={title} />
          <LinkButton href={ctaHref} size="md">
            {ctaLabel}
          </LinkButton>
        </div>
        <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {items.map((item, i) => (
            <li key={i} className="card-interactive flex gap-3 rounded-lg border border-navy-100 bg-white p-5">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-gold-500" aria-hidden />
              <div>
                <p className="text-sm font-bold text-navy-900">
                  {locale === "zh" ? item.title_zh : item.title_en}
                </p>
                <p className="mt-1 text-sm text-ink-600">
                  {locale === "zh" ? item.desc_zh : item.desc_en}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </Section>
  );
}
