import { createClient } from "@/lib/supabase/server";
import { getSignedUrls } from "@/lib/storage/signedUrl";
import type { Video, VideoCategory } from "@/lib/supabase/types";

export const VIDEOS_BUCKET = "videos";

// 视频播放链接有效期：够用户看完一整段视频；封面图签发有效期长一些，
// 减少同一次页面渲染里对同一张封面重复签发的次数。
const VIDEO_TTL_SECONDS = 60 * 60;
const COVER_TTL_SECONDS = 60 * 60 * 6;

export interface VideoCategoryRef {
  name_zh: string;
  name_en: string;
  slug: string;
}

type VideoRow = Video & { category?: VideoCategoryRef | VideoCategoryRef[] | null };

export interface VideoWithUrls extends Video {
  videoUrl: string | null;
  coverUrl: string | null;
  category: VideoCategoryRef | null;
}

function normalizeCategory(raw: VideoCategoryRef | VideoCategoryRef[] | null | undefined): VideoCategoryRef | null {
  if (!raw) return null;
  return Array.isArray(raw) ? raw[0] ?? null : raw;
}

async function attachUrls(rows: VideoRow[]): Promise<VideoWithUrls[]> {
  if (rows.length === 0) return [];
  const videoPaths = rows.map((r) => r.video_path);
  const coverPaths = rows.map((r) => r.cover_path).filter((p): p is string => Boolean(p));
  const [videoMap, coverMap] = await Promise.all([
    getSignedUrls(VIDEOS_BUCKET, videoPaths, VIDEO_TTL_SECONDS),
    getSignedUrls(VIDEOS_BUCKET, coverPaths, COVER_TTL_SECONDS),
  ]);
  return rows.map((r) => ({
    ...r,
    videoUrl: videoMap[r.video_path] ?? null,
    coverUrl: r.cover_path ? coverMap[r.cover_path] ?? null : null,
    category: normalizeCategory(r.category),
  }));
}

const SELECT_WITH_CATEGORY = "*, category:video_categories(name_zh,name_en,slug)";

/** 首页「ARDA 视界」专区：最多 N 条管理员勾选「首页推荐」的已发布视频，可来自不同分类 */
export async function getFeaturedVideos(limit = 6): Promise<VideoWithUrls[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("videos")
      .select(SELECT_WITH_CATEGORY)
      .eq("status", "published")
      .eq("is_featured_home", true)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false })
      .limit(limit);
    if (error) throw error;
    return attachUrls((data ?? []) as unknown as VideoRow[]);
  } catch (err) {
    console.error("[getFeaturedVideos] Supabase 查询失败，首页专区将自动隐藏：", err);
    return [];
  }
}

/** 全部视频列表页：支持按分类 slug 筛选（"all" 或留空 = 全部）+ 分页 */
export async function listVideos(
  params: { category?: string; page?: number; pageSize?: number } = {}
): Promise<{ items: VideoWithUrls[]; total: number; page: number; pageSize: number }> {
  const { category, page = 1, pageSize = 9 } = params;
  try {
    const supabase = await createClient();
    // 用 !inner 让分类筛选可以直接作用在关联表的 slug 列上；videos.category_id 恒为
    // not null，所以把关联类型从默认的左连接改成内连接不会漏掉任何正常数据。
    let query = supabase
      .from("videos")
      .select("*, category:video_categories!inner(name_zh,name_en,slug)", { count: "exact" })
      .eq("status", "published");
    if (category && category !== "all") {
      query = query.eq("category.slug", category);
    }
    query = query.order("sort_order", { ascending: true }).order("created_at", { ascending: false });

    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    const { data, count, error } = await query.range(from, to);
    if (error) throw error;
    const items = await attachUrls((data ?? []) as unknown as VideoRow[]);
    return { items, total: count ?? 0, page, pageSize };
  } catch (err) {
    console.error("[listVideos] Supabase 查询失败：", err);
    return { items: [], total: 0, page, pageSize };
  }
}

/** 详情页（永久分享链接，基于 slug）。未发布/不存在均返回 null，不泄露草稿是否存在。 */
export async function getVideoBySlug(slug: string): Promise<VideoWithUrls | null> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("videos")
      .select(SELECT_WITH_CATEGORY)
      .eq("slug", slug)
      .eq("status", "published")
      .maybeSingle();
    if (error) throw error;
    if (!data) return null;
    const [withUrl] = await attachUrls([data as unknown as VideoRow]);
    return withUrl ?? null;
  } catch (err) {
    console.error(`[getVideoBySlug:${slug}] Supabase 查询失败：`, err);
    return null;
  }
}

export interface VideoCategoryWithCount extends VideoCategory {
  count: number;
}

/**
 * 列表页分类筛选用：返回全部分类及各分类下「已发布」视频的数量。
 * 前台渲染筛选项时按 count > 0 过滤——分类下没有任何已发布视频时不显示对应筛选项。
 */
export async function listVideoCategoriesWithCounts(): Promise<VideoCategoryWithCount[]> {
  try {
    const supabase = await createClient();
    const [{ data: categories, error: catError }, { data: videoRows, error: videoError }] = await Promise.all([
      supabase.from("video_categories").select("*").order("sort_order", { ascending: true }),
      supabase.from("videos").select("category_id").eq("status", "published"),
    ]);
    if (catError) throw catError;
    if (videoError) throw videoError;

    const counts = new Map<string, number>();
    for (const row of (videoRows ?? []) as { category_id: string }[]) {
      counts.set(row.category_id, (counts.get(row.category_id) ?? 0) + 1);
    }
    return ((categories ?? []) as VideoCategory[]).map((c) => ({ ...c, count: counts.get(c.id) ?? 0 }));
  } catch (err) {
    console.error("[listVideoCategoriesWithCounts] Supabase 查询失败：", err);
    return [];
  }
}
