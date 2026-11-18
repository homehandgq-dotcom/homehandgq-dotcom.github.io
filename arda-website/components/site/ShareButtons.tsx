"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Link2, Mail, Share2 } from "lucide-react";
import type { Locale } from "@/lib/i18n/config";

export function ShareButtons({ locale, title }: { locale: Locale; title: string }) {
  const pathname = usePathname();
  const [copied, setCopied] = useState(false);

  function getUrl() {
    if (typeof window === "undefined") return pathname;
    return window.location.href;
  }

  async function handleShare() {
    const url = getUrl();
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title, url });
        return;
      } catch {
        // 用户取消分享，忽略
      }
    }
    await handleCopy();
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(getUrl());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard 不可用时静默失败
    }
  }

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm font-semibold text-ink-600">
        {locale === "zh" ? "分享：" : "Share:"}
      </span>
      <button
        type="button"
        onClick={handleShare}
        className="flex items-center gap-1.5 rounded border border-navy-200 px-3 py-1.5 text-xs font-medium text-navy-800 hover:bg-navy-50"
      >
        <Share2 className="h-3.5 w-3.5" aria-hidden />
        {locale === "zh" ? "分享" : "Share"}
      </button>
      <button
        type="button"
        onClick={handleCopy}
        className="flex items-center gap-1.5 rounded border border-navy-200 px-3 py-1.5 text-xs font-medium text-navy-800 hover:bg-navy-50"
      >
        <Link2 className="h-3.5 w-3.5" aria-hidden />
        {copied ? (locale === "zh" ? "已复制链接" : "Link copied") : locale === "zh" ? "复制链接" : "Copy link"}
      </button>
      <a
        href={`mailto:?subject=${encodeURIComponent(title)}`}
        className="flex items-center gap-1.5 rounded border border-navy-200 px-3 py-1.5 text-xs font-medium text-navy-800 hover:bg-navy-50"
      >
        <Mail className="h-3.5 w-3.5" aria-hidden />
        {locale === "zh" ? "邮件" : "Email"}
      </a>
    </div>
  );
}
