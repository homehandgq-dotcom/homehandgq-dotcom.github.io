import { Section, SectionHeading } from "@/components/ui/primitives";
import type { Locale } from "@/lib/i18n/config";
import type { EmpowerData } from "@/lib/data/homeSections";

/** 首页新板块：赋能餐饮实体（金融 / AI / 门店模式三张卡 + 纽约餐饮学院免费课对接）。内容来自站点设置 home_empower，后台可改。 */
export function EmpowerSection({ locale, data }: { locale: Locale; data: EmpowerData }) {
  const zh = locale === "zh";
  if (data.cards.length === 0) return null;
  return (
    <Section tone="mist" id="empower">
      <div className="container-arda">
        <SectionHeading
          kicker="Empowering Restaurants"
          title={zh ? "赋能餐饮实体" : "Empowering Restaurants"}
          desc={zh ? data.intro_zh : data.intro_en}
        />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {data.cards.map((card, i) => (
            <div
              key={i}
              className="card-interactive flex flex-col rounded-lg border border-navy-100 border-t-4 border-t-gold-400 bg-white p-6"
            >
              <p className="text-xs font-bold uppercase tracking-[0.15em] text-gold-600">
                {zh ? card.tag_zh : card.tag_en}
              </p>
              <h3 className="mb-3 mt-2 text-lg font-bold text-navy-900">{zh ? card.title_zh : card.title_en}</h3>
              <div className="space-y-3">
                {(zh ? card.paragraphs_zh : card.paragraphs_en).map((p, j) => (
                  <p key={j} className="text-sm leading-relaxed text-ink-600">
                    {p}
                  </p>
                ))}
              </div>
              <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-relaxed text-ink-600">
                {(zh ? card.bullets_zh : card.bullets_en).map((b, j) => (
                  <li key={j}>{b}</li>
                ))}
              </ul>
              {(zh ? card.note_zh : card.note_en) && (
                <p className="mt-4 text-sm leading-relaxed text-ink-500">{zh ? card.note_zh : card.note_en}</p>
              )}
            </div>
          ))}
        </div>

        <div className="mt-10 rounded-lg border border-navy-100 border-l-4 border-l-gold-400 bg-white p-6 lg:p-8">
          <h3 className="text-xl font-bold text-navy-900">{zh ? data.academy_title_zh : data.academy_title_en}</h3>
          <div className="mt-4 space-y-4">
            {(zh ? data.academy_paragraphs_zh : data.academy_paragraphs_en).map((p, i) => (
              <p key={i} className="text-sm leading-relaxed text-ink-600 lg:text-base">
                {p}
              </p>
            ))}
          </div>
        </div>
      </div>
    </Section>
  );
}
