import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/admin";
import { createClient } from "@/lib/supabase/server";
import { UsersManager } from "@/components/admin/UsersManager";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const admin = await requireAdmin();
  if (admin.role.key !== "super_admin") redirect("/admin?error=forbidden");

  const supabase = await createClient();
  const [{ data: users }, { data: chapters }] = await Promise.all([
    supabase
      .from("admin_users")
      .select("id, email, full_name, is_active, last_login_at, assigned_chapter_id, roles(key)")
      .order("created_at", { ascending: true }),
    supabase.from("chapters").select("id, name_zh").order("sort_order"),
  ]);

  const rows = (users ?? []).map((u) => ({
    id: u.id,
    email: u.email,
    full_name: u.full_name,
    is_active: u.is_active,
    last_login_at: u.last_login_at,
    assigned_chapter_id: u.assigned_chapter_id,
    role_key: (Array.isArray(u.roles) ? u.roles[0]?.key : (u.roles as { key: string } | null)?.key) || "viewer",
  }));

  const chapterOptions = (chapters ?? []).map((c) => ({ value: c.id, label: c.name_zh }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-navy-900">管理员账号</h1>
        <p className="mt-1 text-sm text-ink-500">
          共 {rows.length} 个后台账号 · 出于安全考虑，账号不可硬删除，请使用「停用」代替
        </p>
      </div>
      <UsersManager users={rows} chapters={chapterOptions} currentAdminId={admin.id} />
    </div>
  );
}
