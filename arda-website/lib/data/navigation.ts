import { createClient } from "@/lib/supabase/server";
import type { NavigationItem } from "@/lib/supabase/types";
import { getDefaultNavigation } from "@/lib/site/defaultNavigation";

/**
 * 读取导航菜单。任何失败情况（Supabase 未配置、迁移/种子数据未执行、查询报错，
 * 或返回了空结果）都会回退到 lib/site/defaultNavigation.ts 中的默认导航，
 * 确保导航栏永远不会显示为空白。
 */
export async function getNavigation(menu: "header" | "footer") {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("navigation_items")
      .select("*")
      .eq("menu", menu)
      .eq("is_active", true)
      .order("sort_order");

    if (error) {
      console.error(
        "[getNavigation] Supabase 查询返回错误，将使用内置默认导航兜底。请检查 .env.local 中的 Supabase 配置是否正确、数据库迁移与种子数据是否已执行：",
        error
      );
      return getDefaultNavigation(menu);
    }

    if (!data || data.length === 0) {
      // 查询本身成功，但结果为空（例如尚未执行 seed.sql）——同样使用默认导航兜底，
      // 而不是让前台显示空白菜单。
      return getDefaultNavigation(menu);
    }

    return data as NavigationItem[];
  } catch (err) {
    console.error(
      "[getNavigation] Supabase 查询失败，将使用内置默认导航兜底。请检查 .env.local 中的 Supabase 配置是否正确、数据库迁移与种子数据是否已执行：",
      err
    );
    return getDefaultNavigation(menu);
  }
}

export async function globalSearch(q: string) {
  if (!q || q.trim().length === 0) {
    return { news: [], events: [], committees: [], chapters: [], pages: [] };
  }
  const supabase = await createClient();
  const like = `%${q}%`;

  const [news, events, committees, chapters, pages] = await Promise.all([
    supabase
      .from("news_posts")
      .select("id, slug, title_zh, title_en, excerpt_zh, excerpt_en")
      .eq("status", "published")
      .or(`title_zh.ilike.${like},title_en.ilike.${like}`)
      .limit(8),
    supabase
      .from("events")
      .select("id, slug, title_zh, title_en, start_at")
      .eq("status", "published")
      .or(`title_zh.ilike.${like},title_en.ilike.${like}`)
      .limit(8),
    supabase
      .from("committees")
      .select("id, slug, name_zh, name_en")
      .eq("status", "published")
      .or(`name_zh.ilike.${like},name_en.ilike.${like}`)
      .limit(6),
    supabase
      .from("chapters")
      .select("id, slug, name_zh, name_en")
      .eq("status", "published")
      .or(`name_zh.ilike.${like},name_en.ilike.${like}`)
      .limit(6),
    supabase
      .from("pages")
      .select("id, slug, group, title_zh, title_en")
      .eq("status", "published")
      .or(`title_zh.ilike.${like},title_en.ilike.${like}`)
      .limit(8),
  ]);

  return {
    news: news.data ?? [],
    events: events.data ?? [],
    committees: committees.data ?? [],
    chapters: chapters.data ?? [],
    pages: pages.data ?? [],
  };
}
