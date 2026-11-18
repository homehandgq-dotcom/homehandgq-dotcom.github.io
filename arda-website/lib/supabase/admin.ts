import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * 特权客户端：使用 Service Role Key，绕过 RLS。
 *
 * 安全边界（务必遵守）：
 * 1. 本文件带有 `import "server-only"`，一旦被 Client Component 意外导入会在构建时报错。
 * 2. 只允许在 Server Actions / Route Handlers 内、且已经完成"角色与权限校验"之后调用。
 * 3. 绝不能把本模块返回的数据未经过滤地透传给前台公开 API 或页面
 *    （例如 member_applications 的手机号、邮箱、备注等敏感字段）。
 * 4. Service Role Key 只存在于服务端环境变量 `SUPABASE_SERVICE_ROLE_KEY`，
 *    没有 `NEXT_PUBLIC_` 前缀，永远不会被打进浏览器 bundle。
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      "Supabase Service Role 未配置：请在环境变量中设置 SUPABASE_SERVICE_ROLE_KEY。"
    );
  }

  return createSupabaseClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
