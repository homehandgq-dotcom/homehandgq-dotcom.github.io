import "server-only";

/**
 * 极简进程内限流器（按 IP + 表单类型）。
 *
 * 生产环境提示：Vercel 是多实例无状态部署，进程内 Map 不会跨实例共享，
 * 仅能提供"尽力而为"的基础防护。若需要严格限流，请接入 Upstash Redis /
 * Vercel KV，把下方 `hits` 换成对应的 incr + expire 调用即可，函数签名不变。
 */
const hits = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(
  key: string,
  { limit = 5, windowMs = 60_000 }: { limit?: number; windowMs?: number } = {}
): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const entry = hits.get(key);

  if (!entry || entry.resetAt < now) {
    hits.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1 };
  }

  if (entry.count >= limit) {
    return { allowed: false, remaining: 0 };
  }

  entry.count += 1;
  return { allowed: true, remaining: limit - entry.count };
}

// 定期清理，避免 Map 无限增长（长驻进程场景）
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of hits.entries()) {
      if (entry.resetAt < now) hits.delete(key);
    }
  }, 5 * 60_000).unref?.();
}

/**
 * CAPTCHA 校验预留接口。当前未配置 CAPTCHA_SECRET_KEY 时直接放行，
 * 接入 hCaptcha / Cloudflare Turnstile 后取消注释并实现真实校验逻辑。
 */
export async function verifyCaptcha(_token?: string): Promise<boolean> {
  if (!process.env.CAPTCHA_SECRET_KEY) return true;
  // const res = await fetch("https://hcaptcha.com/siteverify", { method: "POST", ... });
  // const data = await res.json();
  // return data.success === true;
  return true;
}
