import { Section, SectionHeading } from "@/components/ui/primitives";
import type { Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import type { MissionItem } from "@/lib/data/siteSettings";

export function MissionGrid({ locale, items }: { locale: Locale; items: MissionItem[] }) {
  const dict = getDictionary(locale);
  if (items.length === 0) return null;
  return (
    <Section tone="mist">
      <div className="container-arda">
        <SectionHeading
          kicker="ARDA"
          title={dict.home.missionTitle}
          align="center"
        />
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item, i) => (
            <div key={i} className="card-interactive rounded-lg border border-navy-100 bg-white p-6">
              <span className="mb-3 flex h-9 w-9 items-center justify-center rounded-full bg-navy-900 text-xs font-bold text-gold-300">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="mb-2 text-sm font-bold text-navy-900">
                {locale === "zh" ? item.title_zh : item.title_en}
              </h3>
              <p className="text-sm leading-relaxed text-ink-600">
                {locale === "zh" ? item.desc_zh : item.desc_en}
              </p>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}
