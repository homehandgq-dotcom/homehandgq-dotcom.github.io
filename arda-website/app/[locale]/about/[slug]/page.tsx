import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { getAboutSubpage, aboutSubpages } from "@/lib/site/aboutConfig";
import { getPageBySlug } from "@/lib/data/pages";
import { listLeadershipByBody, listDepartmentsWithPeople } from "@/lib/data/leadership";
import { listCommittees } from "@/lib/data/committees";
import { listChapters } from "@/lib/data/chapters";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { PageHero } from "@/components/site/PageHero";
import { RichText } from "@/components/ui/RichText";
import { Container } from "@/components/ui/primitives";
import { PeopleGrid } from "@/components/site/PeopleGrid";
import { DepartmentsGrid } from "@/components/site/DepartmentsGrid";
import { CommitteesGrid } from "@/components/site/CommitteesGrid";
import { BranchesGrid } from "@/components/site/BranchesGrid";
import { MembersDirectory } from "@/components/site/MembersDirectory";
import { getDictionary } from "@/lib/i18n/dictionaries";

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return aboutSubpages.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale: rawLocale, slug } = await params;
  const locale = (isLocale(rawLocale) ? rawLocale : "zh") as Locale;
  const meta = getAboutSubpage(slug);
  if (!meta) return {};
  return { title: locale === "zh" ? meta.title_zh : meta.title_en };
}

export default async function AboutSubpage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale: rawLocale, slug } = await params;
  if (!isLocale(rawLocale)) notFound();
  const locale = rawLocale as Locale;
  const dict = getDictionary(locale);

  const meta = getAboutSubpage(slug);
  if (!meta) notFound();

  const title = locale === "zh" ? meta.title_zh : meta.title_en;

  let body: React.ReactNode = null;

  if (meta.kind === "content") {
    const page = await getPageBySlug("about", slug);
    const richText = <RichText html={page ? (locale === "zh" ? page.body_zh : page.body_en) : null} />;
    if (slug === "members") {
      // "协会成员"页面：除了章程整理的会员制度说明文字，应要求下面再汇总
      // 展示董事局/协会领导/执行理事会/执行管理部门/专业委员会/分支机构/
      // 顾问委员会/监事会这几个页面的人员——数据来源跟各自独立页面完全
      // 一样，只是多了这一层汇总展示，方便一次看全
      const [
        boardOfDirectors,
        leadership,
        executiveCouncil,
        { departments, people: departmentPeople },
        committees,
        chapters,
        advisoryCommittee,
        supervisoryBoard,
      ] = await Promise.all([
        listLeadershipByBody("board_of_directors"),
        listLeadershipByBody("leadership"),
        listLeadershipByBody("executive_council"),
        listDepartmentsWithPeople(),
        listCommittees(),
        listChapters(),
        listLeadershipByBody("advisory_committee"),
        listLeadershipByBody("supervisory_board"),
      ]);
      body = (
        <>
          {richText}
          <MembersDirectory
            locale={locale}
            boardOfDirectors={boardOfDirectors}
            leadership={leadership}
            executiveCouncil={executiveCouncil}
            departments={departments}
            departmentPeople={departmentPeople}
            committees={committees}
            chapters={chapters}
            advisoryCommittee={advisoryCommittee}
            supervisoryBoard={supervisoryBoard}
          />
        </>
      );
    } else {
      body = richText;
    }
  } else if (meta.kind === "org-structure") {
    // 组织架构图之前是代码里写死插一张 /images/org-chart.jpg 静态图片；现在改成
    // 直接在后台"简介"富文本编辑器里用"上传并插入图片"自己传图，图片就在正文
    // body_zh/body_en 里了，不再需要下面这行代码额外再插一张，否则会重复显示两张
    const page = await getPageBySlug("about", slug);
    body = <RichText html={page ? (locale === "zh" ? page.body_zh : page.body_en) : null} />;
  } else if (meta.kind === "people" && meta.governanceBody) {
    const people = await listLeadershipByBody(meta.governanceBody);
    body = <PeopleGrid locale={locale} people={people} />;
  } else if (meta.kind === "departments") {
    const { departments, people } = await listDepartmentsWithPeople();
    body = <DepartmentsGrid locale={locale} departments={departments} people={people} />;
  } else if (meta.kind === "committees") {
    const committees = await listCommittees();
    body = <CommitteesGrid locale={locale} committees={committees} />;
  } else if (meta.kind === "branches") {
    const chapters = await listChapters();
    body = <BranchesGrid locale={locale} chapters={chapters} />;
  }

  return (
    <>
      <Breadcrumbs locale={locale} items={[{ label: dict.nav.about, href: `/${locale}/about` }, { label: title }]} />
      <PageHero kicker="ARDA" title={title} />
      <Container className="py-14 lg:py-20">{body}</Container>
    </>
  );
}
