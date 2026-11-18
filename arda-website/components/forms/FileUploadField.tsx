"use client";

import { useRef, useState } from "react";
import { Upload, CheckCircle2, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/browser";
import type { Locale } from "@/lib/i18n/config";

/**
 * 文件上传字段：直接上传到 Supabase Storage 对应 bucket（依赖 storage RLS 策略）。
 * `applications` bucket 为私有桶，仅管理员可读取，适合名片/证明文件等敏感文档；
 * `logos` / `avatars` 为公开桶，用于会员目录展示用的 Logo 与头像。
 */
export function FileUploadField({
  locale,
  bucket,
  label,
  accept,
  maxSizeMb = 5,
  onUploaded,
}: {
  locale: Locale;
  bucket: "applications" | "logos" | "avatars";
  label: string;
  accept?: string;
  maxSizeMb?: number;
  onUploaded: (url: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<"idle" | "uploading" | "done" | "error">("idle");
  const [fileName, setFileName] = useState<string>("");
  const [error, setError] = useState("");

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > maxSizeMb * 1024 * 1024) {
      setStatus("error");
      setError(locale === "zh" ? `文件大小不能超过 ${maxSizeMb}MB` : `File must be under ${maxSizeMb}MB`);
      return;
    }

    setStatus("uploading");
    setFileName(file.name);
    try {
      const supabase = createClient();
      const ext = file.name.split(".").pop();
      const path = `${bucket === "applications" ? "submissions" : "uploads"}/${crypto.randomUUID()}.${ext}`;
      const { error: uploadError } = await supabase.storage.from(bucket).upload(path, file, {
        cacheControl: "3600",
        upsert: false,
      });
      if (uploadError) throw uploadError;

      if (bucket === "applications") {
        // 私有桶：保存 path，后台审核时再生成签名 URL 展示
        onUploaded(path);
      } else {
        const { data } = supabase.storage.from(bucket).getPublicUrl(path);
        onUploaded(data.publicUrl);
      }
      setStatus("done");
    } catch (err) {
      console.error(err);
      setStatus("error");
      setError(locale === "zh" ? "上传失败，请重试" : "Upload failed, please try again");
    }
  }

  return (
    <div>
      <span className="mb-1.5 block text-sm font-semibold text-navy-900">{label}</span>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="flex w-full items-center gap-2 rounded border border-dashed border-navy-300 px-4 py-3 text-sm text-ink-600 hover:bg-navy-50"
      >
        {status === "uploading" ? (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
        ) : status === "done" ? (
          <CheckCircle2 className="h-4 w-4 text-green-600" aria-hidden />
        ) : (
          <Upload className="h-4 w-4" aria-hidden />
        )}
        <span className="truncate">
          {fileName || (locale === "zh" ? "点击选择文件" : "Click to choose a file")}
        </span>
      </button>
      <input ref={inputRef} type="file" accept={accept} onChange={handleChange} className="hidden" />
      {status === "error" && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
