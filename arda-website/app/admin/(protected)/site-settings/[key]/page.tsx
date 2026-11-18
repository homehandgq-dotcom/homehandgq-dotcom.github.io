import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requirePermission } from "@/lib/auth/admin";
import { createClient } from "@/lib/supabase/server";
import { JsonSettingEditor } from "@/components/admin/JsonSettingEditor";

export const dynamic = "force-dynamic";

export default async function SiteSettingDetailPage({
  params,
}: {
  params: Promise<{ key: string }>;
}) {
  await requirePermission("content.publish");
  const { key } = await params;
  const settingKey = decodeURIComponent(key);

  const supabase = await createClient();
  const { data } = await supabase.from("site_settings").select("*").eq("key", settingKey).maybeSingle();
  if (!data) notFound();

  const initialJson = JSON.stringify(data.value_json, null, 2);

  return (
    <div className="space-y-6">
      <Link href="/admin/site-settings" className="flex items-center gap-1.5 text-sm font-semibold text-navy-700">
        <ArrowLeft className="h-4 w-4" aria-hidden /> 返回列表
      </Link>
      <div>
        <h1 className="text-xl font-bold text-navy-900">{settingKey}</h1>
        {data.description && <p className="mt-1 text-sm text-ink-500">{data.description}</p>}
      </div>
      <div className="rounded-lg border border-navy-100 bg-white p-6">
        <JsonSettingEditor settingKey={settingKey} initialJson={initialJson} />
      </div>
    </div>
  );
}
