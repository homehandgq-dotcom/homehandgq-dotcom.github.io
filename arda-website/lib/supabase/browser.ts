"use client";

import { createBrowserClient } from "@supabase/ssr";

/**
 * 浏览器端 Supabase 客户端，仅用于后台管理界面的登录/登出等交互。
 * 只使用匿名公钥，同样受 RLS 约束。
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
