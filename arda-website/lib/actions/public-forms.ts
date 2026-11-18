"use server";

import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { checkRateLimit, verifyCaptcha } from "@/lib/utils/rateLimit";
import { getRequestIp } from "@/lib/utils/audit";
import {
  membershipApplicationSchema,
  contactFormSchema,
  newsletterSchema,
  eventRegistrationSchema,
  donationInquirySchema,
  applicationStatusLookupSchema,
} from "@/lib/validation/membership";

type ActionResult<T = undefined> =
  | { ok: true; data: T }
  | { ok: false; error: string; fieldErrors?: Record<string, string[]> };

async function getClientKey(prefix: string) {
  const h = await headers();
  const ip = getRequestIp(h) ?? "unknown";
  return `${prefix}:${ip}`;
}

/** 会员入会申请提交 */
export async function submitMembershipApplication(
  raw: unknown
): Promise<ActionResult<{ application_no: string }>> {
  const parsed = membershipApplicationSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      error: "表单校验未通过 / Validation failed",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }
  if (parsed.data.website_hp) {
    return { ok: false, error: "提交被拒绝 / Submission rejected" };
  }

  const rl = await checkRateLimit(await getClientKey("membership-apply"), {
    limit: 3,
    windowMs: 10 * 60_000,
  });
  if (!rl.allowed) {
    return { ok: false, error: "提交过于频繁，请稍后再试 / Too many attempts, please try again later" };
  }

  const captchaOk = await verifyCaptcha();
  if (!captchaOk) {
    return { ok: false, error: "验证码校验失败 / CAPTCHA verification failed" };
  }

  const h = await headers();
  const ip = getRequestIp(h);
  const userAgent = h.get("user-agent");

  const supabase = await createClient();
  const { website_hp: _hp, ...data } = parsed.data;
  void _hp;

  const insertPayload = {
    ...data,
    company_website: data.company_website || null,
    industry_id: data.industry_id || null,
    desired_chapter_id: data.desired_chapter_id || null,
    ip_address: ip,
    user_agent: userAgent,
    status: "submitted" as const,
  };

  const { data: inserted, error } = await supabase
    .from("member_applications")
    .insert(insertPayload)
    .select("application_no")
    .single();

  if (error) {
    if (error.code === "23505") {
      return {
        ok: false,
        error:
          "您近期已提交过申请，正在审核中，请勿重复提交 / You already have a pending application under review.",
      };
    }
    console.error("[submitMembershipApplication]", error);
    return { ok: false, error: "提交失败，请稍后重试 / Submission failed, please try again later" };
  }

  // 邮件确认发送为预留接口：接入 Resend/SendGrid 等后取消注释
  // await sendApplicationConfirmationEmail(data.email, inserted.application_no);

  return { ok: true, data: { application_no: inserted.application_no } };
}

/** 申请状态查询 */
export async function lookupMembershipApplication(raw: unknown) {
  const parsed = applicationStatusLookupSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false as const, error: "请填写正确的申请编号与邮箱 / Please enter a valid application number and email" };
  }

  const rl = await checkRateLimit(await getClientKey("application-lookup"), {
    limit: 10,
    windowMs: 5 * 60_000,
  });
  if (!rl.allowed) {
    return { ok: false as const, error: "查询过于频繁，请稍后再试 / Too many attempts, please try again later" };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("lookup_application", {
    p_application_no: parsed.data.application_no,
    p_email: parsed.data.email,
  });

  if (error || !data || data.length === 0) {
    return { ok: false as const, error: "未找到匹配的申请记录 / No matching application found" };
  }

  return { ok: true as const, data: data[0] };
}

/** 联系表单提交 */
export async function submitContactForm(raw: unknown): Promise<ActionResult> {
  const parsed = contactFormSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      error: "表单校验未通过 / Validation failed",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }
  if (parsed.data.website_hp) return { ok: false, error: "提交被拒绝 / Submission rejected" };

  const rl = await checkRateLimit(await getClientKey("contact"), { limit: 5, windowMs: 10 * 60_000 });
  if (!rl.allowed) {
    return { ok: false, error: "提交过于频繁，请稍后再试 / Too many attempts, please try again later" };
  }

  const h = await headers();
  const ip = getRequestIp(h);
  const supabase = await createClient();
  const { website_hp: _hp, chapter_id, ...rest } = parsed.data;
  void _hp;

  const { error } = await supabase.from("contact_submissions").insert({
    ...rest,
    chapter_id: chapter_id || null,
    ip_address: ip,
  });

  if (error) {
    console.error("[submitContactForm]", error);
    return { ok: false, error: "提交失败，请稍后重试 / Submission failed, please try again later" };
  }
  return { ok: true, data: undefined };
}

