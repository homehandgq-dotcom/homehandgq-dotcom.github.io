"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X, Search, ChevronDown } from "lucide-react";
import type { Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { megaMenuGroups } from "@/lib/site/megaMenuConfig";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { cn } from "@/lib/utils/cn";
import type { NavigationItem, NewsPost, EventItem } from "@/lib/supabase/types";

export function HeaderClient({
  locale,
  navItems,
  featuredNews,
  featuredEvent,
  logoUrl,
}: {
  locale: Locale;
  navItems: NavigationItem[];
  featuredNews: NewsPost | null;
  featuredEvent: EventItem | null;
  logoUrl?: string;
}) {
  const dict = getDictionary(locale);
  const pathname = usePathname() || "";
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [openKey, setOpenKey] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");

  // 横排导航必须始终完整显示、不回退汉堡菜单，因此断点用 Playwright 实测校准到
  // "刚好不重叠"的最小宽度（每语言分别测，含少量安全余量）。未上传 Logo 时用的
  // 占位图标+两行文字比真实 Logo 图片更宽，所以额外提供一组更保守的断点，
  // 确保后台还没上传 Logo 时也不会出现重叠。
  // 断点必须写成完整字面量才能被 Tailwind 的静态扫描识别，不能用变量拼接类名，
  // 因此这里按语言 × 是否已上传 Logo 枚举出全部四种组合。
  const navFlexClass =
    locale === "zh"
      ? logoUrl
        ? "min-[1200px]:flex"
        : "min-[1300px]:flex"
      : logoUrl
        ? "min-[1900px]:flex"
        : "min-[2000px]:flex";
  const navHiddenClass =
    locale === "zh"
      ? logoUrl
        ? "min-[1200px]:hidden"
        : "min-[1300px]:hidden"
      : logoUrl
        ? "min-[1900px]:hidden"
        : "min-[2000px]:hidden";
  const navRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpenKey(null);
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setOpenKey(null);
      }
    }
    document.addEventListener("click", onClickOutside);
    return () => document.removeEventListener("click", onClickOutside);
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpenKey(null);
        setSearchOpen(false);
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const items = navItems.length > 0 ? navItems : [];

  function localePath(url: string) {
    return `/${locale}${url === "/" ? "" : url}`;
  }

  function submitSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    router.push(`/${locale}/search?q=${encodeURIComponent(query.trim())}`);
    setSearchOpen(false);
  }

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full border-b transition-[background-color,box-shadow,border-color] duration-300",
        scrolled ? "header-glass border-navy-100 shadow-sm" : "border-transparent bg-white/95 backdrop-blur"
      )}
    >
      <a href="#main-content" className="skip-link">
        {locale === "zh" ? "跳至主要内容" : "Skip to main content"}
      </a>

      {/* 左侧内边距跟随首页 Hero 所用 .container-arda 的居中公式增长（基础 1.5rem，
          lg 起 4rem，xl 起 calc(50vw-576px)），让 Logo 在常见桌面宽度下与 Hero
          "凝心聚力"标题的左边缘对齐；但这次改为用 clamp 封顶在 240px ——
          横排导航菜单必须在任何宽度下都完整显示、不回退汉堡菜单，
          若不封顶，在很宽的显示器上会占用过多空间导致导航放不下。
          封顶后超宽屏对齐会有少量误差，属于"大致对齐"，用宽度换取导航始终可用。
          右侧内边距保持原样（不再跟随对称公式增长），确保导航区域空间稳定。
          Header 高度随断点递增（lg/xl 起更高），为放大后的 Logo 留出上下呼吸空间。 */}
      <div className="mx-auto flex h-16 w-full items-center justify-between gap-4 py-3 pl-6 pr-6 sm:h-[72px] lg:h-20 lg:pl-16 lg:pr-10 xl:pl-[clamp(4rem,calc(50vw_-_576px),240px)]">
        <Link href={`/${locale}`} className="flex shrink-0 items-center gap-3">
          {logoUrl ? (
            // 已上传的完整 Logo 图片本身已包含中英文协会名称，右侧不再重复展示品牌文字，
            // 保持原始比例（object-contain，不拉伸不裁切）；改为以宽度为基准放大
            // （桌面端 xl 起约 280px），高度用 max-h 兜底、h-auto 自适应，避免变形或裁切
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={logoUrl}
              alt={dict.brand.fullName}
              className="h-auto max-h-10 w-[130px] object-contain sm:max-h-12 sm:w-[170px] lg:max-h-14 lg:w-[240px] xl:max-h-16 xl:w-[280px]"
            />
          ) : (
            <>
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-navy-900 text-sm font-bold text-gold-300">
                ARDA
              </span>
              <span className="hidden flex-col leading-tight sm:flex">
                <span className="text-sm font-bold text-navy-900">{dict.brand.fullName}</span>
                <span className="text-[11px] uppercase tracking-wide text-ink-400">
                  {locale === "zh" ? "American Restaurant Development Association" : "美国餐饮业发展协会"}
                </span>
              </span>
            </>
          )}
        </Link>

        {/* 内联导航显示的断点按语言区分。左侧内边距现在精确跟随 .container-arda 的公式增长，
            且 Logo 本身也加宽到桌面端约 280px，两者都会占用原本留给导航的横向空间；
            因此这两个断点相应上调（并用 Playwright 实测最后一个导航项与右侧图标区域的
            实际像素间距校准，确保断点以上永远不会重叠/换行），窄于阈值一律回退到汉堡菜单。 */}
        <div
          ref={navRef}
          className={cn(
            "relative hidden min-w-0 flex-1 items-center justify-center",
            navFlexClass
          )}
        >
          <nav className="flex min-w-0 items-center gap-0.5 xl:gap-1" aria-label="Primary">
            {items.map((item) => {
              const group = megaMenuGroups.find((g) => item.url.startsWith(g.matchPrefix));
              const key = item.id;
              const isOpen = openKey === key;
              return (
                <div key={key} className="relative shrink-0">
                  <button
                    type="button"
                    className={cn(
                      "nav-underline flex shrink-0 items-center gap-1 whitespace-nowrap rounded px-2.5 py-2 text-sm font-semibold text-navy-800 hover:bg-navy-50 xl:px-3",
                      isOpen && "bg-navy-50"
                    )}
                    data-active={isOpen}
                    aria-expanded={isOpen}
                    onClick={() => {
                      if (group) {
                        setOpenKey(isOpen ? null : key);
                      } else {
                        router.push(localePath(item.url));
                      }
                    }}
                  >
                    {locale === "zh" ? item.label_zh : item.label_en}
                    {group && (
                      <ChevronDown
                        className={cn("h-3.5 w-3.5 transition-transform", isOpen && "rotate-180")}
                        aria-hidden
                      />
                    )}
                  </button>

                  {group && isOpen && (
                    <div className="fixed inset-x-0 top-20 z-40 border-b border-navy-100 bg-white shadow-lg">
                      {/* 列数随 group.columns 数量自适应（不再固定 4 列），
                          精简后的导航（关于我们 1 列 / 协会动态 1 列 + 特色卡）不会出现空白列 */}
                      <div className="container-arda flex flex-wrap gap-10 py-8">
                        {group.columns.map((col, i) => (
                          <div key={i} className="w-full sm:w-56">
                            {col.heading_zh.trim() && (
                              <p className="mb-3 text-xs font-bold uppercase tracking-wide text-gold-600">
                                {locale === "zh" ? col.heading_zh : col.heading_en}
                              </p>
                            )}
                            <ul className="space-y-2">
                              {col.links.map((link) => (
                                <li key={link.href}>
                                  <Link
                                    href={`/${locale}${link.href}`}
                                    className="text-sm text-ink-900 hover:text-navy-700 hover:underline"
                                  >
                                    {locale === "zh" ? link.label_zh : link.label_en}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                        {group.featured === "news" && featuredNews && (
                          <FeaturedCard
                            locale={locale}
                            eyebrow={locale === "zh" ? "最新新闻" : "Latest News"}
                            title={locale === "zh" ? featuredNews.title_zh : featuredNews.title_en}
                            href={`/${locale}/news/${featuredNews.slug}`}
                          />
                        )}
                        {group.featured === "events" && featuredEvent && (
                          <FeaturedCard
                            locale={locale}
                            eyebrow={locale === "zh" ? "即将举行" : "Upcoming Event"}
                            title={locale === "zh" ? featuredEvent.title_zh : featuredEvent.title_en}
                            href={`/${locale}/events/${featuredEvent.slug}`}
                          />
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label={dict.nav.search}
            className="rounded p-2 text-navy-800 hover:bg-navy-50"
            onClick={() => setSearchOpen((v) => !v)}
          >
            <Search className="h-5 w-5" />
          </button>
          <div className="hidden md:block">
            <LanguageSwitcher locale={locale} />
          </div>
          <Link
            href={`/${locale}/membership/apply`}
            className="hidden rounded bg-navy-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-navy-800 md:inline-flex"
          >
            {dict.nav.applyNow}
          </Link>
          <button
            type="button"
            aria-label="Menu"
            className={cn(
              "rounded p-2 text-navy-900 hover:bg-navy-50",
              navHiddenClass
            )}
            onClick={() => setMobileOpen((v) => !v)}
          >
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {searchOpen && (
        <div className="border-t border-navy-100 bg-mist py-4">
          <form onSubmit={submitSearch} className="container-arda flex gap-2">
            <input
              autoFocus
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={locale === "zh" ? "搜索新闻、活动、委员会…" : "Search news, events, committees…"}
              className="h-11 flex-1 rounded border border-navy-200 px-4 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold-400"
            />
            <button
              type="submit"
              className="rounded bg-navy-900 px-5 text-sm font-semibold text-white hover:bg-navy-800"
            >
              {dict.common.search}
            </button>
          </form>
        </div>
      )}

      {mobileOpen && (
        <div
          className={cn(
            "max-h-[80vh] overflow-y-auto border-t border-navy-100 bg-white",
            navHiddenClass
          )}
        >
          <nav className="container-arda flex flex-col gap-1 py-4">
            {items.map((item) => (
              <Link
                key={item.id}
                href={localePath(item.url)}
                className="rounded px-3 py-3 text-sm font-semibold text-navy-900 hover:bg-navy-50"
              >
                {locale === "zh" ? item.label_zh : item.label_en}
              </Link>
            ))}
            <div className="mt-3 flex items-center justify-between border-t border-navy-100 pt-4">
              <LanguageSwitcher locale={locale} />
              <Link
                href={`/${locale}/membership/apply`}
                className="rounded bg-navy-900 px-4 py-2.5 text-sm font-semibold text-white"
              >
                {dict.nav.applyNow}
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}

function FeaturedCard({
  locale,
  eyebrow,
  title,
  href,
}: {
  locale: Locale;
  eyebrow: string;
  title: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="flex w-full flex-col justify-between rounded-lg bg-navy-900 p-5 text-white transition-colors hover:bg-navy-800 sm:w-72"
    >
      <div>
        <p className="text-xs font-bold uppercase tracking-wide text-gold-300">{eyebrow}</p>
        <p className="mt-2 text-sm font-semibold leading-snug">{title}</p>
      </div>
      <span className="mt-4 text-xs font-semibold text-gold-300">
        {locale === "zh" ? "查看详情 →" : "Learn more →"}
      </span>
    </Link>
  );
}
