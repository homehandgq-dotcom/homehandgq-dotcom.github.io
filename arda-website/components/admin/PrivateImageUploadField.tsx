"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, UploadCloud, X } from "lucide-react";
import { uploadSmallFile } from "@/lib/upload/resumableUpload";

const MAX_BYTES = 8 * 1024 * 1024; // 8MB，封面图场景足够
const ACCEPTED = ["image/png", "image/jpeg", "image/webp"];

/**
 * 私有桶内的自定义封面上传（视频祝福 / 刊物均使用）。与公开素材库的
 * MediaUploadField 不同之处：这里只存对象路径，不调用 getPublicUrl
 * （桶是私有的，公开 URL 根本打不开），预览通过后台签名接口按需获取。
 */
export function PrivateImageUploadField({
  value,
  bucket,
  onChange,
  setMany,
}: {
  value: string;
  bucket: "videos" | "publications";
  onChange: (path: string) => void;
  setMany?: (patch: Record<string, unknown>) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

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
      body: JSON.stringify({ bucket, path: value }),
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
  }, [value, bucket]);

  async function handleFile(file: File) {
    setError(null);
    if (!ACCEPTED.includes(file.type)) {
      setError("仅支持 PNG / JPEG / WebP 图片");
      return;
    }
    if (file.size > MAX_BYTES) {
      setError("图片不能超过 8MB");
      return;
    }
    setUploading(true);
    try {
      const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
      const path = `covers/${crypto.randomUUID()}.${ext}`;
      await uploadSmallFile(bucket, path, file, file.type);
      onChange(path);
      setMany?.({ cover_is_auto: false });
    } catch (err) {
      setError(err instanceof Error ? err.message : "上传失败");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function handleClear() {
    onChange("");
    setMany?.({ cover_is_auto: true });
    setPreviewUrl(null);
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-1.5 rounded border border-navy-200 px-3 py-2 text-xs font-semibold text-navy-800 hover:bg-navy-50 disabled:opacity-60"
        >
          {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <UploadCloud className="h-3.5 w-3.5" />}
          上传封面
        </button>
        {value && (
          <button
            type="button"
            onClick={handleClear}
            className="flex items-center gap-1 rounded border border-navy-200 p-2 text-navy-500 hover:bg-navy-50"
          >
            <X className="h-3.5 w-3.5" /> 清除
          </button>
        )}
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED.join(",")}
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
          }}
        />
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
      {previewLoading && <p className="text-xs text-ink-400">加载预览…</p>}
      {previewUrl && !previewLoading && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={previewUrl} alt="封面预览" className="h-24 w-auto rounded border border-navy-100 object-cover" />
      )}
    </div>
  );
}
