"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import {
  Loader2,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Maximize,
  Minimize2,
  Rows3,
  BookOpen,
  Columns2,
  ExternalLink,
  RotateCcw,
  Images,
} from "lucide-react";
import { usePdfDocument } from "@/lib/pdf/usePdfDocument";
import { PdfFlipView, type PdfFlipViewHandle } from "./PdfFlipView";
import { PdfScrollView, type PdfScrollViewHandle } from "./PdfScrollView";
import { PdfThumbnailStrip } from "./PdfThumbnailStrip";
import type { Locale } from "@/lib/i18n/config";

type Mode = "flip" | "scroll";

const iconBtnClass =
  "flex h-8 w-8 shrink-0 items-center justify-center rounded border border-navy-200 text-navy-700 hover:bg-white disabled:opacity-30";
const toggleBtnClass =
  "flex shrink-0 items-center gap-1.5 rounded border border-navy-200 px-2.5 py-1.5 text-xs font-semibold text-navy-800 hover:bg-white";

/**
 * 协会刊物 PDF 阅读器：真实渲染 PDF 内容（PDF.js）+ 真实翻书动效（page-flip）/
 * 连续滚动两种模式，而非静态图片或模拟交互。
 *
 * 已知简化（已在交付说明中注明）：
 * - "单页/双页"切换通过收窄翻书容器宽度触发 page-flip 自身的响应式单页判定实现，
 *   不是对库内部状态的直接强制切换；
 * - 缩放时通过整体 CSS transform 缩放 + 外层原生滚动实现"可拖动平移"，
 *   未实现双指捏合手势的像素级跟手缩放。
 */
