"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { donationInquirySchema, type DonationInquiryInput } from "@/lib/validation/membership";
import { submitDonationInquiry } from "@/lib/actions/public-forms";
import type { Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";

export function DonationInquiryForm({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<DonationInquiryInput>({
    resolver: zodResolver(donationInquirySchema),
    defaultValues: { inquiry_type: "donation", website_hp: "" },
  });

  async function onSubmit(values: DonationInquiryInput) {
    setStatus("loading");
    const res = await submitDonationInquiry(values);
    if (res.ok) setStatus("success");
    else {
      setStatus("error");
      setError(res.error);
    }
  }

  if (status === "success") {
    return (
      <div className="rounded-lg border border-green-200 bg-green-50 p-6 text-sm text-green-800">
        {locale === "zh"
          ? "感谢您的关注，协会将尽快与您联系。"
          : "Thank you for reaching out. Our team will follow up with you shortly."}
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
        <select className="input" {...register("inquiry_type")}>
          <option value="donation">{locale === "zh" ? "个人捐赠" : "Individual Donation"}</option>
          <option value="corporate_sponsorship">{locale === "zh" ? "企业赞助" : "Corporate Sponsorship"}</option>
          <option value="event_sponsorship">{locale === "zh" ? "活动赞助" : "Event Sponsorship"}</option>
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
          {locale === "zh" ? "公司/机构（如适用）" : "Company (if applicable)"}
        </span>
        <input className="input" {...register("company")} />
      </label>
      <label className="block">
        <span className="mb-1.5 block text-sm font-semibold text-navy-900">
          {locale === "zh" ? "意向金额区间" : "Amount Range"}
        </span>
        <input className="input" placeholder={locale === "zh" ? "如：$1,000 - $5,000" : "e.g. $1,000 - $5,000"} {...register("amount_range")} />
      </label>
      <label className="block">
        <span className="mb-1.5 block text-sm font-semibold text-navy-900">{locale === "zh" ? "留言" : "Message"}</span>
        <textarea rows={4} className="input" {...register("message")} />
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
