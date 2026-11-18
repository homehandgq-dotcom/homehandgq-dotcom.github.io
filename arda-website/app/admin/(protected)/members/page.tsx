import Link from "next/link";
import { requirePermission } from "@/lib/auth/admin";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/primitives";

export const dynamic = "force-dynamic";

const STATUS_LABEL: Record<string, string> = { active: "生效中", inactive: "已停用", expired: "已过期" };
const STATUS_TONE: Record<string, "green" | "neutral" | "red"> = { active: "green", inactive: "neutral", expired: "red" };

export default async function MembersPage() {
  await requirePermission("applications.review");
  const supabase = await createClient();
  const { data, count } = await supabase
    .from("members")
    .select("*, membership_types(name_zh)", { count: "exact" })
    .order("member_since", { ascending: false })
    .limit(200);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-navy-900">正式会员</h1>
        <p className="mt-1 text-sm text-ink-500">
          共 {count ?? (data ?? []).length} 位正式会员 · 由已批准的入会申请转入，默认不公开展示
        </p>
      </div>

      <div className="overflow-x-auto rounded-lg border border-navy-100 bg-white">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead className="border-b border-navy-100 bg-mist text-xs font-semibold uppercase text-ink-500">
            <tr>
              <th className="px-3 py-3">会员</th>
              <th className="px-3 py-3">公司</th>
              <th className="px-3 py-3">会员类型</th>
              <th className="px-3 py-3">州/城市</th>
              <th className="px-3 py-3">入会时间</th>
              <th className="px-3 py-3">对外公开</th>
              <th className="px-3 py-3">状态</th>
              <th className="px-3 py-3">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-navy-100">
            {(data ?? []).map((m) => (
              <tr key={m.id} className="hover:bg-mist/60">
                <td className="whitespace-nowrap px-3 py-3 font-medium text-navy-900">{m.display_name_zh}</td>
                <td className="whitespace-nowrap px-3 py-3 text-ink-600">{m.company_name_zh || "—"}</td>
                <td className="whitespace-nowrap px-3 py-3 text-ink-600">{m.membership_types?.name_zh || "—"}</td>
                <td className="whitespace-nowrap px-3 py-3 text-ink-600">
                  {m.state} / {m.city}
                </td>
                <td className="whitespace-nowrap px-3 py-3 text-ink-600">
                  {new Date(m.member_since).toLocaleDateString("zh-CN")}
                </td>
                <td className="whitespace-nowrap px-3 py-3">
                  <Badge tone={m.is_public ? "gold" : "neutral"}>{m.is_public ? "公开" : "不公开"}</Badge>
                </td>
                <td className="whitespace-nowrap px-3 py-3">
                  <Badge tone={STATUS_TONE[m.status]}>{STATUS_LABEL[m.status]}</Badge>
                </td>
                <td className="whitespace-nowrap px-3 py-3">
                  <Link href={`/admin/members/${m.id}`} className="font-semibold text-navy-700 hover:underline">
                    编辑
                  </Link>
                </td>
              </tr>
            ))}
            {(data ?? []).length === 0 && (
              <tr>
                <td colSpan={8} className="px-3 py-12 text-center text-sm text-ink-400">
                  暂无正式会员，请先在「会员申请」中批准申请并转为正式会员
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
