"use client";

// 首页数据统计的滚动计数动效：进入视口后从 0 数到目标值。
// 仅对能解析出数字前缀的字符串生效（如 "128"、"11"、"6.5"）；无法解析时原样展示，
// 不强行拆解，避免破坏诸如 "10,000+" 这类已经带格式的文案。

import { useEffect, useRef, useState } from "react";
import { animate, useInView, useReducedMotion } from "framer-motion";

export function AnimatedCounter({ value }: { value: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const reduce = useReducedMotion();
  const [display, setDisplay] = useState(value);

  const match = value.match(/^(\d+(?:\.\d+)?)/);
  const numeric = match ? parseFloat(match[1]) : null;
  const tail = match ? value.slice(match[0].length) : "";
  const decimals = match && match[1].includes(".") ? match[1].split(".")[1].length : 0;

  useEffect(() => {
    if (!inView || numeric === null || reduce) {
      return;
    }
    const controls = animate(0, numeric, {
      duration: 1.3,
      ease: [0.16, 1, 0.3, 1],
      onUpdate(v) {
        setDisplay(`${v.toFixed(decimals)}${tail}`);
      },
    });
    return () => controls.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, numeric, reduce]);

  return <span ref={ref}>{display}</span>;
}
