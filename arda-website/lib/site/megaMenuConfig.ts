export interface MegaMenuLink {
  label_zh: string;
  label_en: string;
  href: string;
}

export interface MegaMenuGroup {
  matchPrefix: string; // 与 navigation_items.url 匹配的前缀，如 "/about"
  columns: { heading_zh: string; heading_en: string; links: MegaMenuLink[] }[];
  featured?: "news" | "events"; // 右侧特色卡片数据来源
}

// 顶部导航精简为 8 大类（首页 / 关于我们 / 协会动态 / 协会服务 / 合作伙伴 / 捐款 / 加入协会 /
// 联系我们），「关于我们」「协会动态」「合作伙伴」配置了下拉子菜单，其余为直达链接。
export const megaMenuGroups: MegaMenuGroup[] = [
  {
    matchPrefix: "/about",
    columns: [
      {
        heading_zh: "关于我们",
        heading_en: "About Us",
        links: [
          { label_zh: "协会介绍", label_en: "Introduction", href: "/about" },
          { label_zh: "协会领导与核心成员", label_en: "Leadership & Core Members", href: "/about/leadership" },
          { label_zh: "会员制度", label_en: "Membership System", href: "/about/members" },
          { label_zh: "协会构架", label_en: "Structure", href: "/about/organization-structure" },
          { label_zh: "协会章程", label_en: "Bylaws", href: "/about/bylaws" },
        ],
      },
    ],
  },
  {
    matchPrefix: "/news",
    columns: [
      {
        heading_zh: "协会动态",
        heading_en: "Association News",
        links: [
          { label_zh: "协会新闻", label_en: "Association News", href: "/news" },
          { label_zh: "会员活动", label_en: "Member Activities", href: "/events" },
          { label_zh: "协会视频", label_en: "Videos", href: "/videos" },
          { label_zh: "协会刊物", label_en: "Publications", href: "/publications" },
        ],
      },
    ],
    featured: "news",
  },
  {
    matchPrefix: "/partners",
    columns: [
      {
        heading_zh: "合作伙伴",
        heading_en: "Partners",
        links: [
          { label_zh: "战略合作伙伴", label_en: "Strategic Partners", href: "/partners#strategic" },
          { label_zh: "企业合作伙伴", label_en: "Corporate Partners", href: "/partners#corporate" },
          { label_zh: "媒体合作伙伴", label_en: "Media Partners", href: "/partners#media" },
          { label_zh: "教育合作伙伴", label_en: "Educational Partners", href: "/partners#educational" },
          { label_zh: "政府与社区合作", label_en: "Government & Community", href: "/partners#government_community" },
        ],
      },
    ],
  },
];
