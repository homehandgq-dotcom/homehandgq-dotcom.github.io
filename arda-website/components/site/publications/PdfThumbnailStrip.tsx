"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils/cn";
import type { RenderVariant } from "@/lib/pdf/usePdfDocument";

function Thumb({
  page,
  active,
  pageAspect,
  renderPage,
  onClick,
}: {
  page: number;
  active: boolean;
  pageAspect: number;
  renderPage: (page: number, variant?: RenderVariant) => Promise<string>;
  onClick: () => void;
}) {
  const [url, setUrl] = useState<string | null>(null);
  const ref = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          renderPage(page, "thumb").then(setUrl).catch(() => undefined);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [page, renderPage]);

  return (
    <button
      ref={ref}
      type="button"
      onClick={onClick}
      className={cn(
        "flex shrink-0 flex-col items-center gap-1 rounded border-2 p-1 transition-colors",
        active ? "border-gold-500" : "border-transparent hover:border-navy-200"
      )}
    >
      <div
        className="flex w-16 items-center justify-center overflow-hidden rounded bg-white shadow-sm"
        style={{ aspectRatio: `${pageAspect}` }}
      >
        {url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={url} alt={`${page}`} className="h-full w-full object-contain" />
        ) : (
          <span className="text-[10px] text-ink-300">{page}</span>
        )}
      </div>
      <span className="text-[10px] text-ink-400">{page}</span>
    </button>
  );
}

/** 缩略图导航条：懒加载（只渲染进入可视范围的缩略图），点击跳转到对应页 */
export function PdfThumbnailStrip({
  pageCount,
  currentPage,
  pageAspect,
  renderPage,
  onJump,
}: {
  pageCount: number;
  currentPage: number;
  pageAspect: number;
  renderPage: (page: number, variant?: RenderVariant) => Promise<string>;
  onJump: (page: number) => void;
}) {
  return (
    <div className="flex gap-2 overflow-x-auto border-t border-navy-100 bg-white px-3 py-2">
      {Array.from({ length: pageCount }, (_, i) => i + 1).map((page) => (
        <Thumb
          key={page}
          page={page}
          active={page === currentPage}
          pageAspect={pageAspect}
          renderPage={renderPage}
          onClick={() => onJump(page)}
        />
      ))}
    </div>
  );
}
