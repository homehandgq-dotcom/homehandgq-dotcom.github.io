"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowUp, ArrowDown } from "lucide-react";
import { deleteEntityRecord, swapEntitySortOrder } from "@/lib/actions/admin-entities";
import { Badge } from "@/components/ui/primitives";
import type { EntityConfig } from "@/lib/admin/entityRegistry";

const STATUS_LABEL: Record<string, string> = {
  draft: "草稿",
  published: "已发布",
  scheduled: "定时发布",
  unpublished: "已下线",
};
const STATUS_TONE: Record<string, "green" | "gold" | "neutral" | "red"> = {
  draft: "neutral",
  published: "green",
  scheduled: "gold",
  unpublished: "red",
};

const GOVERNANCE_BODY_LABEL: Record<string, string> = {
  general_assembly: "会员大会",
  board_of_directors: "董事局",
  executive_council: "执行理事会",
  secretariat: "执行管理部门",
  supervisory_board: "监事会",
  advisory_committee: "顾问委员会",
  honorary: "名誉职务",
  leadership: "协会领导与核心成员",
};

function cellValue(row: Record<string, unknown>, key: string): unknown {
  return row[key];
}

function DisplayCell({ colKey, value }: { colKey: string; value: unknown }) {
  if (colKey === "status" && typeof value === "string") {
    return <Badge tone={STATUS_TONE[value] ?? "neutral"}>{STATUS_LABEL[value] ?? value}</Badge>;
  }
  if (colKey.startsWith("is_") && typeof value === "boolean") {
    return <Badge tone={value ? "gold" : "neutral"}>{value ? "是" : "否"}</Badge>;
  }
  if (colKey === "governance_bodies" && Array.isArray(value)) {
    if (value.length === 0) return <span className="text-ink-300">—</span>;
    return <span>{value.map((v) => GOVERNANCE_BODY_LABEL[v as string] ?? v).join("、")}</span>;
  }
  if (value && typeof value === "object" && ("name_zh" in (value as Record<string, unknown>) || "label_zh" in (value as Record<string, unknown>))) {
    const obj = value as { name_zh?: string; label_zh?: string };
    return <span>{obj.name_zh || obj.label_zh || "—"}</span>;
  }
  if ((colKey.endsWith("_at") || colKey === "start_at") && typeof value === "string" && value) {
    return <span>{new Date(value).toLocaleString("zh-CN")}</span>;
  }
  if (value === null || value === undefined || value === "") return <span className="text-ink-300">—</span>;
  return <span>{String(value)}</span>;
}

interface Row {
  id: string;
  sort_order?: number;
  [key: string]: unknown;
}

export function EntityTable({
  config,
  rows,
  canDelete,
  canReorder,
}: {
  config: EntityConfig;
  rows: Row[];
  canDelete: boolean;
  canReorder: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [deleteTarget, setDeleteTarget] = useState<Row | null>(null);

  const titleZhKey = `${config.titleField}_zh`;

  function move(row: Row, dir: "up" | "down") {
    const idx = rows.findIndex((r) => r.id === row.id);
    const otherIdx = dir === "up" ? idx - 1 : idx + 1;
    if (otherIdx < 0 || otherIdx >= rows.length) return;
    const other = rows[otherIdx];
    startTransition(async () => {
      await swapEntitySortOrder(
        config.key,
        row.id,
        (row.sort_order as number) ?? 0,
        other.id,
        (other.sort_order as number) ?? 0
      );
      router.refresh();
    });
  }

  function confirmDelete() {
    if (!deleteTarget) return;
    startTransition(async () => {
      await deleteEntityRecord(config.key, deleteTarget.id);
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
              {config.listColumns.map((col) => (
                <th key={col.key} className="px-3 py-3">
                  {col.label}
                </th>
              ))}
              <th className="px-3 py-3">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-navy-100">
            {rows.map((row, idx) => (
              <tr key={row.id} className="hover:bg-mist/60">
                {config.listColumns.map((col) => (
                  <td key={col.key} className="whitespace-nowrap px-3 py-3 text-ink-700">
                    <DisplayCell colKey={col.key} value={cellValue(row, col.key)} />
                  </td>
                ))}
                <td className="whitespace-nowrap px-3 py-3">
                  <div className="flex items-center gap-3">
                    <Link
                      href={`/admin/content/${config.key}/${row.id}`}
                      className="font-semibold text-navy-700 hover:underline"
                    >
                      编辑
                    </Link>
                    {canReorder && config.hasSortOrder && (
                      <>
                        <button
                          type="button"
                          disabled={idx === 0 || pending}
                          onClick={() => move(row, "up")}
                          className="text-ink-400 hover:text-navy-800 disabled:opacity-30"
                          aria-label="上移"
                        >
                          <ArrowUp className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          disabled={idx === rows.length - 1 || pending}
                          onClick={() => move(row, "down")}
                          className="text-ink-400 hover:text-navy-800 disabled:opacity-30"
                          aria-label="下移"
                        >
                          <ArrowDown className="h-4 w-4" />
                        </button>
                      </>
                    )}
                    {canDelete && (
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(row)}
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
                <td colSpan={config.listColumns.length + 1} className="px-3 py-12 text-center text-sm text-ink-400">
                  暂无数据，点击右上角「新建」添加第一条记录
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
              即将永久删除「{(deleteTarget[titleZhKey] as string) || deleteTarget.id}」，此操作不可撤销。
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
