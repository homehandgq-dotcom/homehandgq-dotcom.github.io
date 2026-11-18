import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { locales, defaultLocale, type Locale } from "@/lib/i18n/config";

const LOCALE_COOKIE = "arda_locale";
const PUBLIC_FILE = /\.(.*)$/;

function getPreferredLocale(request: NextRequest): Locale {
  const cookieLocale = request.cookies.get(LOCALE_COOKIE)?.value;
  if (cookieLocale && (locales as readonly string[]).includes(cookieLocale)) {
    return cookieLocale as Locale;
  }
  const header = request.headers.get("accept-language") || "";
  if (header.toLowerCase().startsWith("en")) return "en";
  return defaultLocale;
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 静态资源、API 路由、Next 内部资源、根级系统文件放行
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname === "/favicon.ico" ||
    pathname === "/sitemap.xml" ||
    pathname === "/robots.txt" ||
    PUBLIC_FILE.test(pathname)
  ) {
    return NextResponse.next();
  }

  // ---------- 后台管理系统：会话刷新 + 乐观登录检查 ----------
  if (pathname.startsWith("/admin")) {
    let response = NextResponse.next({ request: { headers: request.headers } });

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) =>
              request.cookies.set(name, value)
            );
            response = NextResponse.next({ request: { headers: request.headers } });
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options)
            );
          },
        },
      }
    );

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const normalizedPathname =
  pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;

const isLoginPage = normalizedPathname === "/admin/login";

    if (!user && !isLoginPage) {
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("next", normalizedPathname);
      return NextResponse.redirect(loginUrl);
    }

    if (user && isLoginPage) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }

    // 细粒度角色权限校验在各 Server Action / 页面内使用 service role 再次核实，
    // 这里只做"是否已登录"的乐观检查，避免未登录用户直接看到后台界面。
    return response;
  }

  // ---------- 前台：中英文路由 ----------
  const pathnameLocale = locales.find(
    (l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`)
  );

  if (pathnameLocale) {
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-arda-locale", pathnameLocale);
    const res = NextResponse.next({ request: { headers: requestHeaders } });
    res.cookies.set(LOCALE_COOKIE, pathnameLocale, {
      maxAge: 60 * 60 * 24 * 365,
      path: "/",
    });
    return res;
  }

  const preferred = getPreferredLocale(request);
  const url = request.nextUrl.clone();
  url.pathname = `/${preferred}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
