import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";
import { Reveal } from "@/components/motion/Reveal";

export function Container({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn("container-arda", className)}>{children}</div>;
}

export function Section({
  className,
  children,
  tone = "white",
  id,
  reveal = true,
}: {
  className?: string;
  children: ReactNode;
  tone?: "white" | "mist" | "navy";
  id?: string;
  /** 内容进入视口时是否播放淡入上升动效（默认开启）；关闭时立即渲染，不做动效包裹 */
  reveal?: boolean;
}) {
  const toneClass =
    tone === "mist" ? "bg-mist" : tone === "navy" ? "bg-navy-900 text-white" : "bg-white";
  return (
    <section id={id} className={cn("py-16 lg:py-24", toneClass, className)}>
      {reveal ? <Reveal>{children}</Reveal> : children}
    </section>
  );
}

export function SectionHeading({
  kicker,
  title,
  desc,
  align = "left",
  light = false,
}: {
  kicker?: string;
  title: string;
  desc?: string;
  align?: "left" | "center";
  light?: boolean;
}) {
  return (
    <div className={cn("mb-10 max-w-3xl", align === "center" && "mx-auto text-center")}>
      {kicker && (
        <p
          className={cn(
            "mb-2 text-xs font-bold uppercase tracking-[0.2em]",
            light ? "text-gold-300" : "text-gold-600"
          )}
        >
          {kicker}
        </p>
      )}
      <h2 className={cn("text-2xl font-bold lg:text-3xl", light ? "text-white" : "text-navy-900")}>
        {title}
      </h2>
      {desc && (
        <p className={cn("mt-3 text-base leading-relaxed", light ? "text-navy-100" : "text-ink-600")}>
          {desc}
        </p>
      )}
    </div>
  );
}

export function Card({
  className,
  children,
  interactive = false,
}: {
  className?: string;
  children: ReactNode;
  /** 开启后叠加轻微上浮 + 阴影增强 + 金色描边光效（见 .card-interactive）；默认关闭，保持既有外观 */
  interactive?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-lg border border-navy-100 bg-white shadow-sm transition-shadow hover:shadow-md",
        interactive && "card-interactive",
        className
      )}
    >
      {children}
    </div>
  );
}

export function Badge({
  children,
  tone = "navy",
  className,
}: {
  children: ReactNode;
  tone?: "navy" | "gold" | "neutral" | "green" | "red";
  className?: string;
}) {
  const tones: Record<string, string> = {
    navy: "bg-navy-50 text-navy-800",
    gold: "bg-gold-100 text-gold-700",
    neutral: "bg-gray-100 text-ink-600",
    green: "bg-green-50 text-green-700",
    red: "bg-red-50 text-red-700",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold",
        tones[tone],
        className
      )}
    >
      {children}
    </span>
  );
}

export function EmptyState({
  title,
  desc,
  action,
}: {
  title: string;
  desc?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-navy-200 bg-mist px-6 py-16 text-center">
      <p className="text-base font-semibold text-navy-900">{title}</p>
      {desc && <p className="mt-2 max-w-md text-sm text-ink-600">{desc}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

export function ErrorState({
  title,
  desc,
  action,
}: {
  title: string;
  desc?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-red-100 bg-red-50 px-6 py-16 text-center">
      <p className="text-base font-semibold text-red-700">{title}</p>
      {desc && <p className="mt-2 max-w-md text-sm text-red-600">{desc}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="animate-pulse rounded-lg border border-navy-100 bg-white p-5">
      <div className="mb-4 h-40 rounded bg-navy-50" />
      <div className="mb-2 h-4 w-2/3 rounded bg-navy-50" />
      <div className="h-4 w-1/2 rounded bg-navy-50" />
    </div>
  );
}

export function GridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}
