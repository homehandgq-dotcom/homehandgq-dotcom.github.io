"use client";

import { useState } from "react";
import { Play } from "lucide-react";
import type { Locale } from "@/lib/i18n/config";
import type { VideoWithUrls } from "@/lib/data/videos";
import { VideoPlayerModal } from "./VideoPlayerModal";

function VideoCard({
  locale,
  video,
  onPlay,
}: {
  locale: Locale;
  video: VideoWithUrls;
  onPlay: () => void;
}) {
  const title = locale === "zh" ? video.title_zh : video.title_en || video.title_zh;
  const personName = locale === "zh" ? video.person_name_zh : video.person_name_en || video.person_name_zh;
  const personTitle = locale === "zh" ? video.person_title_zh : video.person_title_en || video.person_title_zh;
  const categoryLabel = video.category ? (locale === "zh" ? video.category.name_zh : video.category.name_en) : null;

  return (
    <button
      type="button"
      onClick={onPlay}
      className="group flex flex-col overflow-hidden rounded-lg border border-navy-100 bg-white text-left shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-navy-900">
        {video.coverUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={video.coverUrl}
            alt={title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-navy-800 to-navy-900 px-4 text-center text-white/60">
            {title}
          </div>
        )}
        {categoryLabel && (
          <span className="absolute left-3 top-3 rounded-full bg-black/55 px-2.5 py-1 text-[11px] font-semibold text-white">
            {categoryLabel}
          </span>
        )}
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-90 transition-opacity group-hover:opacity-100">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white/90 text-navy-900 shadow-lg transition-transform group-hover:scale-110">
            <Play className="h-6 w-6" fill="currentColor" />
          </span>
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-1 p-4">
        <p className="line-clamp-2 text-sm font-bold text-navy-900">{title}</p>
        {(personName || personTitle) && (
          <p className="text-xs text-gold-700">{[personName, personTitle].filter(Boolean).join(" · ")}</p>
        )}
      </div>
    </button>
  );
}

export function VideoGrid({
  locale,
  items,
}: {
  locale: Locale;
  items: VideoWithUrls[];
}) {
  const [playing, setPlaying] = useState<VideoWithUrls | null>(null);

  return (
    <>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <VideoCard key={item.id} locale={locale} video={item} onPlay={() => setPlaying(item)} />
        ))}
      </div>
      {playing && <VideoPlayerModal locale={locale} video={playing} onClose={() => setPlaying(null)} />}
    </>
  );
}
