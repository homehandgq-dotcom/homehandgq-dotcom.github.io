"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import type { Locale } from "@/lib/i18n/config";
import type { VideoWithUrls } from "@/lib/data/videos";

/**
 * 视频播放弹层：
 * - 按原始宽高比显示（CSS aspect-ratio + max-width/max-height 双重约束，
 *   不拉伸不裁剪）；竖版视频高度受限以保证控制条始终在屏幕内，横版视频按屏幕宽度适配。
 * - 点击打开才加载/播放（<video> 不设 autoPlay 预加载，首次挂载即调用 play()，不占用带宽）。
 * - 支持原生播放控制（play/pause/seek/volume/fullscreen 均为浏览器原生 controls）。
 * - 移动端通过 playsInline 支持行内播放，不强制进入系统全屏播放器。
 * - 关闭（按钮或 Esc）立即暂停并复位，不会在后台继续播放。
 */
export function VideoPlayerModal({
  locale,
  video,
  onClose,
}: {
  locale: Locale;
  video: VideoWithUrls;
  onClose: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKey);
    };
  }, [onClose]);

  function handleClose() {
    const el = videoRef.current;
    if (el) {
      el.pause();
      el.currentTime = 0;
    }
    onClose();
  }

  const title = locale === "zh" ? video.title_zh : video.title_en || video.title_zh;
  const personName = locale === "zh" ? video.person_name_zh : video.person_name_en || video.person_name_zh;
  const personTitle = locale === "zh" ? video.person_title_zh : video.person_title_en || video.person_title_zh;
  const categoryLabel = video.category ? (locale === "zh" ? video.category.name_zh : video.category.name_en) : null;
  const ratio = video.video_width && video.video_height ? `${video.video_width} / ${video.video_height}` : "16 / 9";

  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4"
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <div className="relative flex max-h-full w-full max-w-5xl flex-col items-center gap-4">
        <button
          ref={closeRef}
          type="button"
          onClick={handleClose}
          aria-label={locale === "zh" ? "关闭" : "Close"}
          className="absolute -top-2 right-0 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-navy-900 shadow hover:bg-white sm:-right-2"
        >
          <X className="h-5 w-5" />
        </button>

        <video
          ref={videoRef}
          key={video.id}
          src={video.videoUrl ?? undefined}
          controls
          playsInline
          autoPlay
          style={{
            aspectRatio: ratio,
            maxWidth: "min(92vw, 1100px)",
            maxHeight: "80vh",
            width: "auto",
            height: "auto",
          }}
          className="rounded-lg bg-black shadow-2xl"
        >
          {locale === "zh" ? "您的浏览器不支持视频播放。" : "Your browser does not support video playback."}
        </video>

        <div className="w-full max-w-2xl rounded-lg bg-white/95 px-5 py-3 text-center">
          {categoryLabel && (
            <p className="mb-1 inline-block rounded-full bg-gold-100 px-2.5 py-0.5 text-[11px] font-semibold text-gold-700">
              {categoryLabel}
            </p>
          )}
          <p className="text-sm font-bold text-navy-900">{title}</p>
          {(personName || personTitle) && (
            <p className="text-xs text-ink-500">{[personName, personTitle].filter(Boolean).join(" · ")}</p>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
