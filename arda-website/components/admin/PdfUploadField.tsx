"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, UploadCloud, X } from "lucide-react";
import { uploadResumable, uploadSmallFile } from "@/lib/upload/resumableUpload";
import { validatePdf, extractPdfCoverBlob } from "@/lib/upload/pdfMeta";

const MAX_BYTES = 200 * 1024 * 1024; // 200MB，与迁移 0012 中 publications 桶的 file_size_limit 一致

export interface PdfFieldValues {
  pdf_path?: string;
  cover_path?: string;
  page_count?: number;
  [key: string]: unknown;
}

export function PdfUploadField({
  value,
  values,
  onChange,
  setMany,
}: {
  value: string;
  values: PdfFieldValues;
  onChange: (path: string) => void;
  setMany: (patch: Record<string, unknown>) => void;
}) {
  const [phase, setPhase] = useState<"idle" | "validating" | "uploading" | "error">("idle");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const isReplace = Boolean(value);

  useEffect(() => {
    let active = true;
    if (!value) {
      setPreviewUrl(null);
      return;
    }
    setPreviewLoading(true);
    fetch("/api/admin/storage/sign", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bucket: "publications", path: value }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (active) setPreviewUrl(data.url ?? null);
      })
      .catch(() => {
        if (active) setPreviewUrl(null);
      })
      .finally(() => {
        if (active) setPreviewLoading(false);
      });
    return () => {
      active = false;
    };
  }, [value]);

  async function handleFile(file: File) {
    setError(null);

    if (file.type && file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      setError("仅支持 PDF 文件");
      return;
    }
    if (file.size > MAX_BYTES) {
      setError(`文件大小 ${(file.size / 1024 / 1024).toFixed(1)}MB，超过 200MB 上限`);
      return;
    }

    setPhase("validating");
    const validation = await validatePdf(file);
    if (!validation.ok) {
      setPhase("error");
      setError(validation.error);
      if (inputRef.current) inputRef.current.value = "";
      return;
    }

    const objectPath = `pdfs/${crypto.randomUUID()}.pdf`;
    setPhase("uploading");
    setProgress(0);
    const handle = uploadResumable({
      file,
      bucket: "publications",
      objectPath,
      onProgress: (percent) => setProgress(percent),
    });

    try {
      // 先把新文件完整上传成功，再切换表单里记录的路径；此时原记录的 pdf_path
      // 仍指向旧文件，哪怕接下来保存失败，旧文件也不会丢失或被污染。
      await handle.promise;

      const patch: Record<string, unknown> = {
        pdf_path: objectPath,
        pdf_size_bytes: file.size,
        page_count: validation.pageCount,
      };

      if (!values.cover_path) {
        try {
          const coverBlob = await extractPdfCoverBlob(file);
          if (coverBlob) {
            const coverPath = `covers/${crypto.randomUUID()}.jpg`;
            await uploadSmallFile("publications", coverPath, coverBlob, "image/jpeg");
            patch.cover_path = coverPath;
            patch.cover_is_auto = true;
          }
        } catch {
          // 封面生成失败不影响 PDF 本身上传成功
        }
      } else if (values.cover_path && isReplace) {
        // 已有自定义封面：替换 PDF 时保留管理员自定义的封面，不自动覆盖
      }

      setMany(patch);
      setPhase("idle");
      setProgress(100);
    } catch (err) {
      setPhase("error");
      setError(err instanceof Error ? err.message : "上传失败");
    } finally {
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function handleClear() {
    onChange("");
    setMany({ pdf_path: "", pdf_size_bytes: null, page_count: null });
    setPreviewUrl(null);
  }

  const uploading = phase === "validating" || phase === "uploading";

  return (
    <div className="space-y-3 rounded border border-navy-100 bg-mist/40 p-4">
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-1.5 rounded border border-navy-200 bg-white px-3 py-2 text-xs font-semibold text-navy-800 hover:bg-navy-50 disabled:opacity-60"
        >
          {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <UploadCloud className="h-3.5 w-3.5" />}
          {value ? "替换 PDF" : "选择 PDF 文件"}
        </button>
        {value && !uploading && (
          <button
            type="button"
            onClick={handleClear}
            className="flex items-center gap-1 rounded border border-navy-200 px-2.5 py-2 text-xs text-navy-500 hover:bg-navy-50"
          >
            <X className="h-3.5 w-3.5" /> 清除
          </button>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
          }}
        />
        <span className="text-xs text-ink-400">最大 200MB</span>
      </div>

      {isReplace && !uploading && (
        <p className="text-xs text-ink-400">
          替换文件会保留同一个阅读链接（已打印的二维码无需更换）；新文件未成功上传前，原文件保持不变。
        </p>
      )}

      {phase === "validating" && <p className="text-xs text-ink-500">正在校验 PDF（页数 / 是否加密或损坏）…</p>}
      {phase === "uploading" && (
        <div className="space-y-1">
          <div className="h-2 w-full overflow-hidden rounded-full bg-navy-100">
            <div className="h-full bg-navy-700 transition-all" style={{ width: `${progress}%` }} />
          </div>
          <p className="text-xs text-ink-500">上传中 {progress}%（支持断点续传，网络中断后重新选择同一文件可继续）</p>
        </div>
      )}
      {error && <p className="text-xs text-red-600">{error}</p>}

      {value && (
        <div className="space-y-1.5">
          <p className="truncate text-xs text-ink-500">当前文件：{value}</p>
          {values.page_count ? <p className="text-xs text-ink-400">共 {values.page_count} 页</p> : null}
          {previewLoading && <p className="text-xs text-ink-400">加载预览链接…</p>}
          {previewUrl && !previewLoading && (
            <a
              href={previewUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-block text-xs font-semibold text-navy-700 underline"
            >
              在新窗口预览当前 PDF
            </a>
          )}
        </div>
      )}
    </div>
  );
}
