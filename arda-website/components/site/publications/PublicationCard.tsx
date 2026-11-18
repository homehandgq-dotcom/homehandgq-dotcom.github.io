import Link from "next/link";
import { BookOpen } from "lucide-react";
import type { Locale } from "@/lib/i18n/config";
import type { PublicationWithUrls } from "@/lib/data/publications";
import { formatDate } from "@/lib/utils/format";

export function PublicationCard({ locale, item }: { locale: Locale; item: PublicationWithUrls }) {
  const name = locale === "zh" ? item.name_zh : item.name_en || item.name_zh;
  const issue = locale === "zh" ? item.issue_label_zh : item.issue_label_en || item.issue_label_zh;
  const intro = locale === "zh" ? item.intro_zh : item.intro_en || item.intro_zh;

  return (
    <div className="flex flex-col overflow-hidden rounded-lg border border-navy-100 bg-white shadow-sm transition-shadow hover:shadow-md">
      <Link href={`/${locale}/publications/${item.slug}`} className="relative block aspect-[3/4] w-full overflow-hidden bg-navy-900">
        {item.coverUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={item.coverUrl} alt={name} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-navy-800 to-navy-900 text-white/60">
            <BookOpen className="h-10 w-10" />
          </div>
        )}
      </Link>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <p className="text-sm font-bold text-navy-900">{name}</p>
        <p className="text-xs text-ink-400">
          {[issue, item.publish_date ? formatDate(item.publish_date, locale) : null].filter(Boolean).join(" · ")}
        </p>
        {intro && <p className="line-clamp-2 flex-1 text-xs leading-relaxed text-ink-500">{intro}</p>}
        <Link
          href={`/${locale}/publications/${item.slug}`}
          className="mt-1 flex items-center gap-1.5 text-xs font-bold text-navy-700 hover:underline"
        >
          <BookOpen className="h-3.5 w-3.5" /> {locale === "zh" ? "在线阅读" : "Read Online"}
        </Link>
      </div>
    </div>
  );
}
