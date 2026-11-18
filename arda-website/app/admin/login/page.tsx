"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/browser";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/admin";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (signInError) {
      setError("邮箱或密码错误，或该账号尚未开通后台权限。");
      return;
    }
    router.push(next);
    router.refresh();
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-navy-900 px-6">
      <div className="w-full max-w-sm rounded-lg bg-white p-8 shadow-xl">
        <div className="mb-8 text-center">
          <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-navy-900 text-sm font-bold text-gold-300">
            ARDA
          </span>
          <h1 className="text-lg font-bold text-navy-900">后台管理系统登录</h1>
          <p className="mt-1 text-xs text-ink-500">American Restaurant Development Association</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold text-navy-900">邮箱</span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input"
              autoComplete="username"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold text-navy-900">密码</span>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input"
              autoComplete="current-password"
            />
          </label>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded bg-navy-900 py-3 text-sm font-bold text-white hover:bg-navy-800 disabled:opacity-60"
          >
            {loading ? "登录中…" : "登录"}
          </button>
        </form>
        <p className="mt-6 text-center text-xs text-ink-400">
          仅限协会授权管理员使用。账号由超级管理员在 Supabase 中创建并关联角色。
        </p>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
