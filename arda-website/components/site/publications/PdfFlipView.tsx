"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { PageFlip } from "page-flip";
import type { RenderVariant } from "@/lib/pdf/usePdfDocument";

const BLANK_PAGE =
  "data:image/svg+xml;base64," +
  (typeof window === "undefined"
    ? ""
    : btoa('<svg xmlns="http://www.w3.org/2000/svg" width="40" height="56"><rect width="40" height="56" fill="#f5f6f8"/></svg>'));

export interface PdfFlipViewHandle {
  goTo: (page: number) => void;
  next: () => void;
  prev: () => void;
}

/**
 * 真实翻书动效（非左右滑动替代方案）：基于 `page-flip`（StPageFlip）——
 * Task #2 调研结论：该库纯 Canvas/DOM 实现，零依赖、MIT 协议，最后发布于
 * 2021-04（已停止更新但功能完整、无 React 版本耦合），用于实现纸张卷曲、
 * 页角掀起、阴影过渡的真实翻页动画。封面独立显示（showCover），之后按
 * 双页对开排列；是否单页由外部通过 singlePage 显式控制。
 *
 * 尺寸策略（这是经过几轮反复踩坑之后换掉的方案，记录一下原因，避免以后
 * 又绕回去）：最初用的是库自带的 size:"stretch" 自动拉伸模式——让容器给一个
 * CSS 尺寸，交给库自己去测量、自己决定实际画多大。这条路在全屏切换这类
 * "容器尺寸变化不是来自一次普通浏览器窗口 resize"的场景下反复出问题：库内部
 * 把"重新测量 CSS 尺寸"和"重新排版计算"拆成了两个不同的内部方法，只有真正的
 * window resize 事件才会把两者一起触发，我们怎么补都补不干净（调用公开的
 * update() 方法不完整、模拟 resize 事件又会撞上浏览器全屏过渡动画的时机、
 * 过渡动画播放中途截到的尺寸还会被当成"最终尺寸"卡住），而且 stretch 模式下
 * 书页在容器里到底会不会居中，也要看它自己内部算出来的画布实际尺寸，外部很
 * 难保证。
 *
 * 现在改成完全自己接管尺寸计算：用 ResizeObserver 持续测量容器"可用空间"
 * 实际有多大（不依赖库去测量任何东西），自己根据可用宽高 + 页面长宽比例 +
 * 单页/双页，算出书页应该画多大，直接以精确像素值用 size:"fixed" 初始化（或
 * 重新初始化）page-flip——不再依赖它内部任何"自动"逻辑，所以也不存在"没触发
 * 自动重算"这类问题；同时容器本身只设置成算出来的精确尺寸（而不是撑满整个
 * 可用宽度），再用 margin: auto 居中，这样"有多余空间时内容居中、而不是贴
 * 在左边"是由浏览器最基础的块级元素居中规则保证的，不依赖库内部任何居中
 * 计算是否正确。
 *
 * 代价：容器尺寸变化时会整个销毁重建一次 page-flip 实例（而不是库自己的
 * "原地重新排版"），但已渲染好的页面图片会从缓存中复用，不会重新请求 PDF.js
 * 渲染，重建本身也用 requestAnimationFrame 做了节流，不会在连续拖动窗口时
 * 疯狂重建。
 *
 * 页面内容来自 PDF.js 按需渲染的图片（见 usePdfDocument），本组件只负责：
 * 1) 按当前可用空间计算出书页应该画多大，用一组"占位图"初始化/重建 PageFlip；
 * 2) 监听翻页事件，渲染当前页前后若干页并用 updateFromImages 替换对应占位图
 *    （即"渲染按需 + 相邻页预加载"，不会一次性渲染整本书）。
 */
export const PdfFlipView = forwardRef<
  PdfFlipViewHandle,
  {
    pageCount: number;
    pageAspect: number;
    renderPage: (page: number, variant?: RenderVariant) => Promise<string>;
    initialPage: number;
    reducedMotion: boolean;
    singlePage: boolean;
    onPageChange: (page: number) => void;
  }
