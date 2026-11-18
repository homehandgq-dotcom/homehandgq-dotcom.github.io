import type { Role } from "@/lib/supabase/types";

export interface AdminNavItem {
  href: string;
  label: string;
  icon: string;
  roles?: Role["key"][]; // 未指定则全角色可见
}

export const adminNav: AdminNavItem[] = [
  { href: "/admin", label: "总览 Dashboard", icon: "LayoutDashboard" },
  {
    href: "/admin/applications",
    label: "会员申请",
    icon: "FileCheck2",
    roles: ["super_admin", "membership_admin", "chapter_admin"],
  },
  { href: "/admin/members", label: "正式会员", icon: "Users", roles: ["super_admin", "membership_admin"] },
  {
    href: "/admin/content/news",
    label: "新闻管理",
    icon: "Newspaper",
    roles: ["super_admin", "content_admin", "chapter_admin"],
  },
  {
    href: "/admin/content/events",
    label: "活动管理",
    icon: "CalendarDays",
    roles: ["super_admin", "content_admin", "chapter_admin"],
  },
  {
    href: "/admin/content/committees",
    label: "委员会管理",
    icon: "Users2",
    roles: ["super_admin", "content_admin"],
  },
  {
    href: "/admin/content/chapters",
    label: "分会管理",
    icon: "MapPin",
    roles: ["super_admin", "content_admin", "chapter_admin"],
  },
  {
    href: "/admin/content/leadership",
    label: "人员管理",
    icon: "UserCog",
    roles: ["super_admin", "content_admin"],
  },
  {
    href: "/admin/content/partners",
    label: "合作伙伴",
    icon: "Handshake",
    roles: ["super_admin", "content_admin"],
  },
  { href: "/admin/content/pages", label: "页面管理", icon: "FileText", roles: ["super_admin", "content_admin"] },
  {
    href: "/admin/content/downloads",
    label: "文件下载",
    icon: "FolderDown",
    roles: ["super_admin", "content_admin"],
  },
  {
    href: "/admin/content/navigation",
    label: "导航菜单",
    icon: "Menu",
    roles: ["super_admin", "content_admin"],
  },
  {
    href: "/admin/content/videos",
    label: "协会视频",
    icon: "Film",
    roles: ["super_admin", "content_admin"],
  },
  {
    href: "/admin/content/video_categories",
    label: "视频分类",
    icon: "Tags",
    roles: ["super_admin", "content_admin"],
  },
  {
    href: "/admin/content/publications",
    label: "协会刊物",
    icon: "BookOpen",
    roles: ["super_admin", "content_admin"],
  },
  { href: "/admin/site-settings", label: "站点设置", icon: "Settings", roles: ["super_admin", "content_admin"] },
  {
    href: "/admin/contact-submissions",
    label: "联系与咨询",
    icon: "Inbox",
    roles: ["super_admin", "membership_admin", "content_admin"],
  },
  {
    href: "/admin/donation-inquiries",
    label: "捐赠与赞助意向",
    icon: "HeartHandshake",
    roles: ["super_admin", "membership_admin"],
  },
  { href: "/admin/newsletter", label: "订阅名单", icon: "Mail", roles: ["super_admin", "content_admin"] },
  { href: "/admin/users", label: "管理员账号", icon: "ShieldCheck", roles: ["super_admin"] },
  { href: "/admin/audit-log", label: "操作日志", icon: "ScrollText", roles: ["super_admin", "viewer"] },
];

export function visibleNavItems(roleKey: Role["key"]) {
  if (roleKey === "super_admin") return adminNav;
  return adminNav.filter((item) => !item.roles || item.roles.includes(roleKey));
}
