"use client";

import { useRef, useState } from "react";
import { UploadCloud, Loader2, X } from "lucide-react";
import { createClient } from "@/lib/supabase/browser";

/**
 * 图片 / 文件上传字段：直接从浏览器上传到 Supabase Storage 对应桶
 * （由 RLS 策略保证仅 content.publish 权限的管理员可写入），
 * 上传成功后把公开访问 URL 写回表单值；也允许直接手动粘贴外部链接。
 */
export function MediaUploadField({
  value,
  onChange,
  bucket,
  preview = true,
  accept,
  acceptLabel,
}: {
  value: string;
  onChange: (url: string) => void;
  bucket: "avatars" | "logos" | "media" | "downloads";
  preview?: boolean;
  /** 限制可上传的文件类型，如 "image/png"；同时用于文件选择器过滤和上传前校验 */
  accept?: string;
  /** 校验不通过时提示里显示的文字说明，如 "仅支持 PNG 格式" */
  acceptLabel?: string;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function extensionMatchesAccept(fileName: string): boolean {
    if (!accept) return true;
    // accept 目前只用到 "image/png" 这类具体 MIME，按扩展名做一次兜底校验，
    // 避免个别浏览器/操作系统上 accept 属性被绕过（比如手动选"所有文件"）
    const ext = fileName.split(".").pop()?.toLowerCase();
    if (accept === "image/png") return ext === "png";
    return true;
  }

  async function handleFile(file: File) {
    setError(null);
    if (accept && file.type && file.type !== accept) {
      setError(`文件格式不对，${acceptLabel || `仅支持 ${accept}`}（你选的是 ${file.type || "未知格式"}）`);
      if (inputRef.current) inputRef.current.value = "";
      return;
    }
    if (!extensionMatchesAccept(file.name)) {
      setError(`文件格式不对，${acceptLabel || `仅支持 ${accept}`}`);
      if (inputRef.current) inputRef.current.value = "";
      return;
    }
    setUploading(true);
    try {
      const supabase = createClient();
      const ext = file.name.split(".").pop() || "bin";
      const path = `${crypto.randomUUID()}.${ext}`;
      const { error: uploadError } = await supabase.storage.from(bucket).upload(path, file, {
        cacheControl: "3600",
        upsert: false,
      });
      if (uploadError) throw uploadError;
      const { data } = supabase.storage.from(bucket).getPublicUrl(path);
      onChange(data.publicUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : "上传失败，请稍后重试");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://... 或点击右侧上传"
          className="input flex-1"
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="flex shrink-0 items-center gap-1.5 rounded border border-navy-200 px-3 py-2 text-xs font-semibold text-navy-800 hover:bg-navy-50 disabled:opacity-60"
        >
          {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <UploadCloud className="h-3.5 w-3.5" />}
          上传
        </button>
        {value && (
          <button
            type="button"
            onClick={() => onChange("")}
            className="shrink-0 rounded border border-navy-200 p-2 text-navy-500 hover:bg-navy-50"
            aria-label="清除"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
          }}
        />
      </div>
      {acceptLabel && <p className="text-xs text-ink-400">{acceptLabel}</p>}
      {error && <p className="text-xs text-red-600">{error}</p>}
      {preview && value && /\.(png|jpe?g|webp|svg|gif)$/i.test(value) && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={value} alt="预览" className="h-24 w-auto rounded border border-navy-100 object-cover" />
      )}
    </div>
  );
}
