"use client";

import { useEffect } from "react";

/**
 * 后台管理区的错误边界——之前只有前台 app/[locale]/error.tsx 有这个机制，
 * /admin 这边一直没有，所以后台页面一旦渲染报错，用户看到的就是浏览器/
 * 客户端框架自己兜底的那个通用黑色"This page couldn't load"页面，看不到
 * 任何具体原因。这里补上同款诊断边界：捕获报错后把 message/digest 直接
 * 显示出来，方便截图反馈定位问题（跟之前"纽约分会"页面报错走的是同一套
 * 排查方法）。
 */
export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[AdminError] 后台页面渲染出错：", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <p className="mb-3 text-xs font-bold uppercase tracking-[0.3em] text-gold-600">ARDA 后台</p>
      <h1 className="text-2xl font-extrabold text-navy-900">页面加载出错</h1>
      <div className="mt-6 max-w-xl rounded-lg border border-red-200 bg-red-50 p-4 text-left text-sm text-red-700">
        <p className="font-semibold">错误信息（把这一整块截图反馈即可定位问题）：</p>
        <p className="mt-1 break-all font-mono text-xs">{error.message || "(no message)"}</p>
        {error.digest && <p className="mt-2 break-all font-mono text-xs text-red-500">digest: {error.digest}</p>}
      </div>
      <button
        type="button"
        onClick={() => reset()}
        className="mt-8 inline-flex items-center justify-center rounded-md bg-navy-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-navy-800"
      >
        重试
      </button>
    </div>
  );
}
