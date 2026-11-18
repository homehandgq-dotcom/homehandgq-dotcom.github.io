import { requireAdmin } from "@/lib/auth/admin";
import { visibleNavItems } from "@/lib/admin/nav";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminTopbar } from "@/components/admin/AdminTopbar";

export default async function AdminProtectedLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();
  const items = visibleNavItems(admin.role.key);

  return (
    <div className="flex min-h-screen bg-mist">
      <aside className="hidden w-64 shrink-0 bg-navy-900 lg:block">
        <div className="flex h-16 items-center gap-3 border-b border-white/10 px-5">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-xs font-bold text-gold-300">
            ARDA
          </span>
          <span className="text-sm font-bold text-white">管理后台</span>
        </div>
        <AdminSidebar items={items} />
      </aside>
      <div className="flex min-h-screen flex-1 flex-col">
        <AdminTopbar name={admin.full_name || admin.email} roleLabel={admin.role.name_zh} />
        <main className="flex-1 p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
