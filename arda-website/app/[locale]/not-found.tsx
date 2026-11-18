import Link from "next/link";
import { headers } from "next/headers";
import { LinkButton } from "@/components/ui/Button";
import { Container } from "@/components/ui/primitives";
import { defaultLocale, isLocale, type Locale } from "@/lib/i18n/config";

export default async function LocaleNotFound() {
  const h = await headers();
  const headerLocale = h.get("x-arda-locale");
  const locale = (isLocale(headerLocale || "") ? headerLocale : defaultLocale) as Locale;

  return (
    <Container className="flex flex-col items-center justify-center py-32 text-center">
      <p className="mb-3 text-xs font-bold uppercase tracking-[0.3em] text-gold-600">ARDA</p>
      <h1 className="text-5xl font-extrabold text-navy-900">404</h1>
      <p className="mt-4 max-w-md text-ink-600">
        {locale === "zh"
          ? "抱歉，您访问的页面不存在，可能已被移动或删除。"
          : "Sorry, the page you're looking for doesn't exist or may have been moved."}
      </p>
      <div className="mt-8 flex gap-4">
        <LinkButton href={`/${locale}`}>{locale === "zh" ? "返回首页" : "Back to Home"}</LinkButton>
        <LinkButton href={`/${locale}/contact`} variant="secondary">
          {locale === "zh" ? "联系我们" : "Contact Us"}
        </LinkButton>
      </div>
      <p className="mt-10 text-sm text-ink-400">
        <Link href={`/${locale}/search`} className="underline">
          {locale === "zh" ? "或尝试站内搜索" : "Or try searching the site"}
        </Link>
      </p>
    </Container>
  );
}
