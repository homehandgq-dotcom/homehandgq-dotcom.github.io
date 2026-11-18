import Link from "next/link";
import { PeopleGrid } from "@/components/site/PeopleGrid";
import { DepartmentsGrid } from "@/components/site/DepartmentsGrid";
import { CommitteesGrid } from "@/components/site/CommitteesGrid";
import { BranchesGrid } from "@/components/site/BranchesGrid";
import type { Locale } from "@/lib/i18n/config";
import type { Chapter, Committee, Department, LeadershipPerson } from "@/lib/supabase/types";

/**
 * 「关于我们 → 协会成员」页面：应要求在原有的会员制度说明文字下面，追加一个
 * "组织人员一览"区块，把董事局、协会领导、执行理事会、执行管理部门、专业
 * 委员会、分支机构、顾问委员会、监事会这几个页面的人员汇总展示在一个页面
 * 上，方便一次性浏览。每个人员数据仍然来自各自原本的查询（跟对应的独立
 * 页面同一份数据源，不重复维护），这里只是多一层汇总展示；每个分组标题
 * 旁边都有"查看详情"链接，点进去是原来的完整独立页面。
 */
export function MembersDirectory({
  locale,
  boardOfDirectors,
  leadership,
  executiveCouncil,
  departments,
  departmentPeople,
  committees,
  chapters,
  advisoryCommittee,
  supervisoryBoard,
}: {
  locale: Locale;
  boardOfDirectors: LeadershipPerson[];
  leadership: LeadershipPerson[];
  executiveCouncil: LeadershipPerson[];
  departments: Department[];
  departmentPeople: LeadershipPerson[];
  committees: (Committee & { convener: Partial<LeadershipPerson> | null })[];
  chapters: (Chapter & { leader: Partial<LeadershipPerson> | null })[];
  advisoryCommittee: LeadershipPerson[];
  supervisoryBoard: LeadershipPerson[];
}) {
  const sections: { title_zh: string; title_en: string; href: string; content: React.ReactNode }[] = [
    {
      title_zh: "董事局",
      title_en: "Board of Directors",
      href: `/${locale}/about/board-of-directors`,
      content: <PeopleGrid locale={locale} people={boardOfDirectors} />,
    },
    {
      title_zh: "协会领导与核心成员",
      title_en: "Leadership & Core Members",
      href: `/${locale}/about/leadership`,
      content: <PeopleGrid locale={locale} people={leadership} />,
    },
    {
      title_zh: "执行理事会",
      title_en: "Executive Council",
      href: `/${locale}/about/executive-council`,
      content: <PeopleGrid locale={locale} people={executiveCouncil} />,
    },
    {
      title_zh: "执行管理部门",
      title_en: "Executive Management Department",
      href: `/${locale}/about/secretariat`,
      content: <DepartmentsGrid locale={locale} departments={departments} people={departmentPeople} />,
    },
    {
      title_zh: "专业委员会",
      title_en: "Committees",
      href: `/${locale}/about/committees`,
      content: <CommitteesGrid locale={locale} committees={committees} />,
    },
    {
      title_zh: "分支机构",
      title_en: "Branches",
      href: `/${locale}/about/branches`,
      content: <BranchesGrid locale={locale} chapters={chapters} />,
    },
    {
      title_zh: "顾问委员会",
      title_en: "Advisory Committee",
      href: `/${locale}/about/advisory-committee`,
      content: <PeopleGrid locale={locale} people={advisoryCommittee} />,
    },
    {
      title_zh: "监事会",
      title_en: "Supervisory Board",
      href: `/${locale}/about/supervisory-board`,
      content: <PeopleGrid locale={locale} people={supervisoryBoard} />,
    },
  ];

  return (
    <div className="mt-16 space-y-16 border-t border-navy-100 pt-14">
      <div>
        <h2 className="text-2xl font-bold text-navy-900">
          {locale === "zh" ? "组织人员一览" : "Leadership & Organization Directory"}
        </h2>
        <p className="mt-2 text-sm text-ink-500">
          {locale === "zh"
            ? "以下按治理机构汇总协会各层级人员，点击标题旁的“查看详情”可进入该机构的完整介绍页。"
            : "Association leadership grouped by governing body. Select “View” beside a heading for the full page."}
        </p>
      </div>
      {sections.map((s) => (
        <div key={s.href}>
          <div className="mb-5 flex flex-wrap items-baseline justify-between gap-2">
            <h3 className="text-lg font-bold text-navy-900">{locale === "zh" ? s.title_zh : s.title_en}</h3>
            <Link href={s.href} className="shrink-0 text-sm font-semibold text-navy-700 hover:text-navy-900">
              {locale === "zh" ? "查看详情 →" : "View →"}
            </Link>
          </div>
          {s.content}
        </div>
      ))}
    </div>
  );
}
