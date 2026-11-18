/**
 * `page-flip`（StPageFlip）未随包发布 TypeScript 类型声明（见迁移说明：
 * Task #2 调研结论——该库最后发布于 2021-04，已停止更新，但为零依赖、框架无关的
 * 纯 Canvas/DOM 翻书引擎，MIT 协议，无 peerDependencies，不存在与 React 19 的
 * 版本冲突；我们直接依赖核心包 `page-flip` 自行包一层 React 组件，而不使用
 * 同样停更且存在 `"page-flip": "latest"` 浮动依赖风险的官方 React 封装
 * `react-pageflip`）。本文件按官方文档/源码补充最小可用的类型声明。
 */
declare module "page-flip" {
  export type SizeType = "fixed" | "stretch";
  export type FlippingState = "user_fold" | "flipping" | "read";

  export interface PageFlipSetting {
    startPage?: number;
    size?: SizeType;
    width: number;
    height: number;
    minWidth?: number;
    maxWidth?: number;
    minHeight?: number;
    maxHeight?: number;
    drawShadow?: boolean;
    flippingTime?: number;
    usePortrait?: boolean;
    startZIndex?: number;
    autoSize?: boolean;
    maxShadowOpacity?: number;
    showCover?: boolean;
    mobileScrollSupport?: boolean;
    swipeDistance?: number;
    clickEventForward?: boolean;
    useMouseEvents?: boolean;
    showPageCorners?: boolean;
    disableFlipByClick?: boolean;
  }

  export interface FlipEvent {
    data: number;
    object: PageFlip;
  }

  /** 库内部的 UI 层对象（canvas 模式下持有画布与事件监听）。只暴露这里用到的
   * destroy()：销毁时只会移除它自己创建的子元素（画布、内部包裹层）和事件
   * 监听，不会动传进来的容器元素本身——这是刻意要用它而不是 PageFlip.destroy()
   * 的原因，见下方 destroy() 的说明。 */
  export interface PageFlipUI {
    destroy(): void;
  }

  export class PageFlip {
    constructor(element: HTMLElement, settings: Partial<PageFlipSetting>);
    loadFromImages(images: string[]): void;
    loadFromHTML(items: NodeListOf<HTMLElement> | HTMLElement[]): void;
    updateFromImages(images: string[]): void;
    updateFromHtml(items: NodeListOf<HTMLElement> | HTMLElement[]): void;
    /** 注意：这个方法内部不仅会清理自己创建的子元素，还会把构造时传入的
     * 容器元素本身从 DOM 里整个移除（`this.block.remove()`）。如果容器元素是
     * 由 React 通过 ref 持有、还打算继续复用（例如尺寸变化时原地重建一个新
     * 实例，而不是连容器一起换掉），千万不要调用这个方法——React 仍然以为
     * 这个节点存在于它记录的树里，之后它自己尝试移除/更新这个节点时会抛出
     * "Failed to execute 'removeChild': The node to be removed is not a child
     * of this node" 这个错误（这是实际踩到过的一个真实 bug，不是猜测）。
     * 需要重建或卸载时，改用 getUI().destroy()，只清理库自己创建的内容，
     * 容器元素本身继续交给 React 管理。 */
    destroy(): void;
    /** 取得内部 UI 层对象，用于调用 getUI().destroy() 代替 destroy()（见上）。 */
    getUI(): PageFlipUI;
    flipNext(corner?: "top" | "bottom"): void;
    flipPrev(corner?: "top" | "bottom"): void;
    flip(pageIndex: number, corner?: "top" | "bottom"): void;
    turnToPage(pageIndex: number): void;
    turnToNextPage(): void;
    turnToPrevPage(): void;
    /** 强制按容器当前真实宽高重新计算尺寸/重绘（size: "stretch" 模式下用于在
     * 容器尺寸变化但库未能及时自动感知时——如全屏切换——手动触发重新计算）。 */
    update(): void;
    getCurrentPageIndex(): number;
    getPageCount(): number;
    getOrientation(): "portrait" | "landscape";
    getState(): FlippingState;
    getBoundsRect(): { width: number; height: number; left: number; top: number };
    on(event: "flip", callback: (e: FlipEvent) => void): PageFlip;
    on(event: "changeOrientation", callback: (e: FlipEvent) => void): PageFlip;
    on(event: "changeState", callback: (e: { data: FlippingState }) => void): PageFlip;
    on(event: "init", callback: (e: FlipEvent) => void): PageFlip;
    on(event: "update", callback: (e: FlipEvent) => void): PageFlip;
    off(event: string): void;
  }
}
