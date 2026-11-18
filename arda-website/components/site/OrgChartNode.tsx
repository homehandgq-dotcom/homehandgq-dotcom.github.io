"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import type { Locale } from "@/lib/i18n/config";

/**
 * 组织架构图节点：默认展示为静态卡片（保持原样式）；当传入 descZh/descEn
 * （职责说明文字）时自动变为可点击卡片，点击后弹出详情卡片展示完整职责说明
 * 及当前负责人/召集人信息（取自 sub，与卡片上显示的一致）。
 * 用于秘书处各部门、专业委员会、分支机构等节点。
 */
export function Node({
  zh,
  en,
  sub,
  locale,
  tone = "navy",
  descZh,
  descEn,
}: {
  zh: string;
  en: string;
  sub?: string;
  locale: Locale;
  tone?: "navy" | "gold" | "ghost";
  descZh?: string;
  descEn?: string;
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKeyDown);
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = original;
    };
  }, [open]);

  const toneClass =
    tone === "gold"
      ? "border-gold-300 bg-gold-50"
      : tone === "ghost"
        ? "border-dashed border-navy-200 bg-white/60"
        : "border-navy-200 bg-white";
  const clickable = Boolean(descZh || descEn);

  const box = (
    <div
      className={`rounded-lg border ${toneClass} px-4 py-2.5 text-center shadow-sm ${
        clickable ? "transition hover:border-navy-300 hover:shadow-md" : ""
      }`}
    >
      <p className="text-sm font-bold text-navy-900">{locale === "zh" ? zh : en}</p>
      {sub && <p className="mt-0.5 text-[11px] leading-snug text-ink-500">{sub}</p>}
    </div>
  );

  if (!clickable) return box;

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="block w-full text-left">
        {box}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-navy-900/60 p-4"
          onClick={() => setOpen(false)}
          role="presentation"
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="orgchart-modal-title"
            onClick={(e) => e.stopPropagation()}
            className="relative max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-7 shadow-2xl sm:p-8"
          >
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label={locale === "zh" ? "关闭" : "Close"}
              className="absolute right-4 top-4 rounded-full p-2 text-navy-500 hover:bg-navy-50 hover:text-navy-800"
            >
              <X className="h-5 w-5" aria-hidden />
            </button>

            <p id="orgchart-modal-title" className="pr-8 text-xl font-bold text-navy-900">
              {locale === "zh" ? zh : en}
            </p>
            {sub && <p className="mt-1.5 text-sm font-medium text-gold-600">{sub}</p>}
            <p className="mt-6 whitespace-pre-line text-base leading-loose text-ink-700">
              {locale === "zh" ? descZh : descEn}
            </p>
          </div>
        </div>
      )}
    </>
  );
}
