"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getDocument, GlobalWorkerOptions, type PDFDocumentProxy } from "pdfjs-dist";

let workerConfigured = false;
function ensureWorker() {
  if (workerConfigured) return;
  GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/build/pdf.worker.min.mjs", import.meta.url).toString();
  workerConfigured = true;
}

export type PdfLoadState = "loading" | "ready" | "error";
export type RenderVariant = "thumb" | "full";

// "full" 档位渲染分辨率：此前 1.4 是按"翻书容器只有几百像素宽"时的尺寸估算的，
// 这一轮把翻书容器本身的宽高上限放宽、全屏下更是能撑到接近整个屏幕宽度之后，
// 原来的渲染分辨率明显跟不上了——容器变大了，但图片还是那张小图被拉伸放大，
// 所以看起来发虚、文字模糊（这是和"容器尺寸"完全独立的另一个问题：前几轮解决的
// 是"书页画面本身多大"，这里要解决的是"画面内容本身够不够清晰"）。按常见页面
// 尺寸（Letter，612pt 宽）估算，这里的 scale 对应约 1836px 栅格宽度，在全屏下
// 单页接近 1150px 展示宽度时，即便是 2x 视网膜屏（需要约 2300px 原始像素）也仍
// 明显好于此前；加上普通桌面、手机单页场景的展示宽度远小于全屏上限，绝大多数
// 情况下已经足够清晰。
const SCALE_BY_VARIANT: Record<RenderVariant, number> = {
  thumb: 0.28,
  full: 3,
};

/**
 * PDF 阅读器核心 Hook：按需加载文档 + 按需渲染单页为图片（而非一次性渲染全书），
 * 渲染结果按 "页码+清晰度档位" 缓存，供翻书模式（page-flip）与连续滚动模式共用，
 * 两种模式切换时不会重复渲染已经渲染过的页面。
 */
export function usePdfDocument(url: string | null) {
  const [state, setState] = useState<PdfLoadState>("loading");
  const [error, setError] = useState<string | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [pageAspect, setPageAspect] = useState(0.72); // width/height，默认近似 A4 比例，首页加载后会被真实值覆盖

  const docRef = useRef<PDFDocumentProxy | null>(null);
  const loadingTaskRef = useRef<ReturnType<typeof getDocument> | null>(null);
  const cacheRef = useRef<Map<string, string>>(new Map());
  const pendingRef = useRef<Map<string, Promise<string>>>(new Map());
  const [, bump] = useState(0);

  const load = useCallback(() => {
    if (!url) return;
    setState("loading");
    setError(null);
    ensureWorker();
    cacheRef.current.clear();
    pendingRef.current.clear();

    const task = getDocument({ url });
    loadingTaskRef.current = task;
    task.promise
      .then(async (doc) => {
        docRef.current = doc;
        setPageCount(doc.numPages);
        try {
          const firstPage = await doc.getPage(1);
          const vp = firstPage.getViewport({ scale: 1 });
          if (vp.width && vp.height) setPageAspect(vp.width / vp.height);
        } catch {
          // 首页尺寸读取失败不影响整体加载，使用默认比例
        }
        setState("ready");
      })
      .catch((err) => {
        setState("error");
        setError(err instanceof Error ? err.message : "PDF 加载失败，请重试或在浏览器中直接打开");
      });
  }, [url]);

  useEffect(() => {
    load();
    return () => {
      loadingTaskRef.current?.destroy();
      docRef.current = null;
    };
  }, [load]);

  const renderPage = useCallback((pageNum: number, variant: RenderVariant = "full"): Promise<string> => {
    const key = `${pageNum}:${variant}`;
    const cached = cacheRef.current.get(key);
    if (cached) return Promise.resolve(cached);
    const pending = pendingRef.current.get(key);
    if (pending) return pending;

    const promise = (async () => {
      const doc = docRef.current;
      if (!doc) throw new Error("PDF 未加载完成");
      const page = await doc.getPage(pageNum);
      const viewport = page.getViewport({ scale: SCALE_BY_VARIANT[variant] });
      const canvas = document.createElement("canvas");
      canvas.width = Math.ceil(viewport.width);
      canvas.height = Math.ceil(viewport.height);
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("无法创建画布上下文");
      await page.render({ canvas, canvasContext: ctx, viewport }).promise;
      // full 档位略微提高 JPEG 质量（0.85 -> 0.93），减少文字边缘的压缩伪影，
      // 对最终清晰度的提升比单纯提高分辨率更直接针对"文字模糊"这个具体反馈。
      const dataUrl = canvas.toDataURL("image/jpeg", variant === "thumb" ? 0.6 : 0.93);
      cacheRef.current.set(key, dataUrl);
      pendingRef.current.delete(key);
      bump((n) => n + 1);
      return dataUrl;
    })();
    pendingRef.current.set(key, promise);
    return promise;
  }, []);

  /** 预加载一批页码（用于"相邻页预加载"，不等待结果，失败静默忽略） */
  const preload = useCallback(
    (pages: number[], variant: RenderVariant = "full") => {
      for (const p of pages) {
        if (p >= 1 && p <= pageCount) {
          renderPage(p, variant).catch(() => undefined);
        }
      }
    },
    [pageCount, renderPage]
  );

  return { state, error, pageCount, pageAspect, renderPage, preload, retry: load };
}
