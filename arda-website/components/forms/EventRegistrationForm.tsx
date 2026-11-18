"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { eventRegistrationSchema, type EventRegistrationInput } from "@/lib/validation/membership";
import { registerForEvent } from "@/lib/actions/public-forms";
import type { Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";

export function EventRegistrationForm({
  locale,
  eventId,
  disabled,
  disabledReason,
}: {
  locale: Locale;
  eventId: string;
  disabled?: boolean;
  disabledReason?: string;
}) {
  const dict = getDictionary(locale);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EventRegistrationInput>({
    resolver: zodResolver(eventRegistrationSchema),
    defaultValues: { event_id: eventId, headcount: 1, website_hp: "" },
  });

  async function onSubmit(values: EventRegistrationInput) {
    setStatus("loading");
    const res = await registerForEvent(values);
    if (res.ok) {
      setStatus("success");
    } else {
      setStatus("error");
      setError(res.error);
    }
  }

  if (disabled) {
    return (
      <div className="rounded-lg border border-navy-200 bg-mist p-6 text-sm text-ink-600">
        {disabledReason}
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="rounded-lg border border-green-200 bg-green-50 p-6 text-sm text-green-800">
        {locale === "zh" ? "报名成功！我们已收到您的信息。" : "You're registered! We've received your information."}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 rounded-lg border border-navy-100 bg-white p-6">
      <h3 className="text-base font-bold text-navy-900">{locale === "zh" ? "活动报名" : "Event Registration"}</h3>
      <input type="hidden" {...register("event_id")} value={eventId} />
      <input type="text" {...register("website_hp")} className="hidden" tabIndex={-1} autoComplete="off" />

      <Field label={locale === "zh" ? "姓名" : "Name"} error={errors.name?.message}>
        <input {...register("name")} className="input" />
      </Field>
      <Field label={locale === "zh" ? "邮箱" : "Email"} error={errors.email?.message}>
        <input type="email" {...register("email")} className="input" />
      </Field>
      <Field label={locale === "zh" ? "电话" : "Phone"} error={errors.phone?.message} optional>
        <input {...register("phone")} className="input" />
      </Field>
      <Field label={locale === "zh" ? "公司/机构" : "Company"} error={errors.company?.message} optional>
        <input {...register("company")} className="input" />
      </Field>
      <Field label={locale === "zh" ? "出席人数" : "Headcount"} error={errors.headcount?.message}>
        <input type="number" min={1} max={50} {...register("headcount", { valueAsNumber: true })} className="input" />
      </Field>
      <Field label={locale === "zh" ? "备注" : "Notes"} error={errors.notes?.message} optional>
        <textarea {...register("notes")} rows={3} className="input" />
      </Field>

      {status === "error" && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={status === "loading"}
        className="w-full rounded bg-navy-900 py-3 text-sm font-bold text-white hover:bg-navy-800 disabled:opacity-60"
      >
        {status === "loading" ? dict.common.submitting : locale === "zh" ? "确认报名" : "Register"}
      </button>
    </form>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  optional?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold text-navy-900">{label}</span>
      {children}
      {error && <span className="mt-1 block text-xs text-red-600">{error}</span>}
    </label>
  );
}
