"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { membershipApplicationSchema, type MembershipApplicationInput } from "@/lib/validation/membership";
import { submitMembershipApplication } from "@/lib/actions/public-forms";
import { FileUploadField } from "@/components/forms/FileUploadField";
import type { Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";

interface Option {
  id: string;
  name_zh: string;
  name_en: string;
}

const DESIRED_SERVICES = [
  { key: "business_development", zh: "商业发展", en: "Business Development" },
  { key: "brand_franchise", zh: "品牌与连锁", en: "Brand & Franchise" },
  { key: "supply_chain", zh: "供应链资源", en: "Supply Chain Resources" },
  { key: "technology_ai", zh: "科技与AI", en: "Technology & AI" },
  { key: "capital_investment", zh: "资本与投资", en: "Capital & Investment" },
  { key: "legal_policy", zh: "法律与政策支持", en: "Legal & Policy Support" },
  { key: "training_talent", zh: "培训与人才发展", en: "Training & Talent" },
  { key: "international_cooperation", zh: "国际合作", en: "International Cooperation" },
  { key: "media_promotion", zh: "媒体与品牌推广", en: "Media & Brand Promotion" },
];

const US_STATES = [
  "New York", "California", "Texas", "Florida", "New Jersey", "Illinois",
  "Washington", "Massachusetts", "Nevada", "Hawaii", "Other",
];

export function MembershipApplicationForm({
  locale,
  membershipTypes,
  industries,
  committees,
  chapters,
}: {
  locale: Locale;
  membershipTypes: Option[];
  industries: Option[];
  committees: Option[];
  chapters: Option[];
}) {
  const dict = getDictionary(locale);
  const router = useRouter();
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<MembershipApplicationInput>({
    resolver: zodResolver(membershipApplicationSchema),
    defaultValues: {
      desired_services: [],
      desired_committee_ids: [],
      document_urls: [],
      agree_privacy: false,
      agree_contact: false,
      confirm_accuracy: false,
      website_hp: "",
    },
  });

  async function onSubmit(values: MembershipApplicationInput) {
    setSubmitting(true);
    setSubmitError("");
    const res = await submitMembershipApplication(values);
    setSubmitting(false);
    if (res.ok) {
      router.push(`/${locale}/membership/apply/success?no=${encodeURIComponent(res.data.application_no)}`);
    } else {
      setSubmitError(res.error);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-14">
      <input type="text" {...register("website_hp")} className="hidden" tabIndex={-1} autoComplete="off" />

      {/* ---- 基本信息 ---- */}
      <section>
        <h2 className="mb-6 border-b border-navy-100 pb-3 text-lg font-bold text-navy-900">
          {dict.apply.sectionBasic}
        </h2>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Field label={locale === "zh" ? "真实姓名" : "Full Name"} required error={errors.real_name?.message}>
            <input className="input" {...register("real_name")} />
          </Field>
          <Field label={locale === "zh" ? "英文姓名" : "English Name"} error={errors.english_name?.message}>
            <input className="input" {...register("english_name")} />
          </Field>
          <Field label={locale === "zh" ? "手机号码" : "Phone"} required error={errors.phone?.message}>
            <input className="input" {...register("phone")} />
          </Field>
          <Field label={locale === "zh" ? "电子邮箱" : "Email"} required error={errors.email?.message}>
            <input type="email" className="input" {...register("email")} />
          </Field>
          <Field label={locale === "zh" ? "公司中文名称" : "Company Name (Chinese)"} error={errors.company_name_zh?.message}>
            <input className="input" {...register("company_name_zh")} />
          </Field>
          <Field label={locale === "zh" ? "公司英文名称" : "Company Name (English)"} error={errors.company_name_en?.message}>
            <input className="input" {...register("company_name_en")} />
          </Field>
          <Field label={locale === "zh" ? "职位" : "Title"} error={errors.title?.message}>
            <input className="input" {...register("title")} />
          </Field>
          <Field label={locale === "zh" ? "申请会员类型" : "Membership Type"} required error={errors.membership_type_id?.message}>
            <select className="input" {...register("membership_type_id")} defaultValue="">
              <option value="" disabled>
                {locale === "zh" ? "请选择" : "Select"}
              </option>
              {membershipTypes.map((t) => (
                <option key={t.id} value={t.id}>
                  {locale === "zh" ? t.name_zh : t.name_en}
                </option>
              ))}
            </select>
          </Field>
          <Field label={locale === "zh" ? "所在州" : "State"} required error={errors.state?.message}>
            <input className="input" list="us-states" {...register("state")} />
            <datalist id="us-states">
              {US_STATES.map((s) => (
                <option key={s} value={s} />
              ))}
            </datalist>
          </Field>
          <Field label={locale === "zh" ? "所在城市" : "City"} required error={errors.city?.message}>
            <input className="input" {...register("city")} />
          </Field>
          <Field label={locale === "zh" ? "公司地址" : "Company Address"} error={errors.company_address?.message}>
            <input className="input" {...register("company_address")} />
          </Field>
          <Field label={locale === "zh" ? "公司网站" : "Company Website"} error={errors.company_website?.message}>
            <input className="input" placeholder="https://" {...register("company_website")} />
          </Field>
          <Field label={locale === "zh" ? "社交媒体" : "Social Media"} error={errors.social_media?.message}>
            <input className="input" {...register("social_media")} />
          </Field>
        </div>
      </section>

      {/* ---- 行业信息 ---- */}
      <section>
        <h2 className="mb-6 border-b border-navy-100 pb-3 text-lg font-bold text-navy-900">
          {dict.apply.sectionIndustry}
        </h2>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Field label={locale === "zh" ? "行业分类" : "Industry"} error={errors.industry_id?.message}>
            <select className="input" {...register("industry_id")} defaultValue="">
              <option value="">{locale === "zh" ? "请选择" : "Select"}</option>
              {industries.map((i) => (
                <option key={i.id} value={i.id}>
                  {locale === "zh" ? i.name_zh : i.name_en}
                </option>
              ))}
            </select>
          </Field>
          <Field label={locale === "zh" ? "餐厅或企业类型" : "Business Type"} error={errors.business_type?.message}>
            <input className="input" {...register("business_type")} />
          </Field>
          <Field label={locale === "zh" ? "企业规模" : "Company Size"} error={errors.company_size?.message}>
            <input className="input" {...register("company_size")} />
          </Field>
          <Field label={locale === "zh" ? "门店数量" : "Store Count"} error={errors.store_count?.message}>
            <input type="number" min={0} className="input" {...register("store_count", { valueAsNumber: true })} />
          </Field>
          <Field label={locale === "zh" ? "员工数量" : "Employee Count"} error={errors.employee_count?.message}>
            <input type="number" min={0} className="input" {...register("employee_count", { valueAsNumber: true })} />
          </Field>
          <Field label={locale === "zh" ? "成立年份" : "Founded Year"} error={errors.founded_year?.message}>
            <input type="number" min={1800} max={2100} className="input" {...register("founded_year", { valueAsNumber: true })} />
          </Field>
          <Field label={locale === "zh" ? "服务区域" : "Service Area"} error={errors.service_area?.message}>
            <input className="input" {...register("service_area")} />
          </Field>
          <Field label={locale === "zh" ? "推荐人" : "Referrer"} error={errors.referrer?.message}>
            <input className="input" {...register("referrer")} />
          </Field>
        </div>

        <Field label={locale === "zh" ? "个人或公司简介" : "Bio / Company Introduction"} error={errors.bio?.message} className="mt-5">
          <textarea rows={4} className="input" {...register("bio")} />
        </Field>

        <div className="mt-5">
          <span className="mb-2 block text-sm font-semibold text-navy-900">
            {locale === "zh" ? "希望获得的协会服务" : "Services of Interest"}
          </span>
          <Controller
            control={control}
            name="desired_services"
            render={({ field }) => (
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {DESIRED_SERVICES.map((s) => (
                  <label key={s.key} className="checkbox-row">
                    <input
                      type="checkbox"
                      checked={field.value?.includes(s.key)}
                      onChange={(e) => {
                        const set = new Set(field.value || []);
                        if (e.target.checked) set.add(s.key);
                        else set.delete(s.key);
                        field.onChange(Array.from(set));
                      }}
                    />
                    {locale === "zh" ? s.zh : s.en}
                  </label>
                ))}
              </div>
            )}
          />
        </div>

        {committees.length > 0 && (
          <div className="mt-5">
            <span className="mb-2 block text-sm font-semibold text-navy-900">
              {locale === "zh" ? "希望加入的专业委员会" : "Committees of Interest"}
            </span>
            <Controller
              control={control}
              name="desired_committee_ids"
              render={({ field }) => (
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {committees.map((c) => (
                    <label key={c.id} className="checkbox-row">
                      <input
                        type="checkbox"
                        checked={field.value?.includes(c.id)}
                        onChange={(e) => {
                          const set = new Set(field.value || []);
                          if (e.target.checked) set.add(c.id);
                          else set.delete(c.id);
                          field.onChange(Array.from(set));
                        }}
                      />
                      {locale === "zh" ? c.name_zh : c.name_en}
                    </label>
                  ))}
                </div>
              )}
            />
          </div>
        )}

        {chapters.length > 0 && (
          <Field label={locale === "zh" ? "希望加入的地方分会" : "Chapter of Interest"} className="mt-5">
            <select className="input" {...register("desired_chapter_id")} defaultValue="">
              <option value="">{locale === "zh" ? "请选择" : "Select"}</option>
              {chapters.map((c) => (
                <option key={c.id} value={c.id}>
                  {locale === "zh" ? c.name_zh : c.name_en}
                </option>
              ))}
            </select>
          </Field>
        )}

        <Field label={locale === "zh" ? "备注" : "Remarks"} className="mt-5">
          <textarea rows={3} className="input" {...register("remarks")} />
        </Field>
      </section>

      {/* ---- 文件与确认 ---- */}
      <section>
        <h2 className="mb-6 border-b border-navy-100 pb-3 text-lg font-bold text-navy-900">
          {dict.apply.sectionFiles}
        </h2>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <FileUploadField
            locale={locale}
            bucket="logos"
            label={locale === "zh" ? "公司 Logo" : "Company Logo"}
            accept="image/*"
            onUploaded={(url) => setValue("logo_url", url)}
          />
          <FileUploadField
            locale={locale}
            bucket="avatars"
            label={locale === "zh" ? "个人头像" : "Personal Photo"}
            accept="image/*"
            onUploaded={(url) => setValue("avatar_url", url)}
          />
        </div>
        <div className="mt-5">
          <FileUploadField
            locale={locale}
            bucket="applications"
            label={locale === "zh" ? "名片或相关证明文件" : "Business Card / Supporting Document"}
            accept="image/*,.pdf"
            onUploaded={(url) => setValue("document_urls", [url])}
          />
        </div>

        <div className="mt-8 space-y-3 rounded-lg border border-navy-100 bg-mist p-5">
          <label className="checkbox-row">
            <input type="checkbox" {...register("agree_privacy")} />
            {locale === "zh" ? "我已阅读并同意协会《隐私政策》" : "I have read and agree to the Privacy Policy"}
          </label>
          {errors.agree_privacy && <p className="text-xs text-red-600">{errors.agree_privacy.message}</p>}
          <label className="checkbox-row">
            <input type="checkbox" {...register("agree_contact")} />
            {locale === "zh" ? "我同意协会通过邮件/电话与我联系" : "I agree to be contacted by ARDA via email/phone"}
          </label>
          {errors.agree_contact && <p className="text-xs text-red-600">{errors.agree_contact.message}</p>}
          <label className="checkbox-row">
            <input type="checkbox" {...register("confirm_accuracy")} />
            {locale === "zh" ? "我确认以上信息真实准确" : "I confirm the information above is true and accurate"}
          </label>
          {errors.confirm_accuracy && <p className="text-xs text-red-600">{errors.confirm_accuracy.message}</p>}
        </div>

        <Field
          label={locale === "zh" ? "电子签名（请输入本人姓名）" : "E-signature (type your full name)"}
          required
          error={errors.e_signature?.message}
          className="mt-5"
        >
          <input className="input" {...register("e_signature")} />
        </Field>
      </section>

      {submitError && (
        <p className="rounded border border-red-200 bg-red-50 p-4 text-sm text-red-700">{submitError}</p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded bg-navy-900 py-4 text-base font-bold text-white hover:bg-navy-800 disabled:opacity-60 sm:w-auto sm:px-12"
      >
        {submitting ? dict.common.submitting : dict.common.submit}
      </button>
    </form>
  );
}

function Field({
  label,
  required,
  error,
  className,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <label className={`block ${className ?? ""}`}>
      <span className="mb-1.5 block text-sm font-semibold text-navy-900">
        {label}
        {required && <span className="ml-1 text-red-600">*</span>}
      </span>
      {children}
      {error && <span className="mt-1 block text-xs text-red-600">{error}</span>}
    </label>
  );
}
