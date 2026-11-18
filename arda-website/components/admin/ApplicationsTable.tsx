"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { bulkUpdateApplicationStatus, deleteApplication } from "@/lib/actions/admin-applications";
import type { ApplicationStatus } from "@/lib/supabase/types";
import { Badge } from "@/components/ui/primitives";

const statusLabel: Record<ApplicationStatus, string> = {
  draft: "草稿", submitted: "已提交", under_review: "审核中",
  more_info_required: "需补充信息", approved: "已批准", rejected: "未通过", archived: "已归档",
};
const statusTone: Record<ApplicationStatus, "green" | "gold" | "neutral" | "red"> = {
  draft: "neutral", submitted: "gold", under_review: "gold",
  more_info_required: "gold", approved: "green", rejected: "red", archived: "neutral",
};

interface Row {
  id: string;
  application_no: string;
  real_name: string;
  english_name: string | null;
  phone: string;
  email: string;
  company_name_zh: string | null;
  title: string | null;
  state: string;
  city: string;
  status: ApplicationStatus;
  created_at: string;
  updated_at: string;
  industries?: { name_zh: string } | null;
  membership_types?: { name_zh: string } | null;
  chapters?: { name_zh: string } | null;
  reviewer?: { full_name: string | null; email: string } | null;
}

export function ApplicationsTable({ rows, canDelete }: { rows: Row[]; canDelete: boolean }) {
  const router = useRouter();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkStatus, setBulkStatus] = useState<ApplicationStatus>("under_review");
  const [pending, startTransition] = useTransition();
  const [deleteTarget, setDeleteTarget] = useState<Row | null>(null);

  function toggleAll(checked: boolean) {
    setSelected(checked ? new Set(rows.map((r) => r.id)) : new Set());
  }
  function toggleOne(id: string, checked: boolean) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  }

  function applyBulk() {
    if (selected.size === 0) return;
    startTransition(async () => {
      await bulkUpdateApplicationStatus(Array.from(selected), bulkStatus);
      setSelected(new Set());
      router.refresh();
    });
  }

  function confirmDelete() {
    if (!deleteTarget) return;
    startTransition(async () => {
      await deleteApplication(deleteTarget.id);
      setDeleteTarget(null);
      router.refresh();
    });
  }

  return (
    <div>
      {selected.size > 0 && (
        <div className="mb-3 flex items-center gap-3 rounded-lg border border-gold-300 bg-gold-50 px-4 py-3 text-sm">
          <span className="font-semibold text-navy-900">已选择 {selected.size} 条</span>
          <select
            value={bulkStatus}
            onChange={(e) => setBulkStatus(e.target.value as ApplicationStatus)}
            className="rounded border border-navy-200 px-2 py-1 text-sm"
          >
            {Object.entries(statusLabel).map(([k, v]) => (
              <option key={k} value={k}>
                批量设为：{v}
              </option>
            ))}
          </select>
          <button
            onClick={applyBulk}
            disabled={pending}
            className="rounded bg-navy-900 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-60"
          >
            应用
          </button>
        </div>
      )}

      <div className="overflow-x-auto rounded-lg border border-navy-100 bg-white">
        <table className="w-full min-w-[1100px] text-left text-sm">
          <thead className="border-b border-navy-100 bg-mist text-xs font-semibold uppercase text-ink-500">
            <tr>
              <th className="w-10 px-3 py-3">
                <input
                  type="checkbox"
                  onChange={(e) => toggleAll(e.target.checked)}
                  checked={selected.size > 0 && selected.size === rows.length}
                />
              </th>
              <th className="px-3 py-3">申请编号</th>
              <th className="px-3 py-3">姓名</th>
              <th className="px-3 py-3">联系方式</th>
              <th className="px-3 py-3">公司/职位</th>
              <th className="px-3 py-3">州/城市</th>
              <th className="px-3 py-3">行业</th>
              <th className="px-3 py-3">会员类型</th>
              <th className="px-3 py-3">状态</th>
              <th className="px-3 py-3">提交日期</th>
              <th className="px-3 py-3">审核人</th>
              <th className="px-3 py-3">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-navy-100">
            {rows.map((r) => (
              <tr key={r.id} className="hover:bg-mist/60">
                <td className="px-3 py-3">
                  <input
                    type="checkbox"
                    checked={selected.has(r.id)}
                    onChange={(e) => toggleOne(r.id, e.target.checked)}
                  />
                </td>
                <td className="whitespace-nowrap px-3 py-3 font-mono text-xs text-ink-600">{r.application_no}</td>
                <td className="whitespace-nowrap px-3 py-3 font-medium text-navy-900">
                  {r.real_name}
                  {r.english_name && <span className="ml-1 text-ink-400">({r.english_name})</span>}
                </td>
                <td className="whitespace-nowrap px-3 py-3 text-ink-600">
                  <div>{r.phone}</div>
                  <div className="text-xs text-ink-400">{r.email}</div>
                </td>
                <td className="whitespace-nowrap px-3 py-3 text-ink-600">
                  <div>{r.company_name_zh || "—"}</div>
                  <div className="text-xs text-ink-400">{r.title || ""}</div>
                </td>
                <td className="whitespace-nowrap px-3 py-3 text-ink-600">{r.state} / {r.city}</td>
                <td className="whitespace-nowrap px-3 py-3 text-ink-600">{r.industries?.name_zh || "—"}</td>
                <td className="whitespace-nowrap px-3 py-3 text-ink-600">{r.membership_types?.name_zh || "—"}</td>
                <td className="whitespace-nowrap px-3 py-3">
                  <Badge tone={statusTone[r.status]}>{statusLabel[r.status]}</Badge>
                </td>
                <td className="whitespace-nowrap px-3 py-3 text-ink-600">
                  {new Date(r.created_at).toLocaleDateString("zh-CN")}
                </td>
                <td className="whitespace-nowrap px-3 py-3 text-ink-600">
                  {r.reviewer?.full_name || r.reviewer?.email || "—"}
                </td>
                <td className="whitespace-nowrap px-3 py-3">
                  <div className="flex items-center gap-3">
                    <Link href={`/admin/applications/${r.id}`} className="font-semibold text-navy-700 hover:underline">
                      查看
                    </Link>
                    {canDelete && (
                      <button
                        onClick={() => setDeleteTarget(r)}
                        className="font-semibold text-red-600 hover:underline"
                      >
                        删除
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={12} className="px-3 py-12 text-center text-sm text-ink-400">
                  暂无符合条件的申请记录
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-lg bg-white p-6">
            <h3 className="text-base font-bold text-navy-900">确认删除？</h3>
            <p className="mt-2 text-sm text-ink-600">
              即将永久删除申请「{deleteTarget.application_no} · {deleteTarget.real_name}」，此操作不可撤销。
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="rounded border border-navy-200 px-4 py-2 text-sm font-semibold text-navy-800"
              >
                取消
              </button>
              <button
                onClick={confirmDelete}
                disabled={pending}
                className="rounded bg-red-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
              >
                确认删除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
