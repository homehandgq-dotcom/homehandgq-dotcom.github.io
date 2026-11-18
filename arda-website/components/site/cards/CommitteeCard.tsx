import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Locale } from "@/lib/i18n/config";
import type { Committee, LeadershipPerson } from "@/lib/supabase/types";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { stripHtml } from "@/lib/utils/format";

export function CommitteeCard({
  locale,
  committee,
}: {
  locale: Locale;
  committee: Committee & { convener?: Partial<LeadershipPerson> | null };
}) {
  const dict = getDictionary(locale);
  const name = locale === "zh" ? committee.name_zh : committee.name_en;
  // intro_zh/intro_en 在后台是富文本字段，存的是 HTML（比如 <p style="...">...</p>），
  // 这里只是卡片摘要，用 stripHtml 去掉标签只留纯文字，避免把 HTML 标签原样显示出来
  const intro = stripHtml(locale === "zh" ? committee.intro_zh : committee.intro_en);
  // 主页卡片同时带出职责摘要（原来只有简介，职责要点进子页面才看得到）
  const responsibilities = stripHtml(
    locale === "zh" ? committee.responsibilities_zh : committee.responsibilities_en
  );
  const convenerName = committee.convener && !committee.convener.is_tba
    ? locale === "zh"
      ? committee.convener.name_zh
      : committee.convener.name_en
    : null;

  return (
    <Link
      href={`/${locale}/committees/${committee.slug}`}
      className="card-interactive group flex flex-col rounded-lg border border-navy-100 bg-white p-6"
    >
      <h3 className="mb-2 text-base font-bold text-navy-900 group-hover:text-navy-700">{name}</h3>
      {intro && <p className="mb-2 line-clamp-3 text-sm text-ink-600">{intro}</p>}
      {responsibilities && (
        <p className="mb-4 line-clamp-3 flex-1 text-sm text-ink-500">
          <span className="font-semibold text-navy-800">{locale === "zh" ? "职责：" : "Responsibilities: "}</span>
          {responsibilities}
        </p>
      )}
      {!intro && !responsibilities && <div className="flex-1" />}
      <div className="flex items-center justify-between border-t border-navy-100 pt-4 text-xs">
        {/* 召集人待定时不再显示"待定"占位文字，这里留一个空 span 只是为了让右边
            "了解更多"继续保持在最右侧（flex justify-between 两端对齐） */}
        <span className="text-ink-500">
          {convenerName ? `${locale === "zh" ? "召集人：" : "Convener: "}${convenerName}` : ""}
        </span>
        <span className="flex items-center gap-1 font-semibold text-navy-800">
          {dict.common.learnMore}
          <ArrowRight className="h-3.5 w-3.5" aria-hidden />
        </span>
      </div>
    </Link>
  );
}
