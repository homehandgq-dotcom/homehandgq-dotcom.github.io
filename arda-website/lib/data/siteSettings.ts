import { createClient } from "@/lib/supabase/server";

export interface HomeStat {
  key: string;
  label_zh: string;
  label_en: string;
  value: string;
  suffix?: string;
}

const FALLBACK_STATS: HomeStat[] = [
  { key: "members", label_zh: "会员企业与个人", label_en: "Members", value: "0", suffix: "+" },
  { key: "chapters", label_zh: "地方分会", label_en: "Chapters", value: "11" },
  { key: "committees", label_zh: "专业委员会", label_en: "Committees", value: "7" },
  { key: "events", label_zh: "年度活动", label_en: "Annual Events", value: "0", suffix: "+" },
];

/** 站点设置以 key/value_json 存储，后台可编辑；此处提供带兜底值的读取封装 */
export async function getSiteSetting<T>(key: string, fallback: T): Promise<T> {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("site_settings")
      .select("value_json")
      .eq("key", key)
      .maybeSingle();
    if (!data) return fallback;
    return data.value_json as T;
  } catch (err) {
    console.error(
      `[getSiteSetting:${key}] Supabase 查询失败，将使用代码内置的兜底值。请检查 .env.local 中的 Supabase 配置是否正确、数据库迁移与种子数据是否已执行：`,
      err
    );
    return fallback;
  }
}

export async function getHomeStats(): Promise<HomeStat[]> {
  return getSiteSetting("home_stats", FALLBACK_STATS);
}

export interface ContactInfo {
  address_zh: string;
  address_en: string;
  phone: string;
  email: string;
  office_hours_zh: string;
  office_hours_en: string;
  media_email: string;
  membership_email: string;
  business_email: string;
  map_lat: number;
  map_lng: number;
  social: { platform: string; url: string }[];
}

const FALLBACK_CONTACT: ContactInfo = {
  address_zh: "美国纽约州法拉盛缅街（Main St）36-26 号 2X 室，邮编 11354",
  address_en: "36-26 Main St, Suite 2X, Flushing, NY 11354",
  phone: "+1 (000) 000-0000",
  email: "info@ardaus.org",
  office_hours_zh: "周一至周五 9:00–18:00（美东时间）",
  office_hours_en: "Mon–Fri, 9:00 AM–6:00 PM (Eastern Time)",
  media_email: "info@ardaus.org",
  membership_email: "info@ardaus.org",
  business_email: "info@ardaus.org",
  map_lat: 40.762413,
  map_lng: -73.831913,
  social: [],
};

export async function getContactInfo(): Promise<ContactInfo> {
  return getSiteSetting("contact_info", FALLBACK_CONTACT);
}

export interface MissionItem {
  title_zh: string;
  title_en: string;
  desc_zh: string;
  desc_en: string;
}

export async function getMissionItems(): Promise<MissionItem[]> {
  return getSiteSetting("home_mission", []);
}

export async function getMembershipValueItems(): Promise<MissionItem[]> {
  return getSiteSetting("home_membership_value", []);
}

export interface HeroSlide {
  kicker_zh: string;
  kicker_en: string;
  title_zh: string;
  title_en: string;
  subtitle_zh: string;
  subtitle_en: string;
  image: string;
}

/** 站点 Logo 图片地址；留空则前台显示默认的 "ARDA" 文字徽标 */
export async function getSiteLogo(): Promise<string> {
  return getSiteSetting("site_logo", "");
}

export async function getHeroSlides(): Promise<HeroSlide[]> {
  return getSiteSetting("home_hero", [
    {
      kicker_zh: "美国餐饮业发展协会",
      kicker_en: "American Restaurant Development Association",
      title_zh: "凝心聚力，链通全美餐饮产业",
      title_en: "Uniting and Empowering the U.S. Restaurant Industry",
      // 定版副标题三句分行（前台 Hero 已加 whitespace-pre-line，换行符会保留）：
      // 资源句 / 定位句（AI时代做最贴近华人圈子和中餐的餐饮协会）/ 愿景句
      subtitle_zh:
        "整合品牌、供应链、科技、资本、媒体与社区资源，服务全美餐饮从业者。\nAI时代，做最贴近华人圈子和中餐的餐饮协会。\n愿景是助力华餐发展成为主流。",
      subtitle_en:
        "Connecting brands, supply chains, technology, capital, media and community resources for restaurant professionals nationwide.\nIn the AI era, the restaurant association closest to the Chinese community and Chinese cuisine.\nOur vision is to help Chinese cuisine become mainstream.",
      image: "",
    },
  ]);
}
