import Link from "next/link";
import { CalendarDays } from "lucide-react";
import type { Locale } from "@/lib/i18n/config";
import type { NewsPost } from "@/lib/supabase/types";
import { formatDate } from "@/lib/utils/format";
import { Badge } from "@/components/ui/primitives";
import { CoverImage } from "@/components/ui/CoverImage";

export function NewsCard({ locale, post }: { locale: Locale; post: NewsPost }) {
  const title = locale === "zh" ? post.title_zh : post.title_en;
  const excerpt = locale === "zh" ? post.excerpt_zh : post.excerpt_en;

  return (
    <Link
      href={`/${locale}/news/${post.slug}`}
      className="card-interactive group flex h-full flex-col overflow-hidden rounded-lg border border-navy-100 bg-white"
    >
      <CoverImage src={post.cover_image} alt={title} className="aspect-[16/9]" interactive />
      <div className="flex flex-1 flex-col p-5">
        <div className="mb-2 h-6">
          {post.is_pinned && (
            <Badge tone="gold" className="w-fit">
              {locale === "zh" ? "置顶" : "Pinned"}
            </Badge>
          )}
        </div>
        <h3 className="mb-2 line-clamp-2 min-h-[2.75rem] text-base font-bold text-navy-900 group-hover:text-navy-700">
          {title}
        </h3>
        <p className="mb-4 line-clamp-2 min-h-[2.5rem] text-sm text-ink-600">{excerpt || ""}</p>
        <div className="mt-auto flex items-center gap-1.5 text-xs text-ink-400">
          <CalendarDays className="h-3.5 w-3.5" aria-hidden />
          {formatDate(post.published_at, locale)}
        </div>
      </div>
    </Link>
  );
}
