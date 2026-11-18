import { createClient } from "@/lib/supabase/server";
import { getSignedUrls } from "@/lib/storage/signedUrl";
import type { Publication, PublicationCategory } from "@/lib/supabase/types";

export const PUBLICATIONS_BUCKET = "publications";

// PDF 阅读链接有效期放宽到 2 小时（翻书阅读耗时可能较长，避免中途失效）；
// 封面图同祝福视频一样，有效期放宽以减少重复签发。
const PDF_TTL_SECONDS = 60 * 60 * 2;
const COVER_TTL_SECONDS = 60 * 60 * 6;

export interface PublicationWithUrls extends Publication {
  pdfUrl: string | null;
  coverUrl: string | null;
}

async function attachUrls(rows: Publication[]): Promise<PublicationWithUrls[]> {
  if (rows.length === 0) return [];
  const pdfPaths = rows.map((r) => r.pdf_path);
  const coverPaths = rows.map((r) => r.cover_path).filter((p): p is string => Boolean(p));
  const [pdfMap, coverMap] = await Promise.all([
    getSignedUrls(PUBLICATIONS_BUCKET, pdfPaths, PDF_TTL_SECONDS),
    getSignedUrls(PUBLICATIONS_BUCKET, coverPaths, COVER_TTL_SECONDS),
  ]);
  return rows.map((r) => ({
    ...r,
    pdfUrl: pdfMap[r.pdf_path] ?? null,
    coverUrl: r.cover_path ? coverMap[r.cover_path] ?? null : null,
  }));
}

export const PUBLICATION_CATEGORIES: { value: PublicationCategory; label_zh: string; label_en: string }[] = [
  { value: "handbook", label_zh: "协会手册", label_en: "Handbooks" },
  { value: "journal", label_zh: "会刊", label_en: "Journals" },
  { value: "magazine", label_zh: "杂志", label_en: "Magazines" },
  { value: "other", label_zh: "其他资料", label_en: "Other" },
];

/** 首页专区：管理员推荐的已发布刊物 */
export async function getFeaturedPublications(limit = 4): Promise<PublicationWithUrls[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("publications")
      .select("*")
      .eq("status", "published")
      .eq("is_featured_home", true)
      .order("sort_order", { ascending: true })
      .order("publish_date", { ascending: false })
      .limit(limit);
    if (error) throw error;
    return attachUrls((data ?? []) as Publication[]);
  } catch (err) {
    console.error("[getFeaturedPublications] Supabase 查询失败，首页专区将自动隐藏：", err);
    return [];
  }
}

/** 列表页：按分类筛选 + 分页 */
export async function listPublications(
  params: { category?: string; page?: number; pageSize?: number } = {}
): Promise<{ items: PublicationWithUrls[]; total: number; page: number; pageSize: number }> {
  const { category, page = 1, pageSize = 12 } = params;
  try {
    const supabase = await createClient();
    let query = supabase.from("publications").select("*", { count: "exact" }).eq("status", "published");
    if (category && category !== "all") {
      query = query.eq("category", category);
    }
    query = query.order("sort_order", { ascending: true }).order("publish_date", { ascending: false });

    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    const { data, count, error } = await query.range(from, to);
    if (error) throw error;
    const items = await attachUrls((data ?? []) as Publication[]);
    return { items, total: count ?? 0, page, pageSize };
  } catch (err) {
    console.error("[listPublications] Supabase 查询失败：", err);
    return { items: [], total: 0, page, pageSize };
  }
}

/** 详情/阅读页（永久链接，基于 slug；替换 PDF 后 slug 不变） */
export async function getPublicationBySlug(slug: string): Promise<PublicationWithUrls | null> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("publications")
      .select("*")
      .eq("slug", slug)
      .eq("status", "published")
      .maybeSingle();
    if (error) throw error;
    if (!data) return null;
    const [withUrl] = await attachUrls([data as Publication]);
    return withUrl ?? null;
  } catch (err) {
    console.error(`[getPublicationBySlug:${slug}] Supabase 查询失败：`, err);
    return null;
  }
}
