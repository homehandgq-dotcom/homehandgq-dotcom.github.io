"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { getCurrentAdmin } from "@/lib/auth/admin";
import { writeAuditLog, getRequestIp } from "@/lib/utils/audit";

type ActionResult = { ok: true } | { ok: false; error: string };

async function requireLoggedInAdmin() {
  const admin = await getCurrentAdmin();
  if (!admin) throw new Error("UNAUTHENTICATED");
  return admin;
}

// ---------- 联系与咨询 (contact_submissions) ----------

export async function updateContactStatus(id: string, status: "new" | "in_progress" | "resolved"): Promise<ActionResult> {
  try {
    const admin = await requireLoggedInAdmin();
    const supabase = await createClient();
    const { error } = await supabase.from("contact_submissions").update({ status, assigned_to: admin.id }).eq("id", id);
    if (error) return { ok: false, error: error.message };

    await writeAuditLog({ actorId: admin.id, action: "contact_submissions.status_change", entityTable: "contact_submissions", entityId: id, afterJson: { status } });
    revalidatePath("/admin/contact-submissions");
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "操作失败" };
  }
}

export async function deleteContactSubmission(id: string): Promise<ActionResult> {
  try {
    const admin = await requireLoggedInAdmin();
    if (admin.role.key !== "super_admin") return { ok: false, error: "仅超级管理员可删除" };
    const supabase = await createClient();
    const { data: before } = await supabase.from("contact_submissions").select("*").eq("id", id).maybeSingle();
    const { error } = await supabase.from("contact_submissions").delete().eq("id", id);
    if (error) return { ok: false, error: error.message };

    const h = await headers();
    await writeAuditLog({ actorId: admin.id, action: "contact_submissions.delete", entityTable: "contact_submissions", entityId: id, beforeJson: before, ipAddress: getRequestIp(h) });
    revalidatePath("/admin/contact-submissions");
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "删除失败" };
  }
}

// ---------- 捐赠与赞助意向 (donations_or_sponsorship_inquiries) ----------

export async function updateDonationInquiryStatus(id: string, status: "new" | "in_progress" | "resolved"): Promise<ActionResult> {
  try {
    const admin = await requireLoggedInAdmin();
    const supabase = await createClient();
    const { error } = await supabase.from("donations_or_sponsorship_inquiries").update({ status }).eq("id", id);
    if (error) return { ok: false, error: error.message };

    await writeAuditLog({ actorId: admin.id, action: "donation_inquiries.status_change", entityTable: "donations_or_sponsorship_inquiries", entityId: id, afterJson: { status } });
    revalidatePath("/admin/donation-inquiries");
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "操作失败" };
  }
}

export async function deleteDonationInquiry(id: string): Promise<ActionResult> {
  try {
    const admin = await requireLoggedInAdmin();
    if (admin.role.key !== "super_admin") return { ok: false, error: "仅超级管理员可删除" };
    const supabase = await createClient();
    const { data: before } = await supabase.from("donations_or_sponsorship_inquiries").select("*").eq("id", id).maybeSingle();
    const { error } = await supabase.from("donations_or_sponsorship_inquiries").delete().eq("id", id);
    if (error) return { ok: false, error: error.message };

    const h = await headers();
    await writeAuditLog({ actorId: admin.id, action: "donation_inquiries.delete", entityTable: "donations_or_sponsorship_inquiries", entityId: id, beforeJson: before, ipAddress: getRequestIp(h) });
    revalidatePath("/admin/donation-inquiries");
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "删除失败" };
  }
}

// ---------- 订阅名单 (newsletter_subscribers) ----------

export async function deleteNewsletterSubscriber(id: string): Promise<ActionResult> {
  try {
    const admin = await requireLoggedInAdmin();
    const supabase = await createClient();
    const { data: before } = await supabase.from("newsletter_subscribers").select("*").eq("id", id).maybeSingle();
    const { error } = await supabase.from("newsletter_subscribers").delete().eq("id", id);
    if (error) return { ok: false, error: error.message };

    const h = await headers();
    await writeAuditLog({ actorId: admin.id, action: "newsletter_subscribers.delete", entityTable: "newsletter_subscribers", entityId: id, beforeJson: before, ipAddress: getRequestIp(h) });
    revalidatePath("/admin/newsletter");
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "删除失败" };
  }
}
