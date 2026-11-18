import { notFound } from "next/navigation";
import { isLocale, locales, type Locale } from "@/lib/i18n/config";
import { Header } from "@/components/site/header/Header";
import { Footer } from "@/components/site/footer/Footer";
import { PageTransition } from "@/components/motion/PageTransition";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  if (!isLocale(rawLocale)) notFound();
  const locale = rawLocale as Locale;

  return (
    <div className="flex min-h-screen flex-col">
      <Header locale={locale} />
      <main id="main-content" className="flex-1">
        <PageTransition>{children}</PageTransition>
      </main>
      <Footer locale={locale} />
    </div>
  );
}
