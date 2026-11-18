import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requirePermission } from "@/lib/auth/admin";
import { getEntityConfig } from "@/lib/admin/entityRegistry";
import { loadRelationOptions } from "@/lib/admin/entityOptions";
import { EntityForm } from "@/components/admin/EntityForm";

export const dynamic = "force-dynamic";

export default async function EntityNewPage({ params }: { params: Promise<{ entity: string }> }) {
  const admin = await requirePermission("content.publish");
  const { entity } = await params;
  const config = getEntityConfig(entity);
  if (!config) notFound();
  if (!config.allowedRoles.includes(admin.role.key)) redirect("/admin?error=forbidden");
  if (config.key === "chapters" && admin.role.key === "chapter_admin") {
    // 分会管理员不可新建分会，只能编辑本人所属分会
    redirect(`/admin/content/chapters`);
  }

  const relationOptions = await loadRelationOptions(config.relations);

  return (
    <div className="space-y-6">
      <Link href={`/admin/content/${entity}`} className="flex items-center gap-1.5 text-sm font-semibold text-navy-700">
        <ArrowLeft className="h-4 w-4" aria-hidden /> 返回列表
      </Link>
      <h1 className="text-xl font-bold text-navy-900">新建{config.labelZh}</h1>
      <div className="rounded-lg border border-navy-100 bg-white p-6">
        <EntityForm config={config} id={null} initialValues={{}} relationOptions={relationOptions} />
      </div>
    </div>
  );
}
