import Image from "next/image";
import { UtensilsCrossed } from "lucide-react";
import { cn } from "@/lib/utils/cn";

/**
 * 封面图组件：有真实图片时正常展示；未上传时展示统一品牌化占位图形，
 * 避免使用未经授权的外部图片，同时保持页面视觉一致。
 *
 * interactive：开启后叠加轻微图片放大 + 底部渐变遮罩（配合父级 .group 悬停触发，
 * 见 globals.css 中 .img-zoom-mask）。默认关闭，避免影响管理后台等非卡片场景的既有外观。
 */
export function CoverImage({
  src,
  alt,
  className,
  sizes = "(min-width: 1024px) 33vw, 100vw",
  interactive = false,
  objectFit = "cover",
  bgClassName = "bg-navy-50",
}: {
  src?: string | null;
  alt: string;
  className?: string;
  sizes?: string;
  interactive?: boolean;
  /** 默认 "cover"（裁切填满，适合新闻/活动封面照片）；logo 墙这类不能裁切的场景传
   * "contain"（完整显示，比例不匹配时四周留白，不会裁掉 logo 的任何部分） */
  objectFit?: "cover" | "contain";
  /** objectFit="contain" 时，图片没盖满的四周留白区域的背景色；默认浅蓝灰色，
   * logo 卡片这类想要纯白底的场景可传 "bg-white" */
  bgClassName?: string;
}) {
  if (!src) {
    return (
      <div
        className={cn(
          "relative flex items-center justify-center overflow-hidden bg-gradient-to-br from-navy-800 to-navy-900",
          className
        )}
        role="img"
        aria-label={alt}
      >
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "repeating-linear-gradient(135deg, rgba(199,165,116,0.5) 0px, rgba(199,165,116,0.5) 1px, transparent 1px, transparent 24px)",
          }}
        />
        <UtensilsCrossed className="relative h-8 w-8 text-gold-300/70" aria-hidden />
      </div>
    );
  }

  return (
    <div className={cn("relative overflow-hidden", bgClassName, className)}>
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        className={cn(
          objectFit === "contain" ? "object-contain p-2" : "object-cover",
          interactive && "transition-transform duration-500 ease-out group-hover:scale-110"
        )}
      />
      {interactive && <div className="img-zoom-mask" />}
    </div>
  );
}