/** Newsletter 订阅 */
export async function subscribeNewsletter(raw: unknown): Promise<ActionResult> {
  const parsed = newsletterSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: "请填写有效邮箱 / Please enter a valid email" };
  }
  if (parsed.data.website_hp) return { ok: false, error: "提交被拒绝 / Submission rejected" };

  const rl = await checkRateLimit(await getClientKey("newsletter"), { limit: 5, windowMs: 10 * 60_000 });
  if (!rl.allowed) {
    return { ok: false, error: "提交过于频繁，请稍后再试 / Too many attempts, please try again later" };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("newsletter_subscribers")
    .upsert(
      { email: parsed.data.email, locale_pref: parsed.data.locale_pref },
      { onConflict: "email", ignoreDuplicates: true }
    );

  if (error) {
    console.error("[subscribeNewsletter]", error);
    return { ok: false, error: "订阅失败，请稍后重试 / Subscription failed, please try again later" };
  }
  return { ok: true, data: undefined };
}

/** 活动报名 */
export async function registerForEvent(raw: unknown): Promise<ActionResult> {
  const parsed = eventRegistrationSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      error: "表单校验未通过 / Validation failed",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }
  if (parsed.data.website_hp) return { ok: false, error: "提交被拒绝 / Submission rejected" };

  const rl = await checkRateLimit(await getClientKey("event-register"), { limit: 5, windowMs: 10 * 60_000 });
  if (!rl.allowed) {
    return { ok: false, error: "提交过于频繁，请稍后再试 / Too many attempts, please try again later" };
  }

  const supabase = await createClient();

  // 检查活动是否已截止报名 / 是否已满员
  const { data: event } = await supabase
    .from("events")
    .select("id, capacity, registration_deadline, event_status")
    .eq("id", parsed.data.event_id)
    .maybeSingle();

  if (!event || event.event_status === "cancelled") {
    return { ok: false, error: "活动不存在或已取消 / Event not found or cancelled" };
  }
  if (event.registration_deadline && new Date(event.registration_deadline) < new Date()) {
    return { ok: false, error: "报名已截止 / Registration has closed" };
  }

  let status: "registered" | "waitlisted" = "registered";
  if (event.capacity) {
    const { count } = await supabase
      .from("event_registrations")
      .select("*", { count: "exact", head: true })
      .eq("event_id", event.id)
      .in("status", ["registered", "attended"]);
    if ((count ?? 0) >= event.capacity) status = "waitlisted";
  }

  const { website_hp: _hp, ...rest } = parsed.data;
  void _hp;

  const { error } = await supabase.from("event_registrations").insert({ ...rest, status });
  if (error) {
    console.error("[registerForEvent]", error);
    return { ok: false, error: "报名失败，请稍后重试 / Registration failed, please try again later" };
  }
  return { ok: true, data: undefined };
}

/** 捐赠 / 赞助咨询 */
export async function submitDonationInquiry(raw: unknown): Promise<ActionResult> {
  const parsed = donationInquirySchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      error: "表单校验未通过 / Validation failed",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }
  if (parsed.data.website_hp) return { ok: false, error: "提交被拒绝 / Submission rejected" };

  const rl = await checkRateLimit(await getClientKey("donation-inquiry"), { limit: 5, windowMs: 10 * 60_000 });
  if (!rl.allowed) {
    return { ok: false, error: "提交过于频繁，请稍后再试 / Too many attempts, please try again later" };
  }

  const supabase = await createClient();
  const { website_hp: _hp, ...rest } = parsed.data;
  void _hp;

  const { error } = await supabase.from("donations_or_sponsorship_inquiries").insert(rest);
  if (error) {
    console.error("[submitDonationInquiry]", error);
    return { ok: false, error: "提交失败，请稍后重试 / Submission failed, please try again later" };
  }
  return { ok: true, data: undefined };
}
