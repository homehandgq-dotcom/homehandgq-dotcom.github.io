"use client";

export interface VideoMeta {
  width: number;
  height: number;
  durationSeconds: number;
  orientation: "landscape" | "portrait" | "square";
}

/** 浏览器端读取视频宽高/时长/方向（上传前即可完成，不依赖服务端转码能力） */
export function extractVideoMeta(file: File): Promise<VideoMeta> {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    video.preload = "metadata";
    video.muted = true;
    const objectUrl = URL.createObjectURL(file);
    const cleanup = () => URL.revokeObjectURL(objectUrl);

    video.onloadedmetadata = () => {
      const { videoWidth: width, videoHeight: height, duration } = video;
      cleanup();
      if (!width || !height) {
        reject(new Error("无法读取视频尺寸信息，文件可能已损坏或格式不受支持"));
        return;
      }
      const orientation = width === height ? "square" : width > height ? "landscape" : "portrait";
      resolve({ width, height, durationSeconds: Number.isFinite(duration) ? duration : 0, orientation });
    };
    video.onerror = () => {
      cleanup();
      reject(new Error("无法读取视频信息，文件可能已损坏或浏览器不支持该格式"));
    };
    video.src = objectUrl;
  });
}

/**
 * 从视频中部帧截取一张封面图（JPEG Blob），用于管理员未自定义封面时的自动封面。
 * 取 1 秒处（若视频不足 1 秒则取中点），尽量避开开场黑屏；不做任何裁切——
 * 完整保留原始帧内容，避免裁掉人脸，展示层用 object-fit: contain 处理留白。
 */
export function extractVideoCoverBlob(file: File): Promise<Blob | null> {
  return new Promise((resolve) => {
    const video = document.createElement("video");
    video.preload = "auto";
    video.muted = true;
    video.playsInline = true;
    const objectUrl = URL.createObjectURL(file);
    let settled = false;

    const finish = (blob: Blob | null) => {
      if (settled) return;
      settled = true;
      URL.revokeObjectURL(objectUrl);
      resolve(blob);
    };

    const timeout = setTimeout(() => finish(null), 8000);

    video.addEventListener("loadeddata", () => {
      const target = video.duration && video.duration > 1.2 ? 1 : Math.max(0, (video.duration || 0) / 2);
      try {
        video.currentTime = target;
      } catch {
        finish(null);
      }
    });
    video.addEventListener("seeked", () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          finish(null);
          return;
        }
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        canvas.toBlob(
          (blob) => {
            clearTimeout(timeout);
            finish(blob);
          },
          "image/jpeg",
          0.85
        );
      } catch {
        clearTimeout(timeout);
        finish(null);
      }
    });
    video.addEventListener("error", () => {
      clearTimeout(timeout);
      finish(null);
    });

    video.src = objectUrl;
  });
}

/** 在上传前给出明确、具体的格式/兼容性提示（而非"上传成功但播放失败"） */
export function checkVideoCompatibility(file: File): { ok: boolean; warning?: string } {
  const name = file.name.toLowerCase();
  const type = file.type.toLowerCase();

  if (type === "video/mp4" || name.endsWith(".mp4")) {
    return { ok: true };
  }
  if (type === "video/webm" || name.endsWith(".webm")) {
    return { ok: true, warning: "WebM 在部分旧版 iOS/Safari 上可能无法播放，如面向全平台观众建议改用 MP4" };
  }
  if (type === "video/quicktime" || name.endsWith(".mov")) {
    return {
      ok: true,
      warning:
        "MOV 文件可能使用 HEVC/H.265 编码，部分浏览器（尤其是桌面 Chrome/Firefox）无法直接播放。" +
        "本功能不具备服务端转码能力，强烈建议上传前将视频转换为 H.264 编码的 MP4 格式，否则可能出现" +
        "「上传成功但无法播放」的情况。",
    };
  }
  return {
    ok: true,
    warning: "未能识别该视频格式是否被主流浏览器支持，强烈建议转换为 MP4（H.264）后再上传",
  };
}
