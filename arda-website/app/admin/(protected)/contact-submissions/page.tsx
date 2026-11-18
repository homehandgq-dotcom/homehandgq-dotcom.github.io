import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/admin";
import { createClient } from "@/lib/supabase/server";
import { ContactSubmissionsInbox, type ContactRow } from "@/components/admin/ContactSubmissionsInbox";

export const dynamic = "force-dynamic";

export default async function ContactSubmissionsPage() {
  const admin = await requireAdmin();
  if (!["super_admin", "membership_admin", "content_admin"].includes(admin.role.key)) {
    redirect("/admin?error=forbidden");
  }

  // 临时诊断：数据库查询失败时不让整个页面崩溃变成"无法加载"的空白页，而是把
  // 具体错误信息显示在页面上，方便直接截图反馈定位问题。
  // 另外，"公司/分会"这一列不再用 PostgREST 的外键关联嵌套查询
  // （原来是 "*, chapters(name_zh)"）——这种写法依赖数据库里 chapter_id 这个
  // 外键关系被接口层正确识别，之前"导航菜单"就是因为同样原因整页报错、
  // 显示为空，这里直接改成查完主表后再单独查一次分会名称，在代码里拼出这一列。
  let data: (Omit<ContactRow, "chapters"> & { chapter_id: string | null })[] | null = null;
  let count: number | null = null;
  let queryErrorMessage: string | null = null;
  try {
    const supabase = await createClient();
    const res = await supabase
      .from("contact_submissions")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .limit(100);
    if (res.error) throw res.error;
    data = res.data;
    count = res.count;
  } catch (err) {
    queryErrorMessage =
      err && typeof err === "object" && "message" in err
        ? [
            (err as { message?: string }).message,
            (err as { details?: string }).details,
            (err as { hint?: string }).hint,
          ]
            .filter(Boolean)
            .join(" | ")
        : err instanceof Error
          ? err.message
          : "未知错误";
  }

  let rows = (data ?? []) as unknown as ContactRow[];
  const chapterIds = Array.from(new Set(rows.map((r) => r.chapter_id).filter((v): v is string => Boolean(v))));
  if (chapterIds.length > 0) {
    const supabase = await createClient();
    const { data: chapterRows } = await supabase.from("chapters").select("id, name_zh").in("id", chapterIds);
    const nameById = new Map((chapterRows ?? []).map((c) => [c.id as string, c.name_zh as string]));
    rows = rows.map((r) => ({
      ...r,
      chapters: r.chapter_id && nameById.has(r.chapter_id) ? { name_zh: nameById.get(r.chapter_id)! } : null,
    }));
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-navy-900">联系与咨询</h1>
        <p className="mt-1 text-sm text-ink-500">共 {count ?? rows.length} 条记录（显示最近 100 条）</p>
      </div>

      {queryErrorMessage && (
        <div className="rounded-lg border border-red-300 bg-red-50 p-4 text-sm text-red-800">
          <p className="font-bold">数据查询失败（这就是列表显示为空的原因）：</p>
          <p className="mt-1 break-all font-mono text-xs">{queryErrorMessage}</p>
        </div>
      )}

      <ContactSubmissionsInbox rows={rows} canDelete={admin.role.key === "super_admin"} />
    </div>
  );
}
