import { createClient } from "@/lib/supabase/server";
import type { NewsPost } from "@/lib/supabase/types";

export interface NewsCategory {
  id: string;
  slug: string;
  name_zh: string;
  name_en: string;
  sort_order: number;
}

export async function getNewsCategories(): Promise<NewsCategory[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("news_categories")
    .select("*")
    .order("sort_order");
  return data ?? [];
}

export async function listNews(params: {
  categorySlug?: string;
  q?: string;
  page?: number;
  pageSize?: number;
} = {}) {
  const { categorySlug, q, page = 1, pageSize = 9 } = params;
  const supabase = await createClient();

  // "新闻资讯"列表页：按发布时间新→旧排序，不再让"置顶"优先于发布时间——
  // 之前"置顶"排第一会导致明明有更新的新闻，列表最前面却一直是几周前设过
  // 置顶的旧新闻。"置顶"标签本身还保留展示（见 NewsCard），只是不再用它
  // 决定排序位置
  let query = supabase
    .from("news_posts")
    .select("*, news_categories(slug, name_zh, name_en)", { count: "exact" })
    .eq("status", "published")
    .order("published_at", { ascending: false });

  if (categorySlug && categorySlug !== "all") {
    const { data: cat } = await supabase
      .from("news_categories")
      .select("id")
      .eq("slug", categorySlug)
      .maybeSingle();
    if (cat) query = query.eq("category_id", cat.id);
  }

  if (q) {
    query = query.or(
      `title_zh.ilike.%${q}%,title_en.ilike.%${q}%,excerpt_zh.ilike.%${q}%,excerpt_en.ilike.%${q}%`
    );
  }

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  const { data, count } = await query.range(from, to);

  return { items: (data ?? []) as NewsPost[], total: count ?? 0, page, pageSize };
}

// 首页"最新协会新闻"板块：跟导航栏"最新新闻"预览、"新闻资讯"列表页一样，
// 统一改成只按发布时间新→旧排序，不再让"置顶"排到发布时间前面——不然设过
// 置顶的旧新闻会一直霸占首页展示位，明明有更新的新闻却看不到。"置顶"标签
// 本身还保留展示，只是不再决定排序位置
export async function getFeaturedNews(limit = 3) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("news_posts")
    .select("*")
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .limit(limit);
  return (data ?? []) as NewsPost[];
}

// 导航栏"协会动态"下拉菜单里"最新新闻"预览卡片用的也是这同一份逻辑
// （最新发布优先，不看置顶），保留这个别名是为了让调用的地方名字读起来
// 更贴切，实际查询跟 getFeaturedNews 完全一样
export const getLatestNews = getFeaturedNews;

export async function getNewsBySlug(slug: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("news_posts")
    .select("*, news_categories(slug, name_zh, name_en)")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();
  return data as (NewsPost & { news_categories: NewsCategory | null }) | null;
}

export async function getRelatedNews(currentId: string, categoryId: string | null, limit = 3) {
  const supabase = await createClient();
  let query = supabase
    .from("news_posts")
    .select("*")
    .eq("status", "published")
    .neq("id", currentId)
    .order("published_at", { ascending: false })
    .limit(limit);
  if (categoryId) query = query.eq("category_id", categoryId);
  const { data } = await query;
  return (data ?? []) as NewsPost[];
}

export async function getGalleryMedia(limit = 24) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("media_files")
    .select("*")
    .eq("file_type", "image")
    .order("created_at", { ascending: false })
    .limit(limit);
  return data ?? [];
}

export async function getVideoMedia(limit = 24) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("media_files")
    .select("*")
    .eq("file_type", "video")
    .order("created_at", { ascending: false })
    .limit(limit);
  return data ?? [];
}
