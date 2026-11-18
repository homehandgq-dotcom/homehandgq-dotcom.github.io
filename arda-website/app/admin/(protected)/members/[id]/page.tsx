import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requirePermission, roleHasPermission } from "@/lib/auth/admin";
import { createClient } from "@/lib/supabase/server";
import { loadRelationOptions } from "@/lib/admin/entityOptions";
import { MemberEditForm } from "@/components/admin/MemberEditForm";

export const dynamic = "force-dynamic";

export default async function MemberDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const admin = await requirePermission("applications.review");
  const { id } = await params;

  const supabase = await createClient();
  const [{ data: member }, relationOptions] = await Promise.all([
    supabase.from("members").select("*").eq("id", id).maybeSingle(),
    loadRelationOptions(["membership_types", "industries"]),
  ]);
  if (!member) notFound();

  return (
    <div className="space-y-6">
      <Link href="/admin/members" className="flex items-center gap-1.5 text-sm font-semibold text-navy-700">
        <ArrowLeft className="h-4 w-4" aria-hidden /> 返回列表
      </Link>
      <h1 className="text-xl font-bold text-navy-900">编辑会员：{member.display_name_zh}</h1>

      <MemberEditForm
        initial={{
          id: member.id,
          membership_type_id: member.membership_type_id,
          display_name_zh: member.display_name_zh || "",
          display_name_en: member.display_name_en || "",
          company_name_zh: member.company_name_zh || "",
          company_name_en: member.company_name_en || "",
          logo_url: member.logo_url || "",
          city: member.city || "",
          state: member.state || "",
          industry_id: member.industry_id || "",
          website: member.website || "",
          is_public: member.is_public,
          status: member.status,
        }}
        membershipTypes={relationOptions.membership_types ?? []}
        industries={relationOptions.industries ?? []}
        canDelete={roleHasPermission(admin.role.key, "applications.delete")}
      />
    </div>
  );
}
