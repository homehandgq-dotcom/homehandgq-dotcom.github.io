import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { listMembershipTypes, listIndustries } from "@/lib/data/membership";
import { listCommittees } from "@/lib/data/committees";
import { listChapters } from "@/lib/data/chapters";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { PageHero } from "@/components/site/PageHero";
import { Container } from "@/components/ui/primitives";
import { MembershipApplicationForm } from "@/components/forms/MembershipApplicationForm";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = (isLocale(rawLocale) ? rawLocale : "zh") as Locale;
  const dict = getDictionary(locale);
  return { title: dict.apply.title };
}

export default async function MembershipApplyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  if (!isLocale(rawLocale)) notFound();
  const locale = rawLocale as Locale;
  const dict = getDictionary(locale);

  const [membershipTypes, industries, committees, chapters] = await Promise.all([
    listMembershipTypes(),
    listIndustries(),
    listCommittees(),
    listChapters(),
  ]);

  return (
    <>
      <Breadcrumbs
        locale={locale}
        items={[{ label: dict.nav.membership, href: `/${locale}/membership` }, { label: dict.apply.title }]}
      />
      <PageHero
        kicker="Membership"
        title={dict.apply.title}
        desc={
          locale === "zh"
            ? "请如实填写以下信息，协会秘书处将尽快处理您的申请。"
            : "Please complete the form below accurately. Our Secretariat will process your application promptly."
        }
      />
      <Container className="py-14 lg:py-20">
        <div className="mx-auto max-w-3xl">
          <MembershipApplicationForm
            locale={locale}
            membershipTypes={membershipTypes}
            industries={industries}
            committees={committees.map((c) => ({ id: c.id, name_zh: c.name_zh, name_en: c.name_en }))}
            chapters={chapters.map((c) => ({ id: c.id, name_zh: c.name_zh, name_en: c.name_en }))}
          />
        </div>
      </Container>
    </>
  );
}
