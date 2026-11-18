"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { contactFormSchema, type ContactFormInput } from "@/lib/validation/membership";
import { submitContactForm } from "@/lib/actions/public-forms";
import type { Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";

const TYPE_OPTIONS: { key: ContactFormInput["type"]; zh: string; en: string }[] = [
  { key: "general", zh: "一般咨询", en: "General Inquiry" },
  { key: "media", zh: "媒体联系", en: "Media" },
  { key: "business", zh: "商务合作", en: "Business Cooperation" },
  { key: "membership", zh: "会员服务", en: "Membership Services" },
  { key: "chapter", zh: "分会联系", en: "Chapter Inquiry" },
  { key: "donation", zh: "捐赠支持", en: "Donation" },
];

export function ContactForm({ locale, defaultType = "general" }: { locale: Locale; defaultType?: ContactFormInput["type"] }) {
  const dict = getDictionary(locale);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ContactFormInput>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: { type: defaultType, website_hp: "" },
  });

  async function onSubmit(values: ContactFormInput) {
    setStatus("loading");
    const res = await submitContactForm(values);
    if (res.ok) setStatus("success");
    else {
      setStatus("error");
      setError(res.error);
    }
  }

  if (status === "success") {
    return (
      <div className="rounded-lg border border-green-200 bg-green-50 p-6 text-sm text-green-800">
        {locale === "zh" ? "感谢您的留言，协会将尽快回复。" : "Thank you for reaching out. We'll respond as soon as possible."}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 rounded-lg border border-navy-100 bg-white p-6">
      <input type="text" {...register("website_hp")} className="hidden" tabIndex={-1} autoComplete="off" />
      <label className="block">
        <span className="mb-1.5 block text-sm font-semibold text-navy-900">
          {locale === "zh" ? "咨询类型" : "Inquiry Type"}
        </span>
        <select className="input" {...register("type")}>
          {TYPE_OPTIONS.map((t) => (
            <option key={t.key} value={t.key}>
              {locale === "zh" ? t.zh : t.en}
            </option>
          ))}
        </select>
      </label>
      <label className="block">
        <span className="mb-1.5 block text-sm font-semibold text-navy-900">{locale === "zh" ? "姓名" : "Name"}</span>
        <input className="input" {...register("name")} />
        {errors.name && <span className="mt-1 block text-xs text-red-600">{errors.name.message}</span>}
      </label>
      <label className="block">
        <span className="mb-1.5 block text-sm font-semibold text-navy-900">{locale === "zh" ? "邮箱" : "Email"}</span>
        <input type="email" className="input" {...register("email")} />
        {errors.email && <span className="mt-1 block text-xs text-red-600">{errors.email.message}</span>}
      </label>
      <label className="block">
        <span className="mb-1.5 block text-sm font-semibold text-navy-900">{locale === "zh" ? "电话" : "Phone"}</span>
        <input className="input" {...register("phone")} />
      </label>
      <label className="block">
        <span className="mb-1.5 block text-sm font-semibold text-navy-900">
          {locale === "zh" ? "公司/机构" : "Company"}
        </span>
        <input className="input" {...register("company")} />
      </label>
      <label className="block">
        <span className="mb-1.5 block text-sm font-semibold text-navy-900">{locale === "zh" ? "主题" : "Subject"}</span>
        <input className="input" {...register("subject")} />
      </label>
      <label className="block">
        <span className="mb-1.5 block text-sm font-semibold text-navy-900">{locale === "zh" ? "留言内容" : "Message"}</span>
        <textarea rows={5} className="input" {...register("message")} />
        {errors.message && <span className="mt-1 block text-xs text-red-600">{errors.message.message}</span>}
      </label>
      {status === "error" && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={status === "loading"}
        className="w-full rounded bg-navy-900 py-3 text-sm font-bold text-white hover:bg-navy-800 disabled:opacity-60"
      >
        {status === "loading" ? dict.common.submitting : dict.common.submit}
      </button>
    </form>
  );
}
