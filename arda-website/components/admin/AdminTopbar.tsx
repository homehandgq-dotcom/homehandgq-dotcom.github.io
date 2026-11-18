"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/browser";

export function AdminTopbar({ name, roleLabel }: { name: string; roleLabel: string }) {
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <header className="flex h-16 items-center justify-between border-b border-navy-100 bg-white px-6">
      <p className="text-sm font-semibold text-navy-900">ARDA 后台管理系统</p>
      <div className="flex items-center gap-4">
        <div className="text-right text-xs">
          <p className="font-semibold text-navy-900">{name}</p>
          <p className="text-ink-500">{roleLabel}</p>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center gap-1.5 rounded border border-navy-200 px-3 py-1.5 text-xs font-semibold text-navy-800 hover:bg-navy-50"
        >
          <LogOut className="h-3.5 w-3.5" aria-hidden />
          退出登录
        </button>
      </div>
    </header>
  );
}
