import { z } from "zod";

export const membershipApplicationSchema = z.object({
  // 基本信息
  real_name: z.string().trim().min(1, "请填写真实姓名 / Real name is required").max(100),
  english_name: z.string().trim().max(100).optional().or(z.literal("")),
  phone: z
    .string()
    .trim()
    .min(7, "请填写有效的电话号码 / Please enter a valid phone number")
    .max(30),
  email: z.string().trim().email("请填写有效的电子邮箱 / Please enter a valid email"),
  company_name_zh: z.string().trim().max(200).optional().or(z.literal("")),
  company_name_en: z.string().trim().max(200).optional().or(z.literal("")),
  title: z.string().trim().max(100).optional().or(z.literal("")),
  membership_type_id: z.string().uuid("请选择申请会员类型 / Please select a membership type"),
  state: z.string().trim().min(1, "请填写所在州 / State is required").max(100),
  city: z.string().trim().min(1, "请填写所在城市 / City is required").max(100),
  company_address: z.string().trim().max(300).optional().or(z.literal("")),
  company_website: z
    .string()
    .trim()
    .url("请填写有效网址，如 https://example.com")
    .optional()
    .or(z.literal("")),
  social_media: z.string().trim().max(300).optional().or(z.literal("")),

  // 行业信息
  industry_id: z.string().uuid().optional().or(z.literal("")),
  business_type: z.string().trim().max(200).optional().or(z.literal("")),
  company_size: z.string().trim().max(100).optional().or(z.literal("")),
  store_count: z.number().int().min(0).max(100000).optional(),
  employee_count: z.number().int().min(0).max(1000000).optional(),
  founded_year: z.number().int().min(1800).max(new Date().getFullYear()).optional(),
  service_area: z.string().trim().max(300).optional().or(z.literal("")),
  bio: z.string().trim().max(3000).optional().or(z.literal("")),
  desired_services: z.array(z.string()).max(20),
  desired_committee_ids: z.array(z.string().uuid()).max(10),
  desired_chapter_id: z.string().uuid().optional().or(z.literal("")),
  referrer: z.string().trim().max(200).optional().or(z.literal("")),
  remarks: z.string().trim().max(2000).optional().or(z.literal("")),

  // 文件
  logo_url: z.string().trim().max(500).optional().or(z.literal("")),
  avatar_url: z.string().trim().max(500).optional().or(z.literal("")),
  document_urls: z.array(z.string()).max(10),

  // 确认
  agree_privacy: z.boolean().refine((v) => v === true, {
    message: "请同意隐私政策 / You must agree to the Privacy Policy",
  }),
  agree_contact: z.boolean().refine((v) => v === true, {
    message: "请同意协会联系 / You must agree to be contacted",
  }),
  confirm_accuracy: z.boolean().refine((v) => v === true, {
    message: "请确认信息真实性 / You must confirm the information is accurate",
  }),
  e_signature: z.string().trim().min(1, "请填写电子签名（本人姓名）/ Please provide an e-signature"),

  // 反垃圾字段（蜜罐）：正常用户不会填写，机器人常见批量脚本会填
  website_hp: z.string().max(0).optional().or(z.literal("")),
});

export type MembershipApplicationInput = z.infer<typeof membershipApplicationSchema>;

export const contactFormSchema = z.object({
  type: z.enum(["general", "media", "business", "membership", "chapter", "donation"]),
  name: z.string().trim().min(1).max(100),
  email: z.string().trim().email(),
  phone: z.string().trim().max(30).optional().or(z.literal("")),
  company: z.string().trim().max(200).optional().or(z.literal("")),
  chapter_id: z.string().uuid().optional().or(z.literal("")),
  subject: z.string().trim().max(200).optional().or(z.literal("")),
  message: z.string().trim().min(1).max(3000),
  website_hp: z.string().max(0).optional().or(z.literal("")),
});

export const newsletterSchema = z.object({
  email: z.string().trim().email(),
  locale_pref: z.enum(["zh", "en"]).default("zh"),
  website_hp: z.string().max(0).optional().or(z.literal("")),
});

export const eventRegistrationSchema = z.object({
  event_id: z.string().uuid(),
  name: z.string().trim().min(1).max(100),
  email: z.string().trim().email(),
  phone: z.string().trim().max(30).optional().or(z.literal("")),
  company: z.string().trim().max(200).optional().or(z.literal("")),
  headcount: z.number().int().min(1).max(50),
  notes: z.string().trim().max(1000).optional().or(z.literal("")),
  website_hp: z.string().max(0).optional().or(z.literal("")),
});

export const donationInquirySchema = z.object({
  inquiry_type: z.enum(["donation", "corporate_sponsorship", "event_sponsorship"]),
  name: z.string().trim().min(1).max(100),
  email: z.string().trim().email(),
  phone: z.string().trim().max(30).optional().or(z.literal("")),
  company: z.string().trim().max(200).optional().or(z.literal("")),
  amount_range: z.string().trim().max(100).optional().or(z.literal("")),
  message: z.string().trim().max(2000).optional().or(z.literal("")),
  website_hp: z.string().max(0).optional().or(z.literal("")),
});

export const applicationStatusLookupSchema = z.object({
  application_no: z.string().trim().min(1),
  email: z.string().trim().email(),
});

export type ContactFormInput = z.infer<typeof contactFormSchema>;
export type NewsletterInput = z.infer<typeof newsletterSchema>;
export type EventRegistrationInput = z.infer<typeof eventRegistrationSchema>;
export type DonationInquiryInput = z.infer<typeof donationInquirySchema>;
export type ApplicationStatusLookupInput = z.infer<typeof applicationStatusLookupSchema>;
