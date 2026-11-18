// 默认导航兜底数据。
//
// 与 supabase/seed.sql 中 navigation_items 的种子数据保持一致（header 7 项精简主导航 /
// footer 10 项）。当 Supabase 查询失败、尚未执行迁移与种子数据，或返回空结果时，
// lib/data/navigation.ts 会使用本文件的数据渲染导航——保证前台导航栏「不会再次出现空白」。
//
// 顶部导航结构依用户提供的导航结构图精简为 8 大类：首页 / 关于我们 / 协会动态 /
// 协会服务 / 合作伙伴 / 捐款 / 加入协会 / 联系我们；其中「关于我们」「协会动态」
// 「合作伙伴」在 lib/site/megaMenuConfig.ts 中配置了下拉子菜单。「关于我们」下拉菜单
// 「协会介绍」下面新增了「协会领导」一项（链接到 /about/leadership，展示协会全部
// 领导层人员），点开「关于我们」就能直接看到人。专业委员会、
// 分会与全球网络、资源中心等页面仍然存在，经由页脚导航与站内链接保持可访问，不会成为孤页。
//
// 注意：若后续在后台「导航管理」中调整了线上导航结构，建议同步更新本文件，
// 使兜底状态与真实运营状态尽量一致（但即使不同步，也只在 Supabase 不可用时才会显示本文件内容）。

import type { NavigationItem } from "@/lib/supabase/types";

export const DEFAULT_HEADER_NAV: NavigationItem[] = [
  { id: "default-header-1", menu: "header", parent_id: null, label_zh: "首页", label_en: "Homepage", url: "/", mega_menu_group: null, sort_order: 1, is_active: true, opens_new_tab: false },
  { id: "default-header-2", menu: "header", parent_id: null, label_zh: "关于我们", label_en: "About Us", url: "/about", mega_menu_group: null, sort_order: 2, is_active: true, opens_new_tab: false },
  { id: "default-header-3", menu: "header", parent_id: null, label_zh: "协会动态", label_en: "Association News", url: "/news", mega_menu_group: null, sort_order: 3, is_active: true, opens_new_tab: false },
  { id: "default-header-4", menu: "header", parent_id: null, label_zh: "协会服务", label_en: "Association Services", url: "/services", mega_menu_group: null, sort_order: 4, is_active: true, opens_new_tab: false },
  { id: "default-header-5", menu: "header", parent_id: null, label_zh: "合作伙伴", label_en: "Partners", url: "/partners", mega_menu_group: null, sort_order: 5, is_active: true, opens_new_tab: false },
  { id: "default-header-6", menu: "header", parent_id: null, label_zh: "捐款", label_en: "Donation", url: "/donate", mega_menu_group: null, sort_order: 6, is_active: true, opens_new_tab: false },
  { id: "default-header-7", menu: "header", parent_id: null, label_zh: "加入协会", label_en: "Join Association", url: "/membership", mega_menu_group: null, sort_order: 7, is_active: true, opens_new_tab: false },
  { id: "default-header-8", menu: "header", parent_id: null, label_zh: "联系我们", label_en: "Contact Us", url: "/contact", mega_menu_group: null, sort_order: 8, is_active: true, opens_new_tab: false },
];

export const DEFAULT_FOOTER_NAV: NavigationItem[] = [
  { id: "default-footer-1", menu: "footer", parent_id: null, label_zh: "关于协会", label_en: "About", url: "/about", mega_menu_group: null, sort_order: 1, is_active: true, opens_new_tab: false },
  { id: "default-footer-2", menu: "footer", parent_id: null, label_zh: "协会动态", label_en: "Association News", url: "/news", mega_menu_group: null, sort_order: 2, is_active: true, opens_new_tab: false },
  { id: "default-footer-3", menu: "footer", parent_id: null, label_zh: "项目与活动", label_en: "Programs & Events", url: "/events", mega_menu_group: null, sort_order: 3, is_active: true, opens_new_tab: false },
  { id: "default-footer-4", menu: "footer", parent_id: null, label_zh: "专业委员会", label_en: "Committees", url: "/committees", mega_menu_group: null, sort_order: 4, is_active: true, opens_new_tab: false },
  { id: "default-footer-5", menu: "footer", parent_id: null, label_zh: "分会与全球网络", label_en: "Chapters & Global Network", url: "/chapters", mega_menu_group: null, sort_order: 5, is_active: true, opens_new_tab: false },
  { id: "default-footer-6", menu: "footer", parent_id: null, label_zh: "合作伙伴", label_en: "Partners", url: "/partners", mega_menu_group: null, sort_order: 6, is_active: true, opens_new_tab: false },
  { id: "default-footer-7", menu: "footer", parent_id: null, label_zh: "会员中心", label_en: "Membership", url: "/membership", mega_menu_group: null, sort_order: 7, is_active: true, opens_new_tab: false },
  { id: "default-footer-8", menu: "footer", parent_id: null, label_zh: "资源中心", label_en: "Resources", url: "/resources", mega_menu_group: null, sort_order: 8, is_active: true, opens_new_tab: false },
  { id: "default-footer-9", menu: "footer", parent_id: null, label_zh: "协会刊物", label_en: "Publications", url: "/publications", mega_menu_group: null, sort_order: 9, is_active: true, opens_new_tab: false },
  { id: "default-footer-10", menu: "footer", parent_id: null, label_zh: "捐款支持", label_en: "Donation", url: "/donate", mega_menu_group: null, sort_order: 10, is_active: true, opens_new_tab: false },
  { id: "default-footer-11", menu: "footer", parent_id: null, label_zh: "联系我们", label_en: "Contact Us", url: "/contact", mega_menu_group: null, sort_order: 11, is_active: true, opens_new_tab: false },
];

export function getDefaultNavigation(menu: "header" | "footer"): NavigationItem[] {
  return menu === "header" ? DEFAULT_HEADER_NAV : DEFAULT_FOOTER_NAV;
}
