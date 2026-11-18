import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

type Variant = "primary" | "secondary" | "ghost" | "outline-light";
type Size = "sm" | "md" | "lg";

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-navy-900 text-white hover:bg-navy-800 focus-visible:outline-gold-400 disabled:bg-navy-300",
  secondary:
    "bg-transparent text-navy-900 border border-gold-400 hover:bg-gold-50 disabled:opacity-50",
  ghost: "bg-transparent text-navy-900 hover:bg-navy-50 disabled:opacity-50",
  "outline-light":
    "bg-transparent text-white border border-white/60 hover:bg-white/10 disabled:opacity-50",
};

const sizeClasses: Record<Size, string> = {
  sm: "text-sm px-4 py-2",
  md: "text-sm px-5 py-3",
  lg: "text-base px-7 py-3.5",
};

// btn-sheen：悬停时的光泽扫过效果（纯 CSS 关键帧，见 globals.css），全站按钮统一启用，
// 不改变按钮的既有内容结构，只是外观上的克制点缀。
const base =
  "btn-sheen inline-flex items-center justify-center gap-2 rounded font-semibold transition-colors duration-150 disabled:cursor-not-allowed";

interface CommonProps {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
  /** 追加一个悬停时向右轻移的箭头图标（默认关闭，避免与已含"→"文案的按钮重复） */
  arrow?: boolean;
}

export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  arrow = false,
  ...rest
}: CommonProps & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn(base, variantClasses[variant], sizeClasses[size], className)}
      {...rest}
    >
      {children}
      {arrow && <ArrowRight className="btn-arrow h-4 w-4" aria-hidden />}
    </button>
  );
}

export function LinkButton({
  href,
  variant = "primary",
  size = "md",
  className,
  children,
  target,
  rel,
  arrow = false,
}: CommonProps & { href: string; target?: string; rel?: string }) {
  return (
    <Link
      href={href}
      target={target}
      rel={rel}
      className={cn(base, variantClasses[variant], sizeClasses[size], className)}
    >
      {children}
      {arrow && <ArrowRight className="btn-arrow h-4 w-4" aria-hidden />}
    </Link>
  );
}
