"use client";

import { useState } from "react";
import { lookupMembershipApplication } from "@/lib/actions/public-forms";
import type { Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { Badge } from "@/components/ui/primitives";
import { formatDate } from "@/lib/utils/format";

type LookupResult = {
  application_no: string;
  status: string;
  real_name: string;
  submitted_at: string | null;
  reviewed_at: string | null;
  rejection_reason: string | null;
};

const statusTone: Record<string, "green" | "gold" | "neutral" | "red"> = {
  approved: "green",
  under_review: "gold",
  submitted: "gold",
  more_info_required: "gold",
  rejected: "red",
  archived: "neutral",
  draft: "neutral",
};

export function StatusLookupForm({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale);
  const [applicationNo, setApplicationNo] = useState("");
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "error">("idle");
  const [error, setError] = useState("");
  const [result, setResult] = useState<LookupResult | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setState("loading");
    setResult(null);
    const res = await lookupMembershipApplication({ application_no: applicationNo, email });
    if (res.ok) {
      setResult(res.data as LookupResult);
      setState("idle");
    } else {
      setState("error");
      setError(res.error);
    }
  }

  return (
    <div className="space-y-8">
      <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border border-navy-100 bg-white p-6">
        <label className="block">
          <span className="mb-1.5 block text-sm font-semibold text-navy-900">
            {locale === "zh" ? "申请编号" : "Application Number"}
          </span>
          <input
            required
            className="input"
            placeholder="ARDA-2026-000123"
            value={applicationNo}
            onChange={(e) => setApplicationNo(e.target.value)}
          />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm font-semibold text-navy-900">
            {locale === "zh" ? "提交时使用的邮箱" : "Email used at submission"}
          </span>
          <input
            required
            type="email"
            className="input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>
        {state === "error" && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={state === "loading"}
          className="w-full rounded bg-navy-900 py-3 text-sm font-bold text-white hover:bg-navy-800 disabled:opacity-60"
        >
          {state === "loading" ? dict.common.submitting : dict.common.search}
        </button>
      </form>

      {result && (
        <div className="rounded-lg border border-navy-100 bg-mist p-6">
          <div className="flex items-center justify-between">
            <p className="text-lg font-bold text-navy-900">{result.application_no}</p>
            <Badge tone={statusTone[result.status] || "neutral"}>
              {dict.status[result.status as keyof typeof dict.status] || result.status}
            </Badge>
          </div>
          <dl className="mt-4 space-y-2 text-sm text-ink-600">
            <div className="flex justify-between">
              <dt>{locale === "zh" ? "申请人" : "Applicant"}</dt>
              <dd>{result.real_name}</dd>
            </div>
            <div className="flex justify-between">
              <dt>{locale === "zh" ? "提交时间" : "Submitted"}</dt>
              <dd>{formatDate(result.submitted_at, locale)}</dd>
            </div>
            {result.reviewed_at && (
              <div className="flex justify-between">
                <dt>{locale === "zh" ? "审核时间" : "Reviewed"}</dt>
                <dd>{formatDate(result.reviewed_at, locale)}</dd>
              </div>
            )}
            {result.status === "rejected" && result.rejection_reason && (
              <div className="border-t border-navy-200 pt-2">
                <dt className="mb-1">{locale === "zh" ? "说明" : "Note"}</dt>
                <dd>{result.rejection_reason}</dd>
              </div>
            )}
          </dl>
        </div>
      )}
    </div>
  );
}