>(function PdfFlipView(
  { pageCount, pageAspect, renderPage, initialPage, reducedMotion, singlePage, onPageChange },
  ref
) {
  const containerRef = useRef<HTMLDivElement>(null);
  const flipRef = useRef<PageFlip | null>(null);
  const imagesRef = useRef<string[]>([]);
  const loadAroundRef = useRef<(page: number) => void>(() => undefined);
  const currentPageRef = useRef(initialPage);
  const renderPageRef = useRef(renderPage);
  const onPageChangeRef = useRef(onPageChange);
  const [, setTick] = useState(0);
  const [boxSize, setBoxSize] = useState<{ width: number; height: number } | null>(null);

  useEffect(() => {
    renderPageRef.current = renderPage;
  }, [renderPage]);
  useEffect(() => {
    onPageChangeRef.current = onPageChange;
  }, [onPageChange]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || pageCount === 0) return;
    // 必须测量父元素（外层始终撑满可用空间的那个容器），不能测量自己——
    // 自己的尺寸是我们接下来要去设置的东西，拿自己当测量基准会变成自我循环。
    const measureEl = el.parentElement;
    if (!measureEl) return;

    imagesRef.current = Array.from({ length: pageCount }, () => BLANK_PAGE);
    currentPageRef.current = initialPage;
    // ResizeObserver 在 observe() 之后一定会异步触发一次首次回调（哪怕尺寸
    // 跟上一次完全没变），加上这里本来就先同步 buildFlip() 了一次——如果不
    // 做这个判断，挂载时总会多重建一次完全相同尺寸的实例，纯属浪费。
    const lastSizeRef = { width: -1, height: -1 };

    function loadAround(current1Based: number) {
      const pages = [current1Based, current1Based + 1, current1Based - 1, current1Based + 2, current1Based - 2].filter(
        (p) => p >= 1 && p <= pageCount
      );
      pages.forEach((p) => {
        renderPageRef.current(p, "full").then((url) => {
          if (imagesRef.current[p - 1] === url) return;
          imagesRef.current[p - 1] = url;
          flipRef.current?.updateFromImages([...imagesRef.current]);
        }).catch(() => undefined);
      });
    }
    loadAroundRef.current = loadAround;

    function buildFlip() {
      const availW = measureEl!.clientWidth;
      const availH = measureEl!.clientHeight;
      if (availW < 40 || availH < 40 || !el) return; // 容器还没真正布局好，跳过这一次

      const pagesAcross = singlePage ? 1 : 2;
      let pageW = Math.floor(availW / pagesAcross);
      let pageH = Math.floor(pageW / pageAspect);
      if (pageH > availH) {
        pageH = Math.floor(availH);
        pageW = Math.floor(pageH * pageAspect);
      }
      pageW = Math.max(pageW, 120);
      pageH = Math.max(pageH, 160);

      const totalWidth = pageW * pagesAcross;
      if (totalWidth === lastSizeRef.width && pageH === lastSizeRef.height) return; // 尺寸没变，不必重建
      lastSizeRef.width = totalWidth;
      lastSizeRef.height = pageH;

      setBoxSize({ width: totalWidth, height: pageH });

      // 用 getUI().destroy() 而不是 destroy()：后者会把容器元素本身也从 DOM
      // 里移除掉（这个容器是 React 通过 ref 拿到、还要继续复用的），引发
      // React 之后自己清理/更新这个节点时的 "removeChild: not a child of
      // this node" 报错——上线后书页整个消失、点一下就跳错误页，根子就在
      // 这里（详见 types/page-flip.d.ts 里 destroy() 的说明）。getUI().destroy()
      // 只清理库自己创建的画布和内部包裹层，容器元素留给 React 自己管。
      flipRef.current?.getUI().destroy();
      const pf = new PageFlip(el, {
        width: pageW,
        height: pageH,
        size: "fixed",
        showCover: true,
        usePortrait: singlePage,
        mobileScrollSupport: true,
        useMouseEvents: true,
        drawShadow: !reducedMotion,
        flippingTime: reducedMotion ? 120 : 650,
        maxShadowOpacity: 0.5,
      });
      flipRef.current = pf;
      pf.loadFromImages(imagesRef.current);

      const restorePage = Math.min(Math.max(currentPageRef.current, 1), pageCount);
      if (restorePage > 1) pf.turnToPage(Math.min(restorePage - 1, pageCount - 1));
      loadAround(restorePage);

      pf.on("flip", (e) => {
        const page1Based = e.data + 1;
        currentPageRef.current = page1Based;
        onPageChangeRef.current(page1Based);
        loadAround(page1Based);
      });

      setTick((n) => n + 1);
    }

    buildFlip();

    let rebuildFrame = 0;
    const resizeObserver = new ResizeObserver(() => {
      if (rebuildFrame) cancelAnimationFrame(rebuildFrame);
      rebuildFrame = requestAnimationFrame(buildFlip);
    });
    resizeObserver.observe(measureEl);

    return () => {
      resizeObserver.disconnect();
      if (rebuildFrame) cancelAnimationFrame(rebuildFrame);
      // 同样用 getUI().destroy()，原因见上面 buildFlip() 里的注释：这里是
      // 组件卸载/整体重建时的清理，容器元素本身的移除完全交给 React 自己
      // （它马上就会按正常流程把这个节点从树上摘掉），我们不需要、也不能
      // 替它代劳。
      flipRef.current?.getUI().destroy();
      flipRef.current = null;
    };
    // pageCount/pageAspect/reducedMotion/singlePage 变化时才需要整体重建；
    // initialPage 只在首次挂载时用于定位，之后翻页位置由 currentPageRef 自行维护。
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageCount, pageAspect, reducedMotion, singlePage]);

  useImperativeHandle(ref, () => ({
    goTo: (page: number) => {
      currentPageRef.current = page;
      flipRef.current?.turnToPage(Math.max(0, Math.min(page - 1, pageCount - 1)));
      loadAroundRef.current(page);
    },
    next: () => flipRef.current?.flipNext(),
    prev: () => flipRef.current?.flipPrev(),
  }));

  // 容器精确设置为"算出来应该有多大"，而不是撑满父容器的可用宽度，再用
  // mx-auto 居中——这样有多余空间时书页会居中显示，而不是贴着左边、把空白
  // 全部留在右边。
  return (
    <div
      ref={containerRef}
      className="pdf-flip-container mx-auto"
      style={boxSize ? { width: boxSize.width, height: boxSize.height } : { width: "100%", height: "100%" }}
    />
  );
});
