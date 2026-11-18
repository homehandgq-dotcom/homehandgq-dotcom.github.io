import type { MetadataRoute } from "next";
import { createClient } from "@supabase/supabase-js";
import { locales } from "@/lib/i18n/config";

const STATIC_PATHS = [
  "",
  "/about",
  "/about/mission-vision",
  "/about/history",
  "/about/leadership",
  "/about/board-of-directors",
  "/about/executive-council",
  "/about/advisory-committee",
  "/about/supervisory-board",
  "/about/organization-structure",
  "/about/bylaws",
  "/about/governance",
  "/news",
  "/news/gallery",
  "/news/videos",
  "/events",
  "/services",
  "/committees",
  "/chapters",
  "/chapters/alliances",
  "/chapters/international-partners",
  "/chapters/global-network",
  "/membership",
  "/membership/types",
  "/membership/benefits",
  "/membership/apply",
  "/membership/directory",
  "/membership/faq",
  "/membership/status",
  "/partners",
  "/videos",
  "/publications",
  "/donate",
  "/resources",
  "/contact",
];

function publicClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const entries: MetadataRoute.Sitemap = [];

  for (const path of STATIC_PATHS) {
    for (const locale of locales) {
      entries.push({ url: `${base}/${locale}${path}`, changeFrequency: "weekly", priority: path === "" ? 1 : 0.6 });
    }
  }

  const supabase = publicClient();
  if (supabase) {
    try {
      const [{ data: news }, { data: events }, { data: committees }, { data: chapters }, { data: pages }, { data: videos }, { data: publications }] =
        await Promise.all([
          supabase.from("news_posts").select("slug, updated_at").eq("status", "published"),
          supabase.from("events").select("slug").eq("status", "published"),
          supabase.from("committees").select("slug").eq("status", "published"),
          supabase.from("chapters").select("slug").eq("status", "published"),
          supabase.from("pages").select("slug, group").eq("status", "published"),
          supabase.from("videos").select("slug").eq("status", "published"),
          supabase.from("publications").select("slug").eq("status", "published"),
        ]);

      for (const locale of locales) {
        news?.forEach((n) => entries.push({ url: `${base}/${locale}/news/${n.slug}`, priority: 0.5 }));
        events?.forEach((e) => entries.push({ url: `${base}/${locale}/events/${e.slug}`, priority: 0.5 }));
        committees?.forEach((c) => entries.push({ url: `${base}/${locale}/committees/${c.slug}`, priority: 0.5 }));
        chapters?.forEach((c) => entries.push({ url: `${base}/${locale}/chapters/${c.slug}`, priority: 0.5 }));
        pages?.forEach((p) => {
          if (p.group === "legal") entries.push({ url: `${base}/${locale}/legal/${p.slug}`, priority: 0.3 });
          if (p.group === "services") entries.push({ url: `${base}/${locale}/services/${p.slug}`, priority: 0.5 });
        });
        videos?.forEach((v) => entries.push({ url: `${base}/${locale}/videos/${v.slug}`, priority: 0.4 }));
        publications?.forEach((p) => entries.push({ url: `${base}/${locale}/publications/${p.slug}`, priority: 0.4 }));
      }
    } catch {
      // 数据库不可用时（如构建期尚未配置 Supabase）仅返回静态路径，不阻断构建
    }
  }

  return entries;
}
