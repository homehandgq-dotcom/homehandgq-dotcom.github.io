import { createClient } from "@/lib/supabase/server";
import type { Committee, LeadershipPerson } from "@/lib/supabase/types";

export async function listCommittees() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("committees")
    .select("*, convener:leadership_people!committees_convener_person_id_fkey(name_zh,name_en,title_zh,title_en,avatar_url,is_tba)")
    .eq("status", "published")
    .order("sort_order");
  return (data ?? []) as (Committee & { convener: Partial<LeadershipPerson> | null })[];
}

export async function getCommitteeBySlug(slug: string) {
  const supabase = await createClient();
  const { data: committee } = await supabase
    .from("committees")
    .select("*, convener:leadership_people!committees_convener_person_id_fkey(*)")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  if (!committee) return null;

  // 委员名单：在"人员管理"后台把某个人（或企业代表）的"所属委员会"选成这个
  // 委员会即可，跟召集人是同一套 leadership_people 记录、同一套后台操作方式
  const { data: members } = await supabase
    .from("leadership_people")
    .select("*")
    .eq("committee_id", committee.id)
    .eq("is_public", true)
    .order("sort_order");

  // 委员会关联活动：只取明确挂在这个委员会下的活动（events.committee_id），
  // 不再取全站活动——之前是"取全站最新发布的活动"充数，跟这个委员会毫无关系。
  // 要让某场活动显示在这里，去后台"活动"编辑那场活动，"所属委员会"选这个
  // 委员会即可
  const { data: events } = await supabase
    .from("events")
    .select("id, slug, category, title_zh, title_en, start_at, timezone, location_zh, location_en, cover_image, event_status")
    .eq("status", "published")
    .eq("committee_id", committee.id)
    .order("start_at", { ascending: false })
    .limit(3);

  return { committee, members: (members ?? []) as LeadershipPerson[], events: events ?? [] };
}
