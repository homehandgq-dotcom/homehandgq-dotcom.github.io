import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * 私有 Storage Bucket 的签名 URL 工具（用于 videos / publications 两个私有桶）。
 *
 * 安全边界：
 * 1. 必须使用 Service Role（见 lib/supabase/admin.ts）才能对私有桶签发 URL —— 这两个桶
 *    没有配置任何匿名/公开 select 策略，普通匿名或已登录用户的 anon-key 客户端无法读取。
 * 2. "是否允许签发" 完全由调用方保证：
 *    - 前台公开页面：只应在确认 `status === 'published'` 的记录上调用（lib/data/videos.ts
 *      与 lib/data/publications.ts 的查询条件已经过滤了 status，不会传入草稿记录）。
 *    - 后台预览草稿：调用前必须先经过 requirePermission('content.publish') / assertPermission(...)。
 * 3. 返回的 URL 有效期较短且不可预测（带签名 token），不会被当作永久直链滥用；
 *    页面每次渲染都会重新签发，不缓存在数据库里。
 */

const DEFAULT_TTL_SECONDS = 60 * 60; // 1 小时

export async function getSignedUrl(
  bucket: string,
  path: string | null | undefined,
  expiresInSeconds = DEFAULT_TTL_SECONDS
): Promise<string | null> {
  if (!path) return null;
  try {
    const admin = createAdminClient();
    const { data, error } = await admin.storage.from(bucket).createSignedUrl(path, expiresInSeconds);
    if (error || !data) {
      console.error(`[getSignedUrl] ${bucket}/${path}`, error);
      return null;
    }
    return data.signedUrl;
  } catch (err) {
    console.error(`[getSignedUrl] ${bucket}/${path}`, err);
    return null;
  }
}

/** 批量签发（列表页/卡片网格场景），减少逐条请求的往返次数 */
export async function getSignedUrls(
  bucket: string,
  paths: string[],
  expiresInSeconds = DEFAULT_TTL_SECONDS
): Promise<Record<string, string | null>> {
  const uniquePaths = Array.from(new Set(paths.filter(Boolean)));
  if (uniquePaths.length === 0) return {};
  try {
    const admin = createAdminClient();
    const { data, error } = await admin.storage
      .from(bucket)
      .createSignedUrls(uniquePaths, expiresInSeconds);
    if (error || !data) {
      console.error(`[getSignedUrls] ${bucket}`, error);
      return {};
    }
    const map: Record<string, string | null> = {};
    for (const item of data) {
      if (item.path) map[item.path] = item.error ? null : item.signedUrl ?? null;
    }
    return map;
  } catch (err) {
    console.error(`[getSignedUrls] ${bucket}`, err);
    return {};
  }
}

/** 删除存储对象（用于记录删除、PDF/视频替换后清理旧文件）。失败仅记录日志，不抛出。 */
export async function removeStorageObject(bucket: string, path: string | null | undefined): Promise<void> {
  if (!path) return;
  try {
    const admin = createAdminClient();
    const { error } = await admin.storage.from(bucket).remove([path]);
    if (error) console.error(`[removeStorageObject] ${bucket}/${path}`, error);
  } catch (err) {
    console.error(`[removeStorageObject] ${bucket}/${path}`, err);
  }
}
