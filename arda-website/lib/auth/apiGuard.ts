import "server-only";
import { NextResponse } from "next/server";
import { getCurrentAdmin, roleHasPermission, type CurrentAdmin } from "@/lib/auth/admin";

type Guard =
  | { ok: true; admin: CurrentAdmin }
  | { ok: false; response: NextResponse };

/** Route Handler 专用权限校验：未登录 401，权限不足 403，均不泄露具体原因细节 */
export async function requirePermissionApi(permission: string): Promise<Guard> {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return { ok: false, response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }
  if (!roleHasPermission(admin.role.key, permission)) {
    return { ok: false, response: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }
  return { ok: true, admin };
}
