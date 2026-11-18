import Link from "next/link";
import { Users } from "lucide-react";
import type { Locale } from "@/lib/i18n/config";
import type { Chapter, LeadershipPerson } from "@/lib/supabase/types";

export function ChapterCard({
  locale,
  chapter,
}: {
  locale: Locale;
  chapter: Chapter & { leader?: Partial<LeadershipPerson> | null };
}) {
  const name = locale === "zh" ? chapter.name_zh : chapter.name_en;
  const leaderName = chapter.leader
    ? locale === "zh"
      ? chapter.leader.name_zh
      : chapter.leader.name_en
    : null;

  return (
    <Link
      href={`/${locale}/chapters/${chapter.slug}`}
      className="card-interactive group flex items-center justify-between rounded-lg border border-navy-100 bg-white p-5"
    >
      <div>
        <p className="font-bold text-navy-900 group-hover:text-navy-700">{name}</p>
        <p className="mt-1 text-xs text-ink-500">
          {leaderName ? `${locale === "zh" ? "负责人：" : "Lead: "}${leaderName}` : (locale === "zh" ? "负责人待定" : "Lead to be announced")}
        </p>
      </div>
      <span className="flex items-center gap-1 text-xs font-semibold text-gold-600">
        <Users className="h-4 w-4" aria-hidden />
        {chapter.member_count_override ?? 0}
      </span>
    </Link>
  );
}
