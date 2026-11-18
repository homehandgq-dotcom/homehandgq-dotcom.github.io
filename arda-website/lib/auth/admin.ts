import "server-only";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import type { Role } from "@/lib/supabase/types";

export interface CurrentAdmin {
  id: string;
  email: string;
  full_name: string | null;
  role: Role;
  assigned_chapter_id: string | null;
  is_active: boolean;
}

/** 获取当前登录的后台管理员资料（含角色）；未登录或非管理员返回 null */
export async function getCurrentAdmin(): Promise<CurrentAdmin | null> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const adminClient = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  );

  const { data, error } = await adminClient
    .from("admin_users")
    .select(
      "id, email, full_name, assigned_chapter_id, is_active, role:roles(*)"
    )
    .eq("id", user.id)
    .maybeSingle();

  if (error) {
    console.error("Failed to load admin profile:", error);
    return null;
  }

  if (!data || !data.is_active) return null;

  const role = Array.isArray(data.role) ? data.role[0] : data.role;
  if (!role) return null;

  return {
    id: data.id,
    email: data.email,
    full_name: data.full_name,
    role,
    assigned_chapter_id: data.assigned_chapter_id,
    is_active: data.is_active,
  };
}

/** 页面级守卫：未登录跳转登录页；已登录但缺少所需权限则跳转到 403 提示页 */
export async function requireAdmin(): Promise<CurrentAdmin> {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/admin/login");
  return admin;
}

const ROLE_PERMISSIONS: Record<Role["key"], string[]> = {
  super_admin: ["*"],
  content_admin: ["content.publish", "content.delete"],
  membership_admin: ["applications.review", "applications.export", "applications.delete"],
  chapter_admin: ["content.publish", "applications.review"],
  viewer: ["audit.read"],
};

export function roleHasPermission(roleKey: Role["key"], permission: string): boolean {
  const perms = ROLE_PERMISSIONS[roleKey] || [];
  return perms.includes("*") || perms.includes(permission);
}

export async function requirePermission(permission: string): Promise<CurrentAdmin> {
  const admin = await requireAdmin();
  if (!roleHasPermission(admin.role.key, permission)) {
    redirect("/admin?error=forbidden");
  }
  return admin;
}

/**
 * Server Action 专用权限校验：不做页面跳转，而是抛出错误供 action 捕获后
 * 返回 { ok: false } 给客户端。所有会改写数据的 Server Action 必须调用本函数，
 * 不能只依赖前端隐藏按钮。
 */
export async function assertPermission(permission: string): Promise<CurrentAdmin> {
  const admin = await getCurrentAdmin();
  if (!admin) throw new Error("UNAUTHENTICATED");
  if (!roleHasPermission(admin.role.key, permission)) throw new Error("FORBIDDEN");
  return admin;
}
