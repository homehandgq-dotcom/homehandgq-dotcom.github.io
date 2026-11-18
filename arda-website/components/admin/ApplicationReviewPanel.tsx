"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateApplicationStatus, convertApplicationToMember } from "@/lib/actions/admin-applications";
import type { ApplicationStatus } from "@/lib/supabase/types";

const STATUS_OPTIONS: { key: ApplicationStatus; label: string }[] = [
  { key: "submitted", label: "已提交" },
  { key: "under_review", label: "审核中" },
  { key: "more_info_required", label: "需补充信息" },
  { key: "approved", label: "已批准" },
  { key: "rejected", label: "未通过" },
  { key: "archived", label: "已归档" },
];

export function ApplicationReviewPanel({
  applicationId,
  currentStatus,
  currentNotes,
  currentRejectionReason,
}: {
  applicationId: string;
  currentStatus: ApplicationStatus;
  currentNotes: string | null;
  currentRejectionReason: string | null;
}) {
  const router = useRouter();
  const [status, setStatus] = useState<ApplicationStatus>(currentStatus);
  const [notes, setNotes] = useState(currentNotes || "");
  const [rejectionReason, setRejectionReason] = useState(currentRejectionReason || "");
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  function handleSave() {
    startTransition(async () => {
      const res = await updateApplicationStatus({
        id: applicationId,
        status,
        internal_notes: notes,
        rejection_reason: rejectionReason,
      });
      if (res.ok) {
        setMessage({ type: "success", text: "已保存" });
        router.refresh();
      } else {
        setMessage({ type: "error", text: res.error });
      }
    });
  }

  function handleConvert() {
    startTransition(async () => {
      const res = await convertApplicationToMember(applicationId, false);
      setMessage(
        res.ok
          ? { type: "success", text: "已转为正式会员（默认不公开展示，可在「正式会员」中调整）" }
          : { type: "error", text: res.error }
      );
      if (res.ok) router.refresh();
    });
  }

  return (
    <div className="space-y-5 rounded-lg border border-navy-100 bg-white p-6">
      <h2 className="text-sm font-bold text-navy-900">审核操作</h2>

      <label className="block">
        <span className="mb-1.5 block text-xs font-semibold text-ink-500">当前状态</span>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as ApplicationStatus)}
          className="input"
        >
          {STATUS_OPTIONS.map((o) => (
            <option key={o.key} value={o.key}>
              {o.label}
            </option>
          ))}
        </select>
      </label>

      {status === "rejected" && (
        <label className="block">
          <span className="mb-1.5 block text-xs font-semibold text-ink-500">拒绝原因（申请人可见）</span>
          <textarea
            rows={3}
            className="input"
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
          />
        </label>
      )}

      <label className="block">
        <span className="mb-1.5 block text-xs font-semibold text-ink-500">内部备注（仅管理员可见）</span>
        <textarea rows={4} className="input" value={notes} onChange={(e) => setNotes(e.target.value)} />
      </label>

      {message && (
        <p className={`text-sm ${message.type === "success" ? "text-green-700" : "text-red-600"}`}>
          {message.text}
        </p>
      )}

      <div className="flex flex-wrap gap-3">
        <button
          onClick={handleSave}
          disabled={pending}
          className="rounded bg-navy-900 px-5 py-2.5 text-sm font-bold text-white disabled:opacity-60"
        >
          保存
        </button>
        {status === "approved" && (
          <button
            onClick={handleConvert}
            disabled={pending}
            className="rounded border border-gold-400 px-5 py-2.5 text-sm font-bold text-navy-900 hover:bg-gold-50 disabled:opacity-60"
          >
            转为正式会员
          </button>
        )}
      </div>
    </div>
  );
}
