import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requirePermission } from "@/lib/auth/admin";
import { getEntityConfig } from "@/lib/admin/entityRegistry";
import { loadRelationOptions } from "@/lib/admin/entityOptions";
import { createClient } from "@/lib/supabase/server";
import { EntityForm } from "@/components/admin/EntityForm";

export const dynamic = "force-dynamic";

export default async function EntityEditPage({
  params,
}: {
  params: Promise<{ entity: string; id: string }>;
}) {
  const admin = await requirePermission("content.publish");
  const { entity, id } = await params;
  const config = getEntityConfig(entity);
  if (!config) notFound();
  if (!config.allowedRoles.includes(admin.role.key)) redirect("/admin?error=forbidden");
  if (config.key === "chapters" && admin.role.key === "chapter_admin" && admin.assigned_chapter_id !== id) {
    redirect(`/admin/content/chapters`);
  }

  const supabase = await createClient();
  const [{ data: record }, relationOptions] = await Promise.all([
    supabase.from(config.table).select("*").eq("id", id).maybeSingle(),
    loadRelationOptions(config.relations),
  ]);

  if (!record) notFound();

  const titleZh = (record as Record<string, unknown>)[`${config.titleField}_zh`] as string | undefined;

  return (
    <div className="space-y-6">
      <Link href={`/admin/content/${entity}`} className="flex items-center gap-1.5 text-sm font-semibold text-navy-700">
        <ArrowLeft className="h-4 w-4" aria-hidden /> 返回列表
      </Link>
      <h1 className="text-xl font-bold text-navy-900">
        编辑{config.labelZh}
        {titleZh ? `：${titleZh}` : ""}
      </h1>
      <div className="rounded-lg border border-navy-100 bg-white p-6">
        <EntityForm config={config} id={id} initialValues={record as Record<string, unknown>} relationOptions={relationOptions} />
      </div>
    </div>
  );
}
