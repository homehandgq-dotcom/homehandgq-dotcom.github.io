"use client";

// 页面间的轻量过渡效果：淡入 + 轻微上移，时长短（约 0.25s），不做位移较大的滑动，
// 避免影响可感知性能。命中 prefers-reduced-motion 时直接跳过，只渲染内容本身。
//
// 重要：仅在 app/[locale]/layout.tsx（公开前台）中使用，/admin 后台布局不引入本组件，
// 以保证后台管理界面的交互行为完全不受影响。

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const reduce = useReducedMotion();

  if (reduce) {
    return <>{children}</>;
  }

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
