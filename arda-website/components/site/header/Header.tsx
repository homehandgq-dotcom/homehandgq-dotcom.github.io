import { getNavigation } from "@/lib/data/navigation";
import { getLatestNews } from "@/lib/data/news";
import { getUpcomingEvents } from "@/lib/data/events";
import { getSiteLogo } from "@/lib/data/siteSettings";
import type { Locale } from "@/lib/i18n/config";
import { HeaderClient } from "./HeaderClient";

export async function Header({ locale }: { locale: Locale }) {
  const [navItems, news, events, logoUrl] = await Promise.all([
    getNavigation("header"),
    getLatestNews(1),
    getUpcomingEvents(1),
    getSiteLogo(),
  ]);

  return (
    <HeaderClient
      locale={locale}
      navItems={navItems}
      featuredNews={news[0] ?? null}
      featuredEvent={events[0] ?? null}
      logoUrl={logoUrl}
    />
  );
}
