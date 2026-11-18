"use client";

import { useState, useTransition, type ReactNode } from "react";
import { useRouter } from "next/navigation";

type ActionResult = { ok: true } | { ok: false; error: string };

export interface InboxColumn<T> {
  key: string;
  label: string;
  render: (row: T) => ReactNode;
}

const STATUS_LABEL: Record<string, string> = { new: "新", in_progress: "跟进中", resolved: "已处理" };

export function InboxTable<T extends { id: string; status?: string }>({
  rows,
  columns,
  onStatusChange,
  onDelete,
  canDelete,
  emptyText = "暂无记录",
  titleOf,
}: {
  rows: T[];
  columns: InboxColumn<T>[];
  onStatusChange?: (id: string, status: "new" | "in_progress" | "resolved") => Promise<ActionResult>;
  onDelete?: (id: string) => Promise<ActionResult>;
  canDelete: boolean;
  emptyText?: string;
  titleOf: (row: T) => string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [deleteTarget, setDeleteTarget] = useState<T | null>(null);

  function confirmDelete() {
    if (!deleteTarget || !onDelete) return;
    startTransition(async () => {
      await onDelete(deleteTarget.id);
      setDeleteTarget(null);
      router.refresh();
    });
  }

  return (
    <div>
      <div className="overflow-x-auto rounded-lg border border-navy-100 bg-white">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead className="border-b border-navy-100 bg-mist text-xs font-semibold uppercase text-ink-500">
            <tr>
              {columns.map((c) => (
                <th key={c.key} className="px-3 py-3">
                  {c.label}
                </th>
              ))}
              {onStatusChange && <th className="px-3 py-3">状态</th>}
              <th className="px-3 py-3">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-navy-100">
            {rows.map((row) => (
              <tr key={row.id} className="hover:bg-mist/60">
                {columns.map((c) => (
                  <td key={c.key} className="px-3 py-3 text-ink-700">
                    {c.render(row)}
                  </td>
                ))}
                {onStatusChange && (
                  <td className="whitespace-nowrap px-3 py-3">
                    <select
                      defaultValue={row.status || "new"}
                      disabled={pending}
                      onChange={(e) =>
                        startTransition(async () => {
                          await onStatusChange(row.id, e.target.value as "new" | "in_progress" | "resolved");
                          router.refresh();
                        })
                      }
                      className="rounded border border-navy-200 px-2 py-1 text-xs"
                    >
                      {Object.entries(STATUS_LABEL).map(([k, v]) => (
                        <option key={k} value={k}>
                          {v}
                        </option>
                      ))}
                    </select>
                  </td>
                )}
                <td className="whitespace-nowrap px-3 py-3">
                  {canDelete && onDelete && (
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(row)}
                      className="font-semibold text-red-600 hover:underline"
                    >
                      删除
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={columns.length + 2} className="px-3 py-12 text-center text-sm text-ink-400">
                  {emptyText}
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
            <p className="mt-2 text-sm text-ink-600">即将永久删除「{titleOf(deleteTarget)}」，此操作不可撤销。</p>
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
