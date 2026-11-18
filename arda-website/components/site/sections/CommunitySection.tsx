import { Section, SectionHeading } from "@/components/ui/primitives";
import type { Locale } from "@/lib/i18n/config";
import type { CommunityData } from "@/lib/data/homeSections";

/** 首页新板块：协会活动与社群（羽毛球友会 / 每月饭局 / 闭门圆桌）。内容来自站点设置 home_community，后台可改。 */
export function CommunitySection({ locale, data }: { locale: Locale; data: CommunityData }) {
  const zh = locale === "zh";
  if (data.activities.length === 0) return null;
  return (
    <Section id="community">
      <div className="container-arda">
        <SectionHeading
          kicker="Community"
          title={zh ? "协会活动与社群" : "Activities & Community"}
          desc={zh ? data.intro_zh : data.intro_en}
        />
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {data.activities.map((a, i) => (
            <div key={i} className="card-interactive flex gap-4 rounded-lg border border-navy-100 bg-white p-6">
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-navy-900 px-1 text-center text-xs font-bold leading-tight text-gold-300">
                {zh ? a.freq_zh : a.freq_en}
              </span>
              <div>
                <h3 className="mb-1 text-base font-bold text-navy-900">{zh ? a.title_zh : a.title_en}</h3>
                <p className="text-sm leading-relaxed text-ink-600">{zh ? a.desc_zh : a.desc_en}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 rounded-lg border border-navy-100 border-l-4 border-l-gold-400 bg-mist p-6 lg:p-8">
          <h3 className="text-xl font-bold text-navy-900">{zh ? data.why_title_zh : data.why_title_en}</h3>
          <div className="mt-4 space-y-4">
            {(zh ? data.why_paragraphs_zh : data.why_paragraphs_en).map((p, i) => (
              <p key={i} className="text-sm leading-relaxed text-ink-600 lg:text-base">
                {p}
              </p>
            ))}
          </div>
          <p className="mt-5 border-t border-navy-100 pt-4 text-sm leading-relaxed text-ink-600">
            <span className="mr-2 rounded bg-gold-100 px-2 py-1 text-xs font-bold text-gold-700">
              {zh ? "活动照片" : "Event Photos"}
            </span>
            {zh ? data.photo_note_zh : data.photo_note_en}
          </p>
        </div>
      </div>
    </Section>
  );
}
