"use client";

import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from "react";
import type { RenderVariant } from "@/lib/pdf/usePdfDocument";

export interface PdfScrollViewHandle {
  scrollToPage: (page: number) => void;
}

/**
 * 连续滚动模式（不使用翻页动效，更适合手机端小字阅读）：竖直滚动列表，
 * 每页懒加载——用 IntersectionObserver 判断页面是否进入视口（含相邻预加载），
 * 而不是一次性渲染全书。当前"最可见"的页面即视为阅读进度，回传给外层用于
 * 页码显示 / 与翻书模式之间保持阅读位置同步。
 */
export const PdfScrollView = forwardRef<
  PdfScrollViewHandle,
  {
    pageCount: number;
    pageAspect: number;
    renderPage: (page: number, variant?: RenderVariant) => Promise<string>;
    initialPage: number;
    onPageChange: (page: number) => void;
  }
>(function PdfScrollView({ pageCount, pageAspect, renderPage, initialPage, onPageChange }, ref) {
  const containerRef = useRef<HTMLDivElement>(null);
  const pageRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  const requestedRef = useRef<Set<number>>(new Set());
  const [urls, setUrls] = useState<Record<number, string>>({});
  const onPageChangeRef = useRef(onPageChange);

  useEffect(() => {
    onPageChangeRef.current = onPageChange;
  }, [onPageChange]);

  const ensureRendered = useCallback(
    (page: number) => {
      if (page < 1 || page > pageCount || requestedRef.current.has(page)) return;
      requestedRef.current.add(page);
      renderPage(page, "full")
        .then((url) => setUrls((prev) => ({ ...prev, [page]: url })))
        .catch(() => {
          requestedRef.current.delete(page);
        });
    },
    [pageCount, renderPage]
  );

  useEffect(() => {
    const root = containerRef.current;
    if (!root) return;
    const observer = new IntersectionObserver(
      (entries) => {
        let mostVisible: { page: number; ratio: number } | null = null;
        for (const entry of entries) {
          const page = Number((entry.target as HTMLElement).dataset.page);
          if (entry.isIntersecting) {
            ensureRendered(page);
            ensureRendered(page + 1);
            ensureRendered(page - 1);
            if (!mostVisible || entry.intersectionRatio > mostVisible.ratio) {
              mostVisible = { page, ratio: entry.intersectionRatio };
            }
          }
        }
        if (mostVisible) onPageChangeRef.current(mostVisible.page);
      },
      { root, threshold: [0.5] }
    );
    pageRefs.current.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [pageCount, ensureRendered]);

  useEffect(() => {
    ensureRendered(initialPage);
    ensureRendered(initialPage + 1);
    const el = pageRefs.current.get(initialPage);
    el?.scrollIntoView({ block: "start" });
    // 仅在挂载时执行一次定位，后续翻页由 IntersectionObserver / scrollToPage 接管
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useImperativeHandle(ref, () => ({
    scrollToPage: (page: number) => {
      ensureRendered(page);
      pageRefs.current.get(page)?.scrollIntoView({ behavior: "smooth", block: "start" });
    },
  }));

  const displayWidth = 640;

  return (
    <div
      ref={containerRef}
      className="mx-auto max-h-[75vh] w-full max-w-full overflow-y-auto rounded border border-navy-100 bg-mist p-3 sm:p-4"
    >
      <div className="mx-auto flex flex-col items-center gap-4" style={{ maxWidth: displayWidth }}>
        {Array.from({ length: pageCount }, (_, i) => i + 1).map((page) => (
          <div
            key={page}
            data-page={page}
            ref={(el) => {
              if (el) pageRefs.current.set(page, el);
              else pageRefs.current.delete(page);
            }}
            className="flex w-full items-center justify-center bg-white shadow-sm"
            style={{ aspectRatio: `${pageAspect}`, minHeight: 240 }}
          >
            {urls[page] ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={urls[page]} alt={`Page ${page}`} className="h-full w-full object-contain" />
            ) : (
              <span className="text-xs text-ink-400">{page} / {pageCount}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
});
