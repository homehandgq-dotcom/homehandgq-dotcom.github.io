import Link from "next/link";
import { CalendarDays, MapPin } from "lucide-react";
import type { Locale } from "@/lib/i18n/config";
import type { EventItem } from "@/lib/supabase/types";
import { formatDateTime } from "@/lib/utils/format";
import { Badge } from "@/components/ui/primitives";
import { CoverImage } from "@/components/ui/CoverImage";

const categoryLabel: Record<EventItem["category"], { zh: string; en: string }> = {
  forum: { zh: "论坛峰会", en: "Forum & Summit" },
  training: { zh: "培训教育", en: "Training" },
  delegation: { zh: "商务考察", en: "Delegation" },
  exchange: { zh: "国际交流", en: "Exchange" },
  general: { zh: "协会活动", en: "Event" },
};

const statusTone: Record<EventItem["event_status"], "green" | "gold" | "neutral" | "red"> = {
  upcoming: "green",
  ongoing: "gold",
  past: "neutral",
  cancelled: "red",
};

const statusLabel: Record<EventItem["event_status"], { zh: string; en: string }> = {
  upcoming: { zh: "即将举行", en: "Upcoming" },
  ongoing: { zh: "进行中", en: "Ongoing" },
  past: { zh: "已结束", en: "Past" },
  cancelled: { zh: "已取消", en: "Cancelled" },
};

export function EventCard({ locale, event }: { locale: Locale; event: EventItem }) {
  const title = locale === "zh" ? event.title_zh : event.title_en;
  const location = locale === "zh" ? event.location_zh : event.location_en;

  return (
    <Link
      href={`/${locale}/events/${event.slug}`}
      className="card-interactive group flex flex-col overflow-hidden rounded-lg border border-navy-100 bg-white"
    >
      <CoverImage src={event.cover_image} alt={title} className="aspect-[16/9]" interactive />
      <div className="flex flex-1 flex-col p-5">
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <Badge tone="navy">{locale === "zh" ? categoryLabel[event.category].zh : categoryLabel[event.category].en}</Badge>
          <Badge tone={statusTone[event.event_status]}>
            {locale === "zh" ? statusLabel[event.event_status].zh : statusLabel[event.event_status].en}
          </Badge>
        </div>
        <h3 className="mb-3 line-clamp-2 text-base font-bold text-navy-900 group-hover:text-navy-700">
          {title}
        </h3>
        <div className="mt-auto space-y-1.5 text-xs text-ink-500">
          <div className="flex items-center gap-1.5">
            <CalendarDays className="h-3.5 w-3.5 shrink-0" aria-hidden />
            <span>{formatDateTime(event.start_at, locale, event.timezone)}</span>
          </div>
          {location && (
            <div className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden />
              <span className="line-clamp-1">{location}</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