export function PdfReader({ locale, pdfUrl }: { locale: Locale; pdfUrl: string }) {
  const { state, error, pageCount, pageAspect, renderPage, retry } = usePdfDocument(pdfUrl);
  const [mode, setMode] = useState<Mode>("flip");
  const [currentPage, setCurrentPage] = useState(1);
  const [jumpValue, setJumpValue] = useState("1");
  const [zoom, setZoom] = useState(1);
  const [forceSingle, setForceSingle] = useState(false);
  const [showThumbs, setShowThumbs] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const flipRef = useRef<PdfFlipViewHandle>(null);
  const scrollRef = useRef<PdfScrollViewHandle>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const handler = () => setReducedMotion(mq.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    // 手机端默认进入翻页模式的单页视图（桌面端默认双页对开）；连续滚动模式
    // 仍然保留，用户可以通过顶部按钮随时手动切换，不强制锁定某一端的模式。
    if (typeof window !== "undefined" && window.innerWidth < 640) setForceSingle(true);
  }, []);

  useEffect(() => {
    setJumpValue(String(currentPage));
  }, [currentPage]);

  useEffect(() => {
    // "全屏阅读"不走浏览器原生 Fullscreen API 了——iOS Safari 对任意元素调用
    // requestFullscreen() 根本不支持（只有 <video> 能用系统自带的那套播放器
    // 全屏，普通元素在 iPhone 上调用这个方法要么直接报错、要么静默什么都不做），
    // 这正是"点全屏没反应"在手机上出现的直接原因，不是时机或样式的问题，是
    // 这个浏览器 API 在 iOS 上压根不工作。改成纯 CSS 的"铺满视口"做法后，
    // 不依赖任何浏览器全屏能力，所有平台表现一致，也顺带解决了之前好几轮一直
    // 在追的"进出全屏时机踩不准"的问题——因为现在根本没有浏览器那段全屏过渡
    // 动画需要等待，纯粹是一次同步的 CSS 定位变化。
    //
    // 覆盖整个视口时顺带锁住页面背后的滚动（不锁的话，手机上触摸拖动可能会
    // 带着背后的整个页面一起滚动，而不是只在阅读器内部滚动），退出时恢复。
    if (!isFullscreen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setIsFullscreen(false);
    }
    window.addEventListener("keydown", handleKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKey);
    };
  }, [isFullscreen]);

  function goTo(page: number) {
    if (pageCount <= 0) return;
    const clamped = Math.max(1, Math.min(page, pageCount));
    setCurrentPage(clamped);
    if (mode === "flip") flipRef.current?.goTo(clamped);
    else scrollRef.current?.scrollToPage(clamped);
  }

  function handleJumpSubmit(e: FormEvent) {
    e.preventDefault();
    const n = Number(jumpValue);
    if (Number.isFinite(n)) goTo(n);
  }

  function switchMode(next: Mode) {
    setMode(next);
    // 切换模式时保留当前阅读进度，下一帧让新视图定位到同一页
    requestAnimationFrame(() => {
      if (next === "flip") flipRef.current?.goTo(currentPage);
      else scrollRef.current?.scrollToPage(currentPage);
    });
  }

  function toggleFullscreen() {
    setIsFullscreen((v) => !v);
  }

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (zoom > 1) return; // 放大时优先保证拖动平移，不响应方向键翻页
      if (e.key === "ArrowRight") goTo(currentPage + 1);
      if (e.key === "ArrowLeft") goTo(currentPage - 1);
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, mode, zoom, pageCount]);

  if (state === "loading") {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 rounded-lg border border-navy-100 bg-mist">
        <Loader2 className="h-6 w-6 animate-spin text-navy-400" />
        <p className="text-sm text-ink-500">{locale === "zh" ? "正在加载 PDF…" : "Loading PDF…"}</p>
      </div>
    );
  }

  if (state === "error") {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 rounded-lg border border-red-100 bg-red-50 px-6 py-10 text-center">
        <p className="text-sm font-semibold text-red-700">{locale === "zh" ? "加载失败" : "Failed to load"}</p>
        <p className="max-w-md text-xs text-red-600">{error}</p>
        <div className="flex flex-wrap justify-center gap-3">
          <button
            onClick={retry}
            className="flex items-center gap-1.5 rounded bg-navy-900 px-4 py-2 text-xs font-semibold text-white"
          >
            <RotateCcw className="h-3.5 w-3.5" /> {locale === "zh" ? "重试" : "Retry"}
          </button>
          <a
            href={pdfUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 rounded border border-navy-200 bg-white px-4 py-2 text-xs font-semibold text-navy-800"
          >
            <ExternalLink className="h-3.5 w-3.5" /> {locale === "zh" ? "在浏览器中直接打开 PDF" : "Open PDF in browser"}
          </a>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={
        isFullscreen
          ? "fixed inset-0 z-[100] overflow-hidden bg-white" // 铺满整个视口的纯 CSS 覆盖层，和站内其他弹层（如视频播放弹窗）用的是同一个 z-index 规范
          : "overflow-hidden rounded-lg border border-navy-100 bg-white"
      }
    >
      <div className="flex flex-wrap items-center gap-2 border-b border-navy-100 bg-mist px-3 py-2">
        <button onClick={() => goTo(currentPage - 1)} disabled={currentPage <= 1} className={iconBtnClass} aria-label="prev">
          <ChevronLeft className="h-4 w-4" />
        </button>
        <form onSubmit={handleJumpSubmit} className="flex items-center gap-1 text-xs text-ink-600">
          <input
            value={jumpValue}
            onChange={(e) => setJumpValue(e.target.value)}
            className="w-10 rounded border border-navy-200 px-1.5 py-1 text-center"
            inputMode="numeric"
          />
          <span>/ {pageCount}</span>
        </form>
        <button onClick={() => goTo(currentPage + 1)} disabled={currentPage >= pageCount} className={iconBtnClass} aria-label="next">
          <ChevronRight className="h-4 w-4" />
        </button>

        <div className="mx-1 h-5 w-px bg-navy-200" />

        <button onClick={() => setZoom((z) => Math.max(1, Math.round((z - 0.25) * 100) / 100))} className={iconBtnClass} aria-label="zoom out">
          <ZoomOut className="h-4 w-4" />
        </button>
        <span className="w-10 text-center text-xs text-ink-500">{Math.round(zoom * 100)}%</span>
        <button onClick={() => setZoom((z) => Math.min(2.5, Math.round((z + 0.25) * 100) / 100))} className={iconBtnClass} aria-label="zoom in">
          <ZoomIn className="h-4 w-4" />
        </button>

        <div className="mx-1 h-5 w-px bg-navy-200" />

        <button onClick={() => switchMode(mode === "flip" ? "scroll" : "flip")} className={toggleBtnClass}>
          {mode === "flip" ? <Rows3 className="h-3.5 w-3.5" /> : <BookOpen className="h-3.5 w-3.5" />}
          {mode === "flip"
            ? locale === "zh" ? "连续滚动" : "Scroll"
            : locale === "zh" ? "翻页模式" : "Page-flip"}
        </button>

        {mode === "flip" && (
          <button onClick={() => setForceSingle((v) => !v)} className={toggleBtnClass}>
            <Columns2 className="h-3.5 w-3.5" />
            {forceSingle ? (locale === "zh" ? "双页" : "Double") : (locale === "zh" ? "单页" : "Single")}
          </button>
        )}

        <button onClick={() => setShowThumbs((v) => !v)} className={toggleBtnClass}>
          <Images className="h-3.5 w-3.5" />
          {locale === "zh" ? "缩略图" : "Thumbnails"}
        </button>

        <button onClick={toggleFullscreen} className={`${toggleBtnClass} ml-auto`}>
          {isFullscreen ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize className="h-3.5 w-3.5" />}
          {isFullscreen
            ? locale === "zh" ? "退出全屏" : "Exit Fullscreen"
            : locale === "zh" ? "全屏阅读" : "Fullscreen"}
        </button>
      </div>

      <div
        className={`flex justify-center overflow-auto bg-navy-50 ${isFullscreen ? "p-1" : "p-4"}`}
        // 全屏态下用 dvh（动态视口高度）而不是 vh：手机浏览器的地址栏/工具栏会
        // 随滚动收起展开，vh 是按"工具栏完全收起"的最大高度算的，地址栏还显示
        // 着的时候内容会比实际可视区域更高，底部被裁掉一截；dvh 会跟着工具栏
        // 的实际展开状态动态变化，在手机上更准确。
        style={{ maxHeight: isFullscreen ? "calc(100dvh - 48px)" : "78vh" }}
      >
        <div
          className="w-full"
          style={{
            transform: zoom !== 1 ? `scale(${zoom})` : undefined,
            transformOrigin: "top center",
            // 这个 div 只负责告诉 PdfFlipView "现在总共有多少可用空间"（宽度始终
            // 撑满、高度跟随可视区域给出一个明确值），单页/双页、书页具体应该画
            // 多大、以及在有多余空间时如何居中，全部交给 PdfFlipView 自己按这个
            // 可用空间 + singlePage 来精确计算——不再在这一层用 maxWidth 这种
            // "收窄容器宽度去触发库内部响应式判定"的间接方式，直接显式传参更可靠。
            height: mode === "flip" ? (isFullscreen ? "calc(100dvh - 64px)" : "74vh") : undefined,
          }}
        >
          {mode === "flip" ? (
            <PdfFlipView
              ref={flipRef}
              pageCount={pageCount}
              pageAspect={pageAspect}
              renderPage={renderPage}
              initialPage={currentPage}
              reducedMotion={reducedMotion}
              singlePage={forceSingle}
              onPageChange={setCurrentPage}
            />
          ) : (
            <PdfScrollView
              ref={scrollRef}
              pageCount={pageCount}
              pageAspect={pageAspect}
              renderPage={renderPage}
              initialPage={currentPage}
              onPageChange={setCurrentPage}
            />
          )}
        </div>
      </div>

      {showThumbs && (
        <PdfThumbnailStrip
          pageCount={pageCount}
          currentPage={currentPage}
          pageAspect={pageAspect}
          renderPage={renderPage}
          onJump={goTo}
        />
      )}
    </div>
  );
}
