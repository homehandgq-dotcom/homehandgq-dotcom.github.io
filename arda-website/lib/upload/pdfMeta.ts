"use client";

import { getDocument, GlobalWorkerOptions } from "pdfjs-dist";

let workerConfigured = false;

/**
 * pdfjs-dist 需要独立的 Worker 脚本。用 `new URL(..., import.meta.url)` 这种
 * 打包器可静态分析的写法，让 Turbopack/Webpack 把 worker 文件一并打包并给出
 * 正确的最终 URL——不依赖手动拷贝 public/ 静态资源。
 */
function ensureWorker() {
  if (workerConfigured) return;
  GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/build/pdf.worker.min.mjs", import.meta.url).toString();
  workerConfigured = true;
}

function describePdfError(err: unknown): string {
  const message = err instanceof Error ? err.message : String(err);
  if (/password/i.test(message)) return "该 PDF 已设置密码保护，暂不支持加密文件，请上传未加密版本";
  if (/invalid pdf structure|corrupt/i.test(message)) return "文件可能已损坏，无法解析为有效的 PDF";
  return `无法解析该 PDF 文件（${message}），请确认文件未损坏且未加密`;
}

/** 校验并提取总页数；失败时返回具体原因（加密 / 损坏 / 格式不受支持等） */
export async function validatePdf(file: File): Promise<{ ok: true; pageCount: number } | { ok: false; error: string }> {
  ensureWorker();
  const buffer = await file.arrayBuffer();
  const loadingTask = getDocument({ data: buffer });
  try {
    const doc = await loadingTask.promise;
    const pageCount = doc.numPages;
    if (!pageCount || pageCount <= 0) {
      return { ok: false, error: "PDF 页数为 0，文件可能已损坏" };
    }
    return { ok: true, pageCount };
  } catch (err) {
    return { ok: false, error: describePdfError(err) };
  } finally {
    await loadingTask.destroy();
  }
}

/** 将 PDF 第一页渲染为封面图（JPEG Blob），用于管理员未自定义封面时的自动封面 */
export async function extractPdfCoverBlob(file: File): Promise<Blob | null> {
  ensureWorker();
  const buffer = await file.arrayBuffer();
  const loadingTask = getDocument({ data: buffer });
  try {
    const doc = await loadingTask.promise;
    const page = await doc.getPage(1);
    const viewport = page.getViewport({ scale: 1.4 });
    const canvas = document.createElement("canvas");
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    await page.render({ canvas, canvasContext: ctx, viewport }).promise;
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob((b) => resolve(b), "image/jpeg", 0.88));
    return blob;
  } catch {
    return null;
  } finally {
    await loadingTask.destroy();
  }
}
