import { createClient } from "@/lib/supabase/server";

export interface DashboardData {
  totalMembers: number;
  monthNewApplications: number;
  pendingReview: number;
  approved: number;
  rejected: number;
  corporateMembers: number;
  individualMembers: number;
  byMembershipType: { key: string; label: string; value: number }[];
  byState: { key: string; value: number }[];
  byIndustry: { key: string; label: string; value: number }[];
  byChapter: { key: string; label: string; value: number }[];
  trend30d: { date: string; count: number }[];
  trend12m: { month: string; count: number }[];
  recentApplications: {
    id: string;
    application_no: string;
    real_name: string;
    company_name_zh: string | null;
    status: string;
    created_at: string;
  }[];
  upcomingEvents: { id: string; title_zh: string; start_at: string }[];
  pendingContacts: number;
}

export async function getDashboardData(): Promise<DashboardData> {
  const supabase = await createClient();

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const twelveMonthsAgo = new Date();
  twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 11);
  twelveMonthsAgo.setDate(1);

  const [
    totalMembersRes,
    monthNewRes,
    pendingRes,
    approvedRes,
    rejectedRes,
    membershipTypesRes,
    industriesRes,
    chaptersRes,
    applicationsForAgg,
    recentApplicationsRes,
    upcomingEventsRes,
    pendingContactsRes,
  ] = await Promise.all([
    supabase.from("members").select("*", { count: "exact", head: true }).eq("status", "active"),
    supabase
      .from("member_applications")
      .select("*", { count: "exact", head: true })
      .gte("created_at", startOfMonth.toISOString()),
    supabase
      .from("member_applications")
      .select("*", { count: "exact", head: true })
      .in("status", ["submitted", "under_review", "more_info_required"]),
    supabase.from("member_applications").select("*", { count: "exact", head: true }).eq("status", "approved"),
    supabase.from("member_applications").select("*", { count: "exact", head: true }).eq("status", "rejected"),
    supabase.from("membership_types").select("id, key, name_zh"),
    supabase.from("industries").select("id, key, name_zh"),
    supabase.from("chapters").select("id, name_zh"),
    supabase
      .from("member_applications")
      .select("id, membership_type_id, state, industry_id, desired_chapter_id, created_at")
      .gte("created_at", twelveMonthsAgo.toISOString()),
    supabase
      .from("member_applications")
      .select("id, application_no, real_name, company_name_zh, status, created_at")
      .order("created_at", { ascending: false })
      .limit(8),
    supabase
      .from("events")
      .select("id, title_zh, start_at")
      .eq("status", "published")
      .in("event_status", ["upcoming", "ongoing"])
      .order("start_at", { ascending: true })
      .limit(5),
    supabase.from("contact_submissions").select("*", { count: "exact", head: true }).eq("status", "new"),
  ]);

  const membershipTypes = membershipTypesRes.data ?? [];
  const industries = industriesRes.data ?? [];
  const chapters = chaptersRes.data ?? [];
  const rows = applicationsForAgg.data ?? [];

  const byMembershipTypeMap = new Map<string, number>();
  const byStateMap = new Map<string, number>();
  const byIndustryMap = new Map<string, number>();
  const byChapterMap = new Map<string, number>();
  const byDayMap = new Map<string, number>();
  const byMonthMap = new Map<string, number>();

  for (const row of rows) {
    if (row.membership_type_id) {
      byMembershipTypeMap.set(row.membership_type_id, (byMembershipTypeMap.get(row.membership_type_id) || 0) + 1);
    }
    if (row.state) byStateMap.set(row.state, (byStateMap.get(row.state) || 0) + 1);
    if (row.industry_id) byIndustryMap.set(row.industry_id, (byIndustryMap.get(row.industry_id) || 0) + 1);
    if (row.desired_chapter_id) byChapterMap.set(row.desired_chapter_id, (byChapterMap.get(row.desired_chapter_id) || 0) + 1);

    const created = new Date(row.created_at);
    if (created >= thirtyDaysAgo) {
      const dayKey = created.toISOString().slice(0, 10);
      byDayMap.set(dayKey, (byDayMap.get(dayKey) || 0) + 1);
    }
    const monthKey = `${created.getFullYear()}-${String(created.getMonth() + 1).padStart(2, "0")}`;
    byMonthMap.set(monthKey, (byMonthMap.get(monthKey) || 0) + 1);
  }

  const trend30d: { date: string; count: number }[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
    const key = d.toISOString().slice(0, 10);
    trend30d.push({ date: key.slice(5), count: byDayMap.get(key) || 0 });
  }

  const trend12m: { month: string; count: number }[] = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date();
    d.setDate(1);
    d.setMonth(d.getMonth() - i);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    trend12m.push({ month: key, count: byMonthMap.get(key) || 0 });
  }

  const corporateType = membershipTypes.find((t) => t.key === "corporate");
  const individualType = membershipTypes.find((t) => t.key === "individual");

  return {
    totalMembers: totalMembersRes.count ?? 0,
    monthNewApplications: monthNewRes.count ?? 0,
    pendingReview: pendingRes.count ?? 0,
    approved: approvedRes.count ?? 0,
    rejected: rejectedRes.count ?? 0,
    corporateMembers: corporateType ? byMembershipTypeMap.get(corporateType.id) || 0 : 0,
    individualMembers: individualType ? byMembershipTypeMap.get(individualType.id) || 0 : 0,
    byMembershipType: membershipTypes.map((t) => ({
      key: t.key,
      label: t.name_zh,
      value: byMembershipTypeMap.get(t.id) || 0,
    })),
    byState: Array.from(byStateMap.entries())
      .map(([key, value]) => ({ key, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10),
    byIndustry: industries.map((i) => ({ key: i.key, label: i.name_zh, value: byIndustryMap.get(i.id) || 0 })),
    byChapter: chapters
      .map((c) => ({ key: c.id, label: c.name_zh, value: byChapterMap.get(c.id) || 0 }))
      .filter((c) => c.value > 0)
      .sort((a, b) => b.value - a.value),
    trend30d,
    trend12m,
    recentApplications: recentApplicationsRes.data ?? [],
    upcomingEvents: upcomingEventsRes.data ?? [],
    pendingContacts: pendingContactsRes.count ?? 0,
  };
}
