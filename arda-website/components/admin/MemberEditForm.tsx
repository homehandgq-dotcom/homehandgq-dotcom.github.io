"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateMember, deleteMember } from "@/lib/actions/admin-members";
import { MediaUploadField } from "@/components/admin/MediaUploadField";
import type { FieldOption } from "@/lib/admin/entityRegistry";

interface MemberFormData {
  id: string;
  membership_type_id: string;
  display_name_zh: string;
  display_name_en: string;
  company_name_zh: string;
  company_name_en: string;
  logo_url: string;
  city: string;
  state: string;
  industry_id: string;
  website: string;
  is_public: boolean;
  status: "active" | "inactive" | "expired";
}

export function MemberEditForm({
  initial,
  membershipTypes,
  industries,
  canDelete,
}: {
  initial: MemberFormData;
  membershipTypes: FieldOption[];
  industries: FieldOption[];
  canDelete: boolean;
}) {
  const router = useRouter();
  const [form, setForm] = useState(initial);
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  function set<K extends keyof MemberFormData>(key: K, value: MemberFormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleSave() {
    setMessage(null);
    startTransition(async () => {
      const res = await updateMember(form);
      if (res.ok) {
        setMessage({ type: "success", text: "已保存" });
        router.refresh();
      } else {
        setMessage({ type: "error", text: res.error });
      }
    });
  }

  function handleDelete() {
    if (!window.confirm(`确认永久删除会员「${form.display_name_zh}」？此操作不可撤销。`)) return;
    startTransition(async () => {
      const res = await deleteMember(form.id);
      if (res.ok) router.push("/admin/members");
      else setMessage({ type: "error", text: res.error });
    });
  }

  return (
    <div className="space-y-5 rounded-lg border border-navy-100 bg-white p-6">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Field label="展示名称（中文）">
          <input className="input" value={form.display_name_zh} onChange={(e) => set("display_name_zh", e.target.value)} />
        </Field>
        <Field label="展示名称（English）">
          <input className="input" value={form.display_name_en} onChange={(e) => set("display_name_en", e.target.value)} />
        </Field>
        <Field label="公司（中文）">
          <input className="input" value={form.company_name_zh} onChange={(e) => set("company_name_zh", e.target.value)} />
        </Field>
        <Field label="公司（English）">
          <input className="input" value={form.company_name_en} onChange={(e) => set("company_name_en", e.target.value)} />
        </Field>
        <Field label="会员类型">
          <select className="input" value={form.membership_type_id} onChange={(e) => set("membership_type_id", e.target.value)}>
            {membershipTypes.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="行业">
          <select className="input" value={form.industry_id} onChange={(e) => set("industry_id", e.target.value)}>
            <option value="">（未设置）</option>
            {industries.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="州">
          <input className="input" value={form.state} onChange={(e) => set("state", e.target.value)} />
        </Field>
        <Field label="城市">
          <input className="input" value={form.city} onChange={(e) => set("city", e.target.value)} />
        </Field>
        <Field label="官网">
          <input className="input" value={form.website} onChange={(e) => set("website", e.target.value)} />
        </Field>
        <Field label="Logo" fullWidth>
          <MediaUploadField
            value={form.logo_url}
            onChange={(url) => set("logo_url", url)}
            bucket="logos"
            accept="image/png"
            acceptLabel="仅支持 PNG 格式，建议使用透明背景、正方形或横向的图片"
          />
        </Field>
        <Field label="账户状态">
          <select
            className="input"
            value={form.status}
            onChange={(e) => set("status", e.target.value as MemberFormData["status"])}
          >
            <option value="active">生效中</option>
            <option value="inactive">已停用</option>
            <option value="expired">已过期</option>
          </select>
        </Field>
        <Field label="对外公开展示">
          <label className="checkbox-row">
            <input type="checkbox" checked={form.is_public} onChange={(e) => set("is_public", e.target.checked)} />
            <span className="text-sm text-ink-600">在「会员名录」中公开展示（默认关闭）</span>
          </label>
        </Field>
      </div>

      {message && (
        <p className={`text-sm ${message.type === "success" ? "text-green-700" : "text-red-600"}`}>{message.text}</p>
      )}

      <div className="flex items-center justify-between border-t border-navy-100 pt-5">
        <button
          onClick={handleSave}
          disabled={pending}
          className="rounded bg-navy-900 px-6 py-2.5 text-sm font-bold text-white disabled:opacity-60"
        >
          保存
        </button>
        {canDelete && (
          <button
            onClick={handleDelete}
            disabled={pending}
            className="rounded border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50"
          >
            删除会员
          </button>
        )}
      </div>
    </div>
  );
}

function Field({
  label,
  children,
  fullWidth,
}: {
  label: string;
  children: React.ReactNode;
  fullWidth?: boolean;
}) {
  return (
    <label className={`block space-y-1.5 ${fullWidth ? "sm:col-span-2" : ""}`}>
      <span className="text-xs font-semibold text-ink-500">{label}</span>
      {children}
    </label>
  );
}
