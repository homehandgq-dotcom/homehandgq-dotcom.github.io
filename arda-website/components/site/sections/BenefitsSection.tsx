import { Section, SectionHeading } from "@/components/ui/primitives";
import type { Locale } from "@/lib/i18n/config";
import type { BenefitsData } from "@/lib/data/homeSections";

/** 首页新板块：在协会能获得什么（八样）+ 文化破圈做法与样板品牌。内容来自站点设置 home_benefits，后台可改。 */
export function BenefitsSection({ locale, data }: { locale: Locale; data: BenefitsData }) {
  const zh = locale === "zh";
  if (data.items.length === 0) return null;
  return (
    <Section id="benefits">
      <div className="container-arda">
        <SectionHeading
          kicker="Membership"
          title={zh ? "在协会，能获得什么" : "What Members Gain"}
          desc={zh ? data.intro_zh : data.intro_en}
        />
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {data.items.map((item, i) => (
            <div key={i} className="card-interactive rounded-lg border border-navy-100 bg-white p-6">
              <p className="text-xs font-bold uppercase tracking-[0.15em] text-gold-600">
                {zh ? `获得 ${i + 1}` : `Benefit ${i + 1}`}
              </p>
              <h3 className="mb-2 mt-2 text-base font-bold text-navy-900">
                {zh ? item.title_zh : item.title_en}
              </h3>
              <p className="text-sm leading-relaxed text-ink-600">{zh ? item.desc_zh : item.desc_en}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 rounded-lg border border-navy-100 border-l-4 border-l-gold-400 bg-mist p-6 lg:p-8">
          <h3 className="text-xl font-bold text-navy-900">{zh ? data.culture_title_zh : data.culture_title_en}</h3>
          <div className="mt-4 space-y-4">
            {(zh ? data.culture_paragraphs_zh : data.culture_paragraphs_en).map((p, i) => (
              <p key={i} className="text-sm leading-relaxed text-ink-600 lg:text-base">
                {p}
              </p>
            ))}
          </div>
          {data.culture_samples.length > 0 && (
            <div className="mt-6 border-t border-navy-100 pt-5">
              <p className="mb-3 text-sm text-ink-500">
                {zh
                  ? "破圈样板 —— 下面这些品牌，都是把中餐做进主流市场的样子："
                  : "Breakthrough examples — brands that have brought Chinese food into the mainstream market:"}
              </p>
              <ul className="grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-2">
                {data.culture_samples.map((s) => (
                  <li key={s.url} className="text-sm">
                    <a
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-bold text-gold-600 hover:underline"
                    >
                      {zh ? s.name_zh : s.name_en}
                    </a>{" "}
                    <span className="text-ink-600">— {zh ? s.note_zh : s.note_en}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </Section>
  );
}
