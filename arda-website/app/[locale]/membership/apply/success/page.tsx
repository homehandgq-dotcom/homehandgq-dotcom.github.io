import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { Container } from "@/components/ui/primitives";
import { LinkButton } from "@/components/ui/Button";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = (isLocale(rawLocale) ? rawLocale : "zh") as Locale;
  const dict = getDictionary(locale);
  return { title: dict.apply.successTitle, robots: { index: false } };
}

export default async function ApplySuccessPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ no?: string }>;
}) {
  const { locale: rawLocale } = await params;
  if (!isLocale(rawLocale)) notFound();
  const locale = rawLocale as Locale;
  const dict = getDictionary(locale);
  const { no } = await searchParams;

  return (
    <Container className="flex flex-col items-center py-24 text-center">
      <span className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-50 text-green-600">
        <CheckCircle2 className="h-9 w-9" aria-hidden />
      </span>
      <h1 className="text-2xl font-extrabold text-navy-900 lg:text-3xl">{dict.apply.successTitle}</h1>
      <p className="mt-3 max-w-md text-ink-600">{dict.apply.successDesc}</p>

      {no && (
        <div className="mt-8 rounded-lg border border-navy-200 bg-mist px-8 py-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-500">
            {locale === "zh" ? "申请编号" : "Application Number"}
          </p>
          <p className="mt-1 text-2xl font-extrabold tracking-wide text-navy-900">{no}</p>
        </div>
      )}

      <p className="mt-6 max-w-md text-sm text-ink-500">
        {locale === "zh"
          ? "请妥善保存您的申请编号，可用于查询审核进度。协会将通过您提供的邮箱与您联系。"
          : "Please keep your application number for status checks. Our Secretariat will contact you via the email you provided."}
      </p>

      <div className="mt-10 flex flex-wrap justify-center gap-4">
        <LinkButton href={`/${locale}/membership/status`}>
          {locale === "zh" ? "查询申请状态" : "Check Application Status"}
        </LinkButton>
        <LinkButton href={`/${locale}`} variant="secondary">
          {dict.common.home}
        </LinkButton>
      </div>
    </Container>
  );
}
