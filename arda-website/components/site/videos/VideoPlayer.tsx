"use client";

import { useState } from "react";
import { Play } from "lucide-react";
import type { Locale } from "@/lib/i18n/config";
import type { VideoWithUrls } from "@/lib/data/videos";

/**
 * 详情页（永久分享链接）内嵌播放器：初始显示封面 + 播放按钮，不自动播放；
 * 点击后才加载并播放视频，与首页/列表页弹层共享同样的"不拉伸不裁剪、
 * 竖版限高、横版适配屏宽、移动端行内播放"规则。
 */
export function VideoPlayer({
  locale,
  video,
}: {
  locale: Locale;
  video: VideoWithUrls;
}) {
  const [started, setStarted] = useState(false);
  const title = locale === "zh" ? video.title_zh : video.title_en || video.title_zh;
  const ratio = video.video_width && video.video_height ? `${video.video_width} / ${video.video_height}` : "16 / 9";

  const containerStyle = {
    aspectRatio: ratio,
    maxWidth: "min(100%, 1100px)",
    maxHeight: "80vh",
    width: "auto",
    height: "auto",
  } as const;

  if (!started) {
    return (
      <button
        type="button"
        onClick={() => setStarted(true)}
        className="group relative mx-auto block w-full overflow-hidden rounded-lg bg-navy-900 shadow-lg"
        style={containerStyle}
        aria-label={locale === "zh" ? "播放视频" : "Play video"}
      >
        {video.coverUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={video.coverUrl} alt="" className="absolute inset-0 h-full w-full object-contain bg-black" />
        ) : null}
        <div className="absolute inset-0 flex items-center justify-center bg-black/25 transition-colors group-hover:bg-black/35">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white/90 text-navy-900 shadow-lg transition-transform group-hover:scale-110">
            <Play className="h-7 w-7" fill="currentColor" />
          </span>
        </div>
      </button>
    );
  }

  return (
    <video
      src={video.videoUrl ?? undefined}
      controls
      autoPlay
      playsInline
      style={containerStyle}
      className="mx-auto block rounded-lg bg-black shadow-lg"
      aria-label={title}
    >
      {locale === "zh" ? "您的浏览器不支持视频播放。" : "Your browser does not support video playback."}
    </video>
  );
}
