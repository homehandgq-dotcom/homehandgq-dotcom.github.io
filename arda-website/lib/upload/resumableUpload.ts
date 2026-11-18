"use client";

import * as tus from "tus-js-client";
import { createClient } from "@/lib/supabase/browser";

export interface ResumableUploadResult {
  path: string;
}

export interface ResumableUploadOptions {
  file: File;
  bucket: "videos" | "publications";
  /** 对象路径（含文件名），例如 `videos/${uuid}.mp4` */
  objectPath: string;
  onProgress?: (percent: number, bytesUploaded: number, bytesTotal: number) => void;
}

export interface ResumableUploadHandle {
  promise: Promise<ResumableUploadResult>;
  abort: () => void;
}

function storageResumableEndpoint(): string {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) throw new Error("缺少 NEXT_PUBLIC_SUPABASE_URL 环境变量配置");
  const parsed = new URL(url);
  // Supabase 项目默认域名形如 <ref>.supabase.co；可恢复上传（TUS）走专用的
  // storage 子域名 <ref>.storage.supabase.co，而不是 <ref>.supabase.co 本身。
  const storageHost = parsed.hostname.replace(/\.supabase\.co$/, ".storage.supabase.co");
  return `${parsed.protocol}//${storageHost}/storage/v1/upload/resumable`;
}

function describeUploadError(error: Error | tus.DetailedError): string {
  const detailed = error as tus.DetailedError;
  const status = detailed.originalResponse?.getStatus?.();
  if (status === 413) return "文件超出该类型允许的最大大小限制";
  if (status === 401 || status === 403) return "没有上传权限，请确认已使用具备发布权限的管理员账号登录后台";
  if (status === 415 || status === 400) return "不支持的文件格式，或文件已损坏";
  if (typeof navigator !== "undefined" && !navigator.onLine) {
    return "网络连接已中断，请检查网络后重试（支持断点续传，恢复网络后无需重新上传已完成部分）";
  }
  return error.message || "上传失败，请稍后重试";
}

/**
 * 直接从浏览器向 Supabase Storage 发起可恢复（TUS 协议）分片上传——全程不经过
 * Next.js 服务端中转，避免大文件在服务端代理环节超时；带真实的字节级进度回调；
 * 网络中断后可从已上传的分片处继续，不必重新上传整份文件。
 *
 * 鉴权沿用当前已登录管理员的 Supabase 会话（与普通直传一致），因此同样受
 * `storage.objects` 的 RLS 插入策略约束（见迁移 0012：仅 content.publish 权限可写）。
 */
export function uploadResumable(opts: ResumableUploadOptions): ResumableUploadHandle {
  const { file, bucket, objectPath, onProgress } = opts;
  let upload: tus.Upload | null = null;
  let aborted = false;

  const promise = new Promise<ResumableUploadResult>((resolve, reject) => {
    (async () => {
      const supabase = createClient();
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !sessionData.session) {
        reject(new Error("登录状态已失效，请重新登录后台后再上传"));
        return;
      }
      if (aborted) return;

      upload = new tus.Upload(file, {
        endpoint: storageResumableEndpoint(),
        retryDelays: [0, 3000, 5000, 10000, 20000],
        headers: { authorization: `Bearer ${sessionData.session.access_token}` },
        uploadDataDuringCreation: true,
        removeFingerprintOnSuccess: true,
        chunkSize: 6 * 1024 * 1024, // Supabase 要求固定 6MB 分片，不可更改
        metadata: {
          bucketName: bucket,
          objectName: objectPath,
          contentType: file.type || "application/octet-stream",
          cacheControl: "3600",
        },
        onError: (error) => reject(new Error(describeUploadError(error))),
        onProgress: (bytesUploaded, bytesTotal) => {
          onProgress?.(Math.round((bytesUploaded / bytesTotal) * 100), bytesUploaded, bytesTotal);
        },
        onSuccess: () => resolve({ path: objectPath }),
      });

      try {
        const previousUploads = await upload.findPreviousUploads();
        if (previousUploads.length > 0) {
          upload.resumeFromPreviousUpload(previousUploads[0]);
        }
        upload.start();
      } catch (err) {
        reject(err instanceof Error ? err : new Error("上传初始化失败"));
      }
    })();
  });

  return {
    promise,
    abort: () => {
      aborted = true;
      upload?.abort();
    },
  };
}

/** 非可恢复的小文件直传（封面图等 <10MB 场景），沿用既有 MediaUploadField 的直传方式 */
export async function uploadSmallFile(
  bucket: "videos" | "publications",
  objectPath: string,
  file: File | Blob,
  contentType?: string
): Promise<{ path: string }> {
  const supabase = createClient();
  const { error } = await supabase.storage.from(bucket).upload(objectPath, file, {
    cacheControl: "3600",
    upsert: false,
    contentType,
  });
  if (error) throw new Error(error.message || "上传失败");
  return { path: objectPath };
}
