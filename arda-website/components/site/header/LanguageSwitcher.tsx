"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { locales, type Locale } from "@/lib/i18n/config";
import { cn } from "@/lib/utils/cn";

function swapLocale(pathname: string, target: Locale) {
  const segments = pathname.split("/");
  if (segments.length > 1 && (locales as readonly string[]).includes(segments[1])) {
    segments[1] = target;
    return segments.join("/") || `/${target}`;
  }
  return `/${target}${pathname}`;
}

export function LanguageSwitcher({ locale, light = false }: { locale: Locale; light?: boolean }) {
  const pathname = usePathname() || `/${locale}`;

  return (
    <div
      className={cn(
        "flex items-center rounded-full border text-xs font-semibold",
        light ? "border-white/40 text-white" : "border-navy-200 text-navy-700"
      )}
      role="group"
      aria-label="Language switcher / 语言切换"
    >
      {locales.map((l) => (
        <Link
          key={l}
          href={swapLocale(pathname, l)}
          aria-current={l === locale ? "true" : undefined}
          className={cn(
            "rounded-full px-3 py-1.5 transition-colors",
            l === locale
              ? light
                ? "bg-white text-navy-900"
                : "bg-navy-900 text-white"
              : "hover:opacity-70"
          )}
        >
          {l === "zh" ? "中文" : "EN"}
        </Link>
      ))}
    </div>
  );
}
