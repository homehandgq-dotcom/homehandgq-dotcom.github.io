"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, UploadCloud, X, AlertTriangle } from "lucide-react";
import { uploadResumable, uploadSmallFile } from "@/lib/upload/resumableUpload";
import { extractVideoMeta, extractVideoCoverBlob, checkVideoCompatibility } from "@/lib/upload/videoMeta";

const MAX_BYTES = 500 * 1024 * 1024; // 500MB，与迁移 0013 中 videos 桶的 file_size_limit 一致
const ACCEPTED = ["video/mp4", "video/quicktime", "video/webm"];

export interface VideoFieldValues {
  video_path?: string;
  cover_path?: string;
  [key: string]: unknown;
}

export function VideoUploadField({
  value,
  values,
  onChange,
  setMany,
}: {
  value: string;
  values: VideoFieldValues;
  onChange: (path: string) => void;
  setMany: (patch: Record<string, unknown>) => void;
}) {
  const [phase, setPhase] = useState<"idle" | "reading" | "uploading" | "error">("idle");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<(() => void) | null>(null);

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
      body: JSON.stringify({ bucket: "videos", path: value }),
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
    setWarning(null);

    if (file.size > MAX_BYTES) {
      setError(`文件大小 ${(file.size / 1024 / 1024).toFixed(1)}MB，超过 500MB 上限`);
      return;
    }
    const compat = checkVideoCompatibility(file);
    if (compat.warning) setWarning(compat.warning);

    setPhase("reading");
    let meta: Awaited<ReturnType<typeof extractVideoMeta>> | null = null;
    try {
      meta = await extractVideoMeta(file);
    } catch (err) {
      setWarning((prev) => [prev, err instanceof Error ? err.message : "无法读取视频元数据"].filter(Boolean).join("；"));
    }

    const ext = file.name.split(".").pop() || "mp4";
    const objectPath = `videos/${crypto.randomUUID()}.${ext}`;

    setPhase("uploading");
    setProgress(0);
    const handle = uploadResumable({
      file,
      bucket: "videos",
      objectPath,
      onProgress: (percent) => setProgress(percent),
    });
    abortRef.current = handle.abort;

    try {
      await handle.promise;
      const patch: Record<string, unknown> = { video_path: objectPath };
      if (meta) {
        patch.video_width = meta.width;
        patch.video_height = meta.height;
        patch.video_duration_seconds = Math.round(meta.durationSeconds * 10) / 10;
        patch.video_orientation = meta.orientation;
      }
      patch.video_mime_type = file.type || null;
      patch.video_size_bytes = file.size;

      // 仅当管理员尚未手动指定自定义封面时，才用自动提取的视频帧覆盖封面
      if (!values.cover_path) {
        try {
          const coverBlob = await extractVideoCoverBlob(file);
          if (coverBlob) {
            const coverPath = `covers/${crypto.randomUUID()}.jpg`;
            await uploadSmallFile("videos", coverPath, coverBlob, "image/jpeg");
            patch.cover_path = coverPath;
            patch.cover_is_auto = true;
          }
        } catch {
          // 自动封面提取失败不影响视频本身上传成功，静默跳过即可
        }
      }

      setMany(patch);
      setPhase("idle");
      setProgress(100);
    } catch (err) {
      setPhase("error");
      setError(err instanceof Error ? err.message : "上传失败");
    } finally {
      abortRef.current = null;
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function handleClear() {
    onChange("");
    setMany({
      video_path: "",
      video_mime_type: null,
      video_size_bytes: null,
      video_width: null,
      video_height: null,
      video_duration_seconds: null,
      video_orientation: null,
    });
    setPreviewUrl(null);
  }

  const uploading = phase === "reading" || phase === "uploading";

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
          {value ? "替换视频" : "选择视频文件"}
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
          accept={ACCEPTED.join(",")}
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
          }}
        />
        <span className="text-xs text-ink-400">支持 MP4 / MOV / WebM，最大 500MB</span>
      </div>

      {phase === "reading" && <p className="text-xs text-ink-500">正在读取视频信息…</p>}
      {phase === "uploading" && (
        <div className="space-y-1">
          <div className="h-2 w-full overflow-hidden rounded-full bg-navy-100">
            <div className="h-full bg-navy-700 transition-all" style={{ width: `${progress}%` }} />
          </div>
          <p className="text-xs text-ink-500">上传中 {progress}%（支持断点续传，网络中断后重新选择同一文件可继续）</p>
        </div>
      )}

      {warning && (
        <p className="flex items-start gap-1.5 rounded bg-gold-100/60 px-3 py-2 text-xs text-gold-700">
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" /> {warning}
        </p>
      )}
      {error && <p className="text-xs text-red-600">{error}</p>}

      {value && (
        <div className="space-y-1.5">
          <p className="truncate text-xs text-ink-500">当前文件：{value}</p>
          {values.video_width && values.video_height ? (
            <p className="text-xs text-ink-400">
              {String(values.video_width)}×{String(values.video_height)}（{String(values.video_orientation ?? "")}）
              {values.video_duration_seconds ? ` · ${Math.round(Number(values.video_duration_seconds))}秒` : ""}
            </p>
          ) : null}
          {previewLoading && <p className="text-xs text-ink-400">加载预览…</p>}
          {previewUrl && !previewLoading && (
            <video src={previewUrl} controls className="max-h-48 rounded border border-navy-100 bg-black" />
          )}
        </div>
      )}
    </div>
  );
}
