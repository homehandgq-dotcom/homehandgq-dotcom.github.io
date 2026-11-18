import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { listFaqs } from "@/lib/data/membership";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { PageHero } from "@/components/site/PageHero";
import { Container } from "@/components/ui/primitives";
import { DonationInquiryForm } from "@/components/forms/DonationInquiryForm";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = (isLocale(rawLocale) ? rawLocale : "zh") as Locale;
  const dict = getDictionary(locale);
  return { title: dict.nav.donate };
}

export default async function DonatePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  if (!isLocale(rawLocale)) notFound();
  const locale = rawLocale as Locale;
  const dict = getDictionary(locale);
  const faqs = await listFaqs("donation");

  return (
    <>
      <Breadcrumbs locale={locale} items={[{ label: dict.nav.donate }]} />
      <PageHero
        kicker="Donate"
        title={dict.nav.donate}
        desc={
          locale === "zh"
            ? "您的支持将帮助协会更好地服务全美餐饮从业者、推动行业协作与人才培养。"
            : "Your support helps ARDA better serve restaurant professionals nationwide and advance industry collaboration and talent development."
        }
      />
      <Container className="py-14 lg:py-20">
        <div className="grid grid-cols-1 gap-14 lg:grid-cols-[1fr_400px]">
          <div className="space-y-10">
            <div>
              <h2 className="mb-3 text-lg font-bold text-navy-900">
                {locale === "zh" ? "资金用途" : "Use of Funds"}
              </h2>
              <p className="text-sm leading-relaxed text-ink-600">
                {locale === "zh"
                  ? "捐赠与赞助资金将主要用于协会日常运营、行业论坛与培训活动组织、专业委员会工作开展，以及地方分会网络建设。具体资金使用情况将由监事会监督，并按章程规定的周期向会员大会报告。"
                  : "Donations and sponsorships primarily support ARDA's day-to-day operations, industry forums and training programs, committee activities, and the development of the local chapter network. Fund usage is overseen by the Supervisory Board and reported to the General Assembly on the schedule set out in the Bylaws."}
              </p>
            </div>

            <div className="rounded-lg border border-gold-200 bg-gold-50 p-5 text-sm text-navy-900">
              {locale === "zh"
                ? "有关捐赠及税务事项，请联系协会确认。"
                : "For questions about donations and tax matters, please contact the Association to confirm."}
            </div>

            <div>
              <h2 className="mb-3 text-lg font-bold text-navy-900">
                {locale === "zh" ? "企业与活动赞助" : "Corporate & Event Sponsorship"}
              </h2>
              <p className="text-sm leading-relaxed text-ink-600">
                {locale === "zh"
                  ? "协会欢迎企业以赞助形式支持协会年度活动、论坛峰会及培训项目。请通过右侧表单与协会取得联系，秘书处将为您介绍具体的赞助方案。"
                  : "ARDA welcomes corporate sponsorship of annual events, forums and training programs. Please reach out via the form to learn more about sponsorship options."}
              </p>
            </div>

            {faqs.length > 0 && (
              <div>
                <h2 className="mb-4 text-lg font-bold text-navy-900">
                  {locale === "zh" ? "捐赠常见问题" : "Donation FAQ"}
                </h2>
                <div className="divide-y divide-navy-100 rounded-lg border border-navy-100">
                  {faqs.map((f) => (
                    <details key={f.id} className="p-5">
                      <summary className="cursor-pointer text-sm font-bold text-navy-900">
                        {locale === "zh" ? f.question_zh : f.question_en}
                      </summary>
                      <p className="mt-3 text-sm text-ink-600">
                        {locale === "zh" ? f.answer_zh : f.answer_en}
                      </p>
                    </details>
                  ))}
                </div>
              </div>
            )}

            <div>
              <h2 className="mb-3 text-lg font-bold text-navy-900">
                {locale === "zh" ? "财务透明度" : "Financial Transparency"}
              </h2>
              <p className="text-sm leading-relaxed text-ink-600">
                {locale === "zh"
                  ? "详见法律页面「财务透明度」说明。"
                  : "See the Financial Transparency legal page for details."}
              </p>
            </div>
          </div>

          <aside className="lg:sticky lg:top-24 lg:self-start">
            <DonationInquiryForm locale={locale} />
          </aside>
        </div>
      </Container>
    </>
  );
}
