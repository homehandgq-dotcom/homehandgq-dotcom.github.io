import type { GovernanceBody } from "@/lib/supabase/types";

export interface AboutSubpageMeta {
  slug: string;
  title_zh: string;
  title_en: string;
  governanceBody?: GovernanceBody;
  kind: "content" | "people" | "org-structure" | "departments" | "committees" | "branches";
}

export const aboutSubpages: AboutSubpageMeta[] = [
  { slug: "mission-vision", title_zh: "使命与愿景", title_en: "Mission & Vision", kind: "content" },
  { slug: "history", title_zh: "发展历程", title_en: "History & Milestones", kind: "content" },
  { slug: "members", title_zh: "会员制度", title_en: "Membership System", kind: "content" },
  {
    slug: "board-of-directors",
    title_zh: "董事局",
    title_en: "Board of Directors",
    governanceBody: "board_of_directors",
    kind: "people",
  },
  {
    slug: "leadership",
    title_zh: "协会领导与核心成员",
    title_en: "Leadership & Core Members",
    governanceBody: "leadership",
    kind: "people",
  },
  {
    slug: "executive-council",
    title_zh: "执行理事会",
    title_en: "Executive Council",
    governanceBody: "executive_council",
    kind: "people",
  },
  {
    slug: "secretariat",
    title_zh: "执行管理部门",
    title_en: "Executive Management Department",
    kind: "departments",
  },
  {
    slug: "committees",
    title_zh: "专业委员会",
    title_en: "Committees",
    kind: "committees",
  },
  {
    slug: "branches",
    title_zh: "分支机构",
    title_en: "Branches",
    kind: "branches",
  },
  {
    slug: "advisory-committee",
    title_zh: "顾问委员会",
    title_en: "Advisory Committee",
    governanceBody: "advisory_committee",
    kind: "people",
  },
  {
    slug: "supervisory-board",
    title_zh: "监事会",
    title_en: "Supervisory Board",
    governanceBody: "supervisory_board",
    kind: "people",
  },
  {
    slug: "organization-structure",
    title_zh: "协会构架",
    title_en: "Association Structure",
    kind: "org-structure",
  },
  { slug: "bylaws", title_zh: "协会章程", title_en: "Bylaws", kind: "content" },
  { slug: "governance", title_zh: "治理与透明度", title_en: "Transparency & Governance", kind: "content" },
];

export function getAboutSubpage(slug: string) {
  return aboutSubpages.find((p) => p.slug === slug);
}
