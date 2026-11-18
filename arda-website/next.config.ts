import type { NextConfig } from "next";

const supabaseHostname = (() => {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!url) return undefined;
    return new URL(url).hostname;
  } catch {
    return undefined;
  }
})();

const nextConfig: NextConfig = {
  async redirects() {
    // 「各界名人祝贺」升级为「协会视频」栏目后路径从 /congratulations 迁移到
    // /videos；旧链接（含此前可能已分享/打印出去的详情页链接）保留跳转，不会失效。
    return [
      { source: "/:locale(zh|en)/congratulations", destination: "/:locale/videos", permanent: true },
      { source: "/:locale(zh|en)/congratulations/:slug", destination: "/:locale/videos/:slug", permanent: true },
    ];
  },
  images: {
    remotePatterns: [
      ...(supabaseHostname
        ? [
            {
              protocol: "https" as const,
              hostname: supabaseHostname,
              pathname: "/storage/v1/object/public/**",
            },
          ]
        : []),
    ],
  },
};

export default nextConfig;
