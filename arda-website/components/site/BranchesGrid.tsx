import { ChapterCard } from "@/components/site/cards/ChapterCard";
import type { Locale } from "@/lib/i18n/config";
import type { Chapter, LeadershipPerson } from "@/lib/supabase/types";

// 分支机构说明文字（依据《美国餐饮业发展协会组织章程》整理），与组织架构图节点
// 弹窗展示的是同一份文案，不重复维护第二份
const DESC = {
  chapters: {
    zh: "本会可以经董事局决议设立地方分会，包括纽约、加州、德州、佛州、新泽西、伊利诺伊、华盛顿州、波士顿、拉斯维加斯、夏威夷等地及海外合作机构。分会应接受董事局监督，其负责人任免及年度计划应报董事局核备；不得逾越授权范围对外行动、单独募款或签约；财务并入本会统一管理。",
    en: "The Board may establish local chapters by resolution, including in New York, California, Texas, Florida, New Jersey, Illinois, Washington State, Boston, Las Vegas, Hawaii, and overseas partner organizations. Chapters are subject to Board oversight; leadership appointments and annual plans are reported to the Board; chapters may not act, fundraise or contract beyond their authorized scope, and finances are consolidated under the Association's unified management.",
  },
  alliances: {
    zh: "本会可以结合会员及相关企业发起或加入行业联盟。各联盟不具独立法人资格，其运作规则由董事局另订，对外行为应于授权范围内进行，财务及重大决议应报董事局备查。",
    en: "The Association may form or join industry alliances with members and related enterprises. Alliances have no independent legal status; their operating rules are set separately by the Board, external actions must remain within authorized scope, and finances and major resolutions are reported to the Board.",
  },
} as const;

/**
 * 「关于我们 → 分支机构」页面：与「秘书处」页面同一模式——点击侧边栏
 * 「分支机构」进入本页，列出下属的两个机构：地方分会（chapters 表，附各州
 * 分会卡片）、行业联盟（暂无独立数据表，仅展示章程说明文字）。
 * 原来还有一块「国际合作发展事务官」，应要求已去掉。
 */
export function BranchesGrid({
  locale,
  chapters,
}: {
  locale: Locale;
  chapters: (Chapter & { leader: Partial<LeadershipPerson> | null })[];
}) {
  const stateChapters = chapters.filter((c) => c.region_type !== "overseas");
  const overseas = chapters.filter((c) => c.region_type === "overseas");

  return (
    <div className="space-y-14">
      <div>
        <h2 className="mb-4 text-lg font-bold text-navy-900">{locale === "zh" ? "地方分会" : "Local Chapters"}</h2>
        <p className="mb-5 text-sm leading-relaxed text-ink-600">
          {locale === "zh" ? DESC.chapters.zh : DESC.chapters.en}
        </p>
        {stateChapters.length === 0 ? (
          <p className="text-sm text-ink-500">
            {locale === "zh" ? "各州分会负责人拟定中。" : "State chapter leads are being finalized."}
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {stateChapters.map((c) => (
              <ChapterCard key={c.id} locale={locale} chapter={c} />
            ))}
          </div>
        )}
        {overseas.length > 0 && (
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {overseas.map((c) => (
              <ChapterCard key={c.id} locale={locale} chapter={c} />
            ))}
          </div>
        )}
      </div>

      <div>
        <h2 className="mb-4 text-lg font-bold text-navy-900">{locale === "zh" ? "行业联盟" : "Industry Alliances"}</h2>
        <p className="text-sm leading-relaxed text-ink-600">
          {locale === "zh" ? DESC.alliances.zh : DESC.alliances.en}
        </p>
      </div>
    </div>
  );
}
