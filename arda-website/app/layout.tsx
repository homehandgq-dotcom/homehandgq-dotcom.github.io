import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "American Restaurant Development Association (ARDA)",
    template: "%s | ARDA",
  },
  description:
    "American Restaurant Development Association — 美国餐饮业发展协会",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const h = await headers();
  const locale = h.get("x-arda-locale") === "en" ? "en" : "zh";

  return (
    <html lang={locale === "zh" ? "zh-CN" : "en"} data-scroll-behavior="smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=Noto+Sans+SC:wght@400;500;600;700;900&display=swap"
          rel="stylesheet"
        />
        <style>{`
          :root {
            --font-body: 'Manrope', 'Noto Sans SC', ui-sans-serif, system-ui, sans-serif;
            --font-heading: 'Manrope', 'Noto Sans SC', ui-sans-serif, system-ui, sans-serif;
          }
        `}</style>
      </head>
      <body>{children}</body>
    </html>
  );
}
