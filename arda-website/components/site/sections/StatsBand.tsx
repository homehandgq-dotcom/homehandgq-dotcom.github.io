import type { Locale } from "@/lib/i18n/config";
import type { HomeStat } from "@/lib/data/siteSettings";
import { AnimatedCounter } from "@/components/motion/AnimatedCounter";

export function StatsBand({ locale, stats }: { locale: Locale; stats: HomeStat[] }) {
  if (stats.length === 0) return null;
  return (
    <div className="border-b border-navy-100 bg-white">
      <div className="container-arda grid grid-cols-2 gap-6 py-10 sm:grid-cols-4">
        {stats.map((s) => (
          <div key={s.key} className="text-center">
            <p className="text-3xl font-extrabold text-navy-900 lg:text-4xl">
              <AnimatedCounter value={s.value} />
              {s.suffix && <span className="text-gold-500">{s.suffix}</span>}
            </p>
            <p className="mt-1 text-xs font-medium uppercase tracking-wide text-ink-500">
              {locale === "zh" ? s.label_zh : s.label_en}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
