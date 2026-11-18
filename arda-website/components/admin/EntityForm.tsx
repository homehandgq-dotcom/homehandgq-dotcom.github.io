"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { saveEntityRecord } from "@/lib/actions/admin-entities";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import { MediaUploadField } from "@/components/admin/MediaUploadField";
import { VideoUploadField } from "@/components/admin/VideoUploadField";
import { PdfUploadField } from "@/components/admin/PdfUploadField";
import { PrivateImageUploadField } from "@/components/admin/PrivateImageUploadField";
import type { EntityConfig, FieldConfig, FieldOption } from "@/lib/admin/entityRegistry";

function isoToDateInput(v: unknown): string {
  if (!v || typeof v !== "string") return "";
  return v.slice(0, 10);
}
function isoToDatetimeInput(v: unknown): string {
  if (!v || typeof v !== "string") return "";
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function bucketForField(key: string): "avatars" | "logos" | "media" | "downloads" {
  if (key.startsWith("avatar_")) return "avatars";
  if (key.startsWith("logo_")) return "logos";
  if (key === "file_url") return "downloads";
  return "media";
}

function columnKeys(field: FieldConfig): string[] {
  return field.bilingual ? [`${field.key}_zh`, `${field.key}_en`] : [field.key];
}

type FormValue = string | number | boolean | string[] | null;

function initState(fields: FieldConfig[], initial: Record<string, unknown>): Record<string, FormValue> {
  const state: Record<string, FormValue> = {};
  for (const field of fields) {
    for (const col of columnKeys(field)) {
      const raw = initial[col];
      if (field.type === "checkbox") {
        state[col] = Boolean(raw);
      } else if (field.type === "date") {
        state[col] = isoToDateInput(raw);
      } else if (field.type === "datetime") {
        state[col] = isoToDatetimeInput(raw);
      } else if (field.type === "tags") {
        state[col] = Array.isArray(raw) ? (raw as string[]).join("\n") : (raw as string) || "";
      } else if (field.type === "multiselect") {
        state[col] = Array.isArray(raw) ? (raw as string[]) : [];
      } else if (field.type === "number") {
        state[col] = raw === null || raw === undefined ? "" : (raw as number);
      } else if (field.type === "hidden") {
        if (field.valueKind === "boolean") state[col] = Boolean(raw);
        else if (field.valueKind === "number") state[col] = raw === null || raw === undefined ? null : (raw as number);
        else state[col] = (raw as string) ?? null;
      } else {
        state[col] = (raw as string) ?? "";
      }
    }
  }
  return state;
}

export function EntityForm({
  config,
  id,
  initialValues,
  relationOptions,
}: {
  config: EntityConfig;
  id: string | null;
  initialValues: Record<string, unknown>;
  relationOptions: Record<string, FieldOption[]>;
}) {
  const router = useRouter();
  const [values, setValues] = useState<Record<string, FormValue>>(() => initState(config.fields, initialValues));
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const listHref = `/admin/content/${config.key}`;

  function setCol(col: string, v: FormValue) {
    setValues((prev) => ({ ...prev, [col]: v }));
  }

  /** 供视频/PDF/封面等复合上传组件一次性写入多个关联字段（如路径+宽高+时长） */
  function setMany(patch: Record<string, FormValue>) {
    setValues((prev) => ({ ...prev, ...patch }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const res = await saveEntityRecord(config.key, id, values);
      if (res.ok) {
        router.push(listHref);
        router.refresh();
      } else {
        setError(res.error);
      }
    });
  }

  // "hidden" 字段仅用于让上传组件写入的元数据列参与 initState / 保存，不在表单中渲染；
  // config.fields 本身（含 hidden）仍是 initState / handleSubmit 读写 values 的完整依据。
  const groupedFields = useMemo(() => config.fields.filter((f) => f.type !== "hidden"), [config.fields]);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {groupedFields.map((field) => (
          <div key={field.key} className={field.fullWidth ? "lg:col-span-2" : ""}>
            <FieldBlock
              field={field}
              values={values}
              setCol={setCol}
              setMany={setMany}
              options={field.optionsKey ? relationOptions[field.optionsKey] ?? [] : field.staticOptions ?? []}
            />
          </div>
        ))}
      </div>

      {error && (
        <div className="rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      <div className="flex items-center gap-3 border-t border-navy-100 pt-5">
        <button
          type="submit"
          disabled={pending}
          className="flex items-center gap-2 rounded bg-navy-900 px-6 py-2.5 text-sm font-bold text-white disabled:opacity-60"
        >
          {pending && <Loader2 className="h-4 w-4 animate-spin" />}
          {id ? "保存修改" : "创建"}
        </button>
        <button
          type="button"
          onClick={() => router.push(listHref)}
          className="rounded border border-navy-200 px-6 py-2.5 text-sm font-semibold text-navy-800"
        >
          取消
        </button>
      </div>
    </form>
  );
}

function FieldBlock({
  field,
  values,
  setCol,
  setMany,
  options,
}: {
  field: FieldConfig;
  values: Record<string, FormValue>;
  setCol: (col: string, v: FormValue) => void;
  setMany: (patch: Record<string, FormValue>) => void;
  options: FieldOption[];
}) {
  if (field.bilingual) {
    const zhCol = `${field.key}_zh`;
    const enCol = `${field.key}_en`;
    return (
      <div className="space-y-2">
        <FieldLabel field={field} suffix="（中文）" />
        <Widget field={field} col={zhCol} value={values[zhCol]} onChange={(v) => setCol(zhCol, v)} allValues={values} setMany={setMany} />
        <FieldLabel field={field} suffix="（English）" />
        <Widget field={field} col={enCol} value={values[enCol]} onChange={(v) => setCol(enCol, v)} allValues={values} setMany={setMany} />
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      <FieldLabel field={field} />
      <Widget
        field={field}
        col={field.key}
        value={values[field.key]}
        onChange={(v) => setCol(field.key, v)}
        options={options}
        allValues={values}
        setMany={setMany}
      />
    </div>
  );
}

function FieldLabel({ field, suffix }: { field: FieldConfig; suffix?: string }) {
  return (
    <label className="block text-xs font-semibold text-ink-500">
      {field.label}
      {suffix ? <span className="text-navy-400">{suffix}</span> : ""}
      {field.required && <span className="ml-0.5 text-red-500">*</span>}
      {field.helpText && <span className="ml-1.5 font-normal text-ink-400">{field.helpText}</span>}
    </label>
  );
}

function Widget({
  field,
  col,
  value,
  onChange,
  options = [],
  allValues,
  setMany,
}: {
  field: FieldConfig;
  col: string;
  value: FormValue | undefined;
  onChange: (v: FormValue) => void;
  options?: FieldOption[];
  allValues: Record<string, FormValue>;
  setMany: (patch: Record<string, FormValue>) => void;
}) {
  switch (field.type) {
    case "textarea":
      return (
        <textarea
          rows={4}
          className="input"
          value={(value as string) || ""}
          placeholder={field.placeholder}
          onChange={(e) => onChange(e.target.value)}
        />
      );
    case "richtext":
      return (
        <RichTextEditor
          value={(value as string) || ""}
          onChange={(html) => onChange(html)}
          placeholder={field.placeholder}
        />
      );
    case "number":
      return (
        <input
          type="number"
          className="input"
          value={value === undefined || value === null || value === "" ? "" : String(value)}
          placeholder={field.placeholder}
          onChange={(e) => onChange(e.target.value === "" ? "" : Number(e.target.value))}
        />
      );
    case "checkbox":
      return (
        <label className="checkbox-row">
          <input type="checkbox" checked={Boolean(value)} onChange={(e) => onChange(e.target.checked)} />
          <span className="text-sm text-ink-600">启用 / 是</span>
        </label>
      );
    case "select":
      return (
        <select className="input" value={(value as string) || ""} onChange={(e) => onChange(e.target.value)}>
          <option value="">{field.required ? "请选择…" : "（未设置）"}</option>
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      );
    case "multiselect": {
      const selected = Array.isArray(value) ? (value as string[]) : [];
      return (
        <div className="flex flex-wrap gap-x-5 gap-y-2 rounded border border-navy-100 p-3">
          {options.map((o) => (
            <label key={o.value} className="checkbox-row">
              <input
                type="checkbox"
                checked={selected.includes(o.value)}
                onChange={(e) => {
                  const next = e.target.checked
                    ? [...selected, o.value]
                    : selected.filter((v) => v !== o.value);
                  onChange(next);
                }}
              />
              <span className="text-sm text-ink-600">{o.label}</span>
            </label>
          ))}
        </div>
      );
    }
    case "date":
      return (
        <input
          type="date"
          className="input"
          value={(value as string) || ""}
          onChange={(e) => onChange(e.target.value)}
        />
      );
    case "datetime":
      return (
        <input
          type="datetime-local"
          className="input"
          value={(value as string) || ""}
          onChange={(e) => onChange(e.target.value)}
        />
      );
    case "image":
      return (
        <MediaUploadField
          value={(value as string) || ""}
          onChange={(url) => onChange(url)}
          bucket={bucketForField(col)}
          accept={field.accept}
          acceptLabel={field.acceptLabel}
        />
      );
    case "file":
      return (
        <MediaUploadField
          value={(value as string) || ""}
          onChange={(url) => onChange(url)}
          bucket={bucketForField(col)}
          preview={false}
          accept={field.accept}
          acceptLabel={field.acceptLabel}
        />
      );
    case "video":
      return (
        <VideoUploadField
          value={(value as string) || ""}
          values={allValues}
          onChange={(path) => onChange(path)}
          setMany={(patch) => setMany(patch as Record<string, FormValue>)}
        />
      );
    case "pdf":
      return (
        <PdfUploadField
          value={(value as string) || ""}
          values={allValues}
          onChange={(path) => onChange(path)}
          setMany={(patch) => setMany(patch as Record<string, FormValue>)}
        />
      );
    case "private_image":
      return (
        <PrivateImageUploadField
          value={(value as string) || ""}
          bucket={field.bucket === "publications" ? "publications" : "videos"}
          onChange={(path) => onChange(path)}
          setMany={(patch) => setMany(patch as Record<string, FormValue>)}
        />
      );
    case "tags":
      return (
        <textarea
          rows={3}
          className="input font-mono text-xs"
          placeholder="每行一个，或用逗号分隔"
          value={(value as string) || ""}
          onChange={(e) => onChange(e.target.value)}
        />
      );
    case "url":
      return (
        <input
          type="url"
          className="input"
          placeholder={field.placeholder || "https://"}
          value={(value as string) || ""}
          onChange={(e) => onChange(e.target.value)}
        />
      );
    case "slug":
      return (
        <input
          type="text"
          className="input font-mono text-sm"
          placeholder={field.placeholder || "url-slug"}
          value={(value as string) || ""}
          onChange={(e) => onChange(e.target.value.trim())}
        />
      );
    case "text":
    default:
      return (
        <input
          type="text"
          className="input"
          placeholder={field.placeholder}
          value={(value as string) || ""}
          onChange={(e) => onChange(e.target.value)}
        />
      );
  }
}
