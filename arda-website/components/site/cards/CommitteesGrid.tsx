import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Locale } from "@/lib/i18n/config";
import type { Committee, LeadershipPerson } from "@/lib/supabase/types";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { stripHtml } from "@/lib/utils/format";

/**
 * 「关于我们 → 专业委员会」页面：与「秘书处」页面同一模式——点击侧边栏
 * 「专业委员会」进入本页，直接列出六个常设委员会（下属机构）及其简介、
 * 职责说明与召集人，无需再点第二层。召集人姓名旁的「查看详情」链接指向
 * /committees/[slug] 完整介绍页（含委员、动态等）。
 * 数据来自 committees 表（listCommittees()），与组织架构图使用同一份数据，
 * 不重复维护第二份文案。
 */
export function CommitteesGrid({
  locale,
  committees,
}: {
  locale: Locale;
  committees: (Committee & { convener: Partial<LeadershipPerson> | null })[];
}) {
  const dict = getDictionary(locale);

  if (committees.length === 0) {
    return (
      <p className="text-sm text-ink-500">
        {locale === "zh" ? "委员会信息筹备中。" : "Committee information coming soon."}
      </p>
    );
  }

  return (
    <div className="space-y-10">
      {committees.map((c) => {
        const name = locale === "zh" ? c.name_zh : c.name_en;
        // intro_zh/responsibilities_zh 是富文本字段（存 HTML），拼接展示前先用 stripHtml
        // 去掉标签只留纯文字，否则会跟委员会列表卡片一样把 <p style="..."> 原样显示出来
        const desc = locale === "zh"
          ? [stripHtml(c.intro_zh), stripHtml(c.responsibilities_zh)].filter(Boolean).join(" ")
          : [stripHtml(c.intro_en), stripHtml(c.responsibilities_en)].filter(Boolean).join(" ");
        const convenerName = c.convener && !c.convener.is_tba
          ? locale === "zh"
            ? c.convener.name_zh
            : c.convener.name_en
          : null;

        return (
          <div key={c.id} className="rounded-lg border border-navy-100 bg-white p-6">
            <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="text-lg font-bold text-navy-900">{name}</h2>
              <Link
                href={`/${locale}/committees/${c.slug}`}
                className="flex items-center gap-1 text-sm font-semibold text-navy-700 hover:text-navy-900"
              >
                {dict.common.learnMore}
                <ArrowRight className="h-3.5 w-3.5" aria-hidden />
              </Link>
            </div>
            {desc && <p className="mb-4 text-sm leading-relaxed text-ink-600">{desc}</p>}
            {/* 召集人待定时不再显示"召集人待定"这行占位文字，直接不显示这一行；
                只有确定了具体人选才显示"召集人：XXX" */}
            {convenerName && (
              <p className="text-xs font-medium text-gold-600">
                {locale === "zh" ? "召集人：" : "Convener: "}
                {convenerName}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
