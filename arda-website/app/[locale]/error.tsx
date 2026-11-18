"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { LinkButton } from "@/components/ui/Button";
import { Container } from "@/components/ui/primitives";

/**
 * 临时诊断用的全局报错兜底页：目前整个网站没有任何 error.tsx 边界，
 * 一旦某个页面在服务器渲染时抛出未捕获的异常，用户看到的就是浏览器/Vercel
 * 自带的通用崩溃页（"This page couldn't load"），完全看不到任何有用信息。
 *
 * 加上这个文件后，[locale] 下所有页面渲染出错时都会走到这里，把 Next.js
 * 提供的报错信息（生产环境下会被部分脱敏，但 digest 值可以拿去 Vercel
 * 的 Runtime Logs 里搜索，能对应到服务器端完整的报错堆栈）直接显示出来，
 * 不用再靠猜。问题定位后可以把这个文件删掉，或者换成更友好的兜底 UI。
 */
export default function LocaleError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const pathname = usePathname();
  const locale = pathname?.startsWith("/en") ? "en" : "zh";

  useEffect(() => {
    console.error("[LocaleError] 页面渲染出错：", error);
  }, [error]);

  return (
    <Container className="flex flex-col items-center justify-center py-32 text-center">
      <p className="mb-3 text-xs font-bold uppercase tracking-[0.3em] text-gold-600">ARDA</p>
      <h1 className="text-3xl font-extrabold text-navy-900">
        {locale === "zh" ? "页面加载出错" : "Something went wrong"}
      </h1>
      <div className="mt-6 max-w-xl rounded-lg border border-red-200 bg-red-50 p-4 text-left text-sm text-red-700">
        <p className="font-semibold">
          {locale === "zh" ? "错误信息（临时诊断用，问题解决后会移除）：" : "Error details (temporary diagnostics):"}
        </p>
        <p className="mt-1 break-all font-mono text-xs">{error.message || "(no message)"}</p>
        {error.digest && (
          <p className="mt-2 break-all font-mono text-xs text-red-500">digest: {error.digest}</p>
        )}
      </div>
      <div className="mt-8 flex gap-4">
        <button
          type="button"
          onClick={() => reset()}
          className="inline-flex items-center justify-center rounded-md bg-navy-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-navy-800"
        >
          {locale === "zh" ? "重试" : "Try again"}
        </button>
        <LinkButton href={`/${locale}`} variant="secondary">
          {locale === "zh" ? "返回首页" : "Back to Home"}
        </LinkButton>
      </div>
    </Container>
  );
}
