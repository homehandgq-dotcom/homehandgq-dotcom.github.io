"use client";

// Hero 文案与按钮的进场动效：标题 / 副标题 / 按钮组依次交错淡入上升。
// 从 Hero.tsx（Server Component）中拆出，因为交错动效需要 Framer Motion 的
// client 端能力；背景网格/光晕装饰则继续留在 Hero.tsx 中以纯 CSS 关键帧驱动。

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import type { Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

export function HeroContent({
  locale,
  kicker,
  title,
  subtitle,
}: {
  locale: Locale;
  kicker: string;
  title: string;
  subtitle: string;
}) {
  const dict = getDictionary(locale);
  const reduce = useReducedMotion();

  const container = reduce
    ? {}
    : {
        initial: "hidden",
        animate: "show",
        variants: { hidden: {}, show: { transition: { staggerChildren: 0.12, delayChildren: 0.05 } } },
      };

  const item = reduce
    ? {}
    : {
        variants: {
          hidden: { opacity: 0, y: 22 },
          show: { opacity: 1, y: 0, transition: { duration: 0.65, ease: EASE } },
        },
      };

  return (
    <motion.div {...container}>
      <motion.p
        {...item}
        className="mb-4 text-xs font-bold uppercase tracking-[0.3em] text-gold-300"
      >
        {kicker}
      </motion.p>
      <motion.h1
        {...item}
        className="max-w-3xl text-3xl font-extrabold leading-tight sm:text-4xl lg:text-5xl"
      >
        {title}
      </motion.h1>
      {/* whitespace-pre-line：副标题在后台用换行符分句时，前台按句分行显示
          （协会定版要求定位句 / 愿景三句分行）；没有换行符时与原来一样自然断行 */}
      {subtitle && (
        <motion.p
          {...item}
          className="mt-6 max-w-2xl whitespace-pre-line text-base leading-relaxed text-navy-100 lg:text-lg"
        >
          {subtitle}
        </motion.p>
      )}
      <motion.div {...item} className="mt-10 flex flex-wrap gap-4">
        <Link
          href={`/${locale}/membership/apply`}
          className="btn-sheen group inline-flex items-center gap-2 rounded bg-gold-400 px-7 py-3.5 text-sm font-bold text-navy-900 transition-colors hover:bg-gold-300"
        >
          {dict.home.heroCta1}
          <ArrowRight className="btn-arrow h-4 w-4" aria-hidden />
        </Link>
        <Link
          href={`/${locale}/about`}
          className="btn-sheen rounded border border-white/50 px-7 py-3.5 text-sm font-bold text-white transition-colors hover:bg-white/10"
        >
          {dict.home.heroCta2}
        </Link>
      </motion.div>
    </motion.div>
  );
}
