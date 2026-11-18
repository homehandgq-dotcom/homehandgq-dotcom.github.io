import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * 服务端 Supabase 客户端（Server Components / Server Actions / Route Handlers 使用）。
 * 使用匿名公钥 + 当前用户会话 Cookie，会受 RLS 策略约束。
 * 绝不能在此文件中使用 Service Role Key。
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Server Component 内调用 setAll 会抛错（只读上下文），
            // 只要 proxy.ts 中已经做了会话刷新即可安全忽略。
          }
        },
      },
    }
  );
}
