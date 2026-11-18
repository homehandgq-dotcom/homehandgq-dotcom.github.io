import { createClient } from "@/lib/supabase/server";
import type { Chapter, LeadershipPerson } from "@/lib/supabase/types";

export async function listChapters(regionType?: Chapter["region_type"]) {
  const supabase = await createClient();
  let query = supabase
    .from("chapters")
    .select("*, leader:leadership_people!chapters_leader_person_id_fkey(name_zh,name_en,title_zh,title_en,avatar_url,is_tba)")
    .eq("status", "published")
    .order("sort_order");
  if (regionType) query = query.eq("region_type", regionType);
  const { data } = await query;
  return (data ?? []) as (Chapter & { leader: Partial<LeadershipPerson> | null })[];
}

export async function getChapterBySlug(slug: string) {
  const supabase = await createClient();
  const { data: chapter, error: chapterError } = await supabase
    .from("chapters")
    .select("*, leader:leadership_people!chapters_leader_person_id_fkey(*)")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  // 临时诊断：查询本身出错（比如外键约束名不匹配、字段不存在等）时，
  // 把错误信息一并返回，页面上会直接显示出来，方便定位问题原因，
  // 问题解决后可以把这段和页面上的报错展示一起去掉
  if (chapterError) {
    console.error(`[getChapterBySlug:${slug}] Supabase 查询出错：`, chapterError);
    return {
      chapter: null,
      memberCount: 0,
      officers: [],
      news: [],
      events: [],
      error: [chapterError.message, chapterError.details, chapterError.hint].filter(Boolean).join(" | "),
    };
  }

  if (!chapter) {
    // 临时诊断：查询没报错，但是没找到匹配的行——最常见的原因是这条分会记录
    // 在后台里 slug 拼写不一致，或者状态不是"已发布"。这里额外查一次不带
    // status 过滤的结果，直接告诉页面到底是哪种情况，不用来回猜
    const { data: anyStatusRow } = await supabase
      .from("chapters")
      .select("slug, status")
      .eq("slug", slug)
      .maybeSingle();
    const reason = !anyStatusRow
      ? `数据库里没有 slug = "${slug}" 的分会记录（可能是这条记录的 slug 跟链接里的不一致，或者根本没有这条记录）`
      : `找到了 slug = "${slug}" 的记录，但它的状态是 "${anyStatusRow.status}"，不是 "published"（已发布），所以前台不显示。去后台把这条分会的状态改成"已发布"即可`;
    console.error(`[getChapterBySlug:${slug}] 未找到已发布记录：`, reason);
    return {
      chapter: null,
      memberCount: 0,
      officers: [],
      news: [],
      events: [],
      error: reason,
    };
  }

  const { count: memberCount, error: memberError } = await supabase
    .from("chapter_members")
    .select("*", { count: "exact", head: true })
    .eq("chapter_id", chapter.id);

  // 分会组织架构（会长及其他负责人）：在"人员管理"后台把某个人的"所属分会"
  // 选成这个分会即可，跟部门负责人用的是同一套机制（leadership_people.chapter_id）
  const { data: officers, error: officersError } = await supabase
    .from("leadership_people")
    .select("*")
    .eq("chapter_id", chapter.id)
    .eq("is_public", true)
    .order("sort_order");

  // 分会新闻：只取明确挂在这个分会下的新闻（news_posts.chapter_id），不再像
  // 之前那样直接把全站最新新闻拿来充数——那样会导致分会页面显示的其实是
  // 总会新闻，跟这个分会毫无关系。要让某条新闻显示在这里，去后台"新闻资讯"
  // 编辑那条新闻，"所属分会"选这个分会即可
  const { data: news, error: newsError } = await supabase
    .from("news_posts")
    .select("id, slug, title_zh, title_en, excerpt_zh, excerpt_en, is_pinned, published_at, cover_image")
    .eq("status", "published")
    .eq("chapter_id", chapter.id)
    .order("published_at", { ascending: false })
    .limit(3);

  // 分会活动：同理，只取明确挂在这个分会下的活动（events.chapter_id），
  // 不再取全站活动——去后台"活动"编辑对应活动，"所属分会"选这个分会即可。
  // （EventCard 组件需要 category / location_zh / location_en / timezone
  // 这几个字段渲染分类徽章、地点、时区，之前 select 漏选导致页面直接崩溃，
  // 这里已经一并补全）
  const { data: events, error: eventsError } = await supabase
    .from("events")
    .select("id, slug, category, title_zh, title_en, start_at, timezone, location_zh, location_en, cover_image, event_status")
    .eq("status", "published")
    .eq("chapter_id", chapter.id)
    .order("start_at", { ascending: false })
    .limit(3);

  const secondaryError = [memberError, officersError, newsError, eventsError]
    .filter(Boolean)
    .map((e) => e!.message)
    .join(" | ") || undefined;
  if (secondaryError) {
    console.error(`[getChapterBySlug:${slug}] 附属查询出错（不影响主体内容展示）：`, secondaryError);
  }

  return {
    chapter,
    memberCount: chapter.member_count_override ?? memberCount ?? 0,
    officers: (officers ?? []) as LeadershipPerson[],
    news: news ?? [],
    events: events ?? [],
    error: secondaryError,
  };
}
