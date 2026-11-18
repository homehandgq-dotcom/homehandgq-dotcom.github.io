import { createClient } from "@/lib/supabase/server";
import type { ApplicationStatus } from "@/lib/supabase/types";

export interface ApplicationFilters {
  q?: string;
  status?: ApplicationStatus | "all";
  state?: string;
  industryId?: string;
  membershipTypeId?: string;
  committeeId?: string;
  chapterId?: string;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: "created_at" | "real_name" | "status" | "state";
  sortDir?: "asc" | "desc";
  page?: number;
  pageSize?: number;
}

export async function listApplicationsAdmin(filters: ApplicationFilters) {
  const supabase = await createClient();
  const {
    q, status = "all", state, industryId, membershipTypeId, committeeId, chapterId,
    dateFrom, dateTo, sortBy = "created_at", sortDir = "desc", page = 1, pageSize = 20,
  } = filters;

  let query = supabase
    .from("member_applications")
    .select(
      "id, application_no, real_name, english_name, phone, email, company_name_zh, company_name_en, title, state, city, status, submitted_at, created_at, updated_at, reviewed_by, industry_id, membership_type_id, desired_chapter_id, desired_committee_ids, industries(name_zh), membership_types(name_zh), chapters:desired_chapter_id(name_zh), reviewer:admin_users!member_applications_reviewed_by_fkey(full_name,email)",
      { count: "exact" }
    );

  if (status !== "all") query = query.eq("status", status);
  if (state) query = query.eq("state", state);
  if (industryId) query = query.eq("industry_id", industryId);
  if (membershipTypeId) query = query.eq("membership_type_id", membershipTypeId);
  if (chapterId) query = query.eq("desired_chapter_id", chapterId);
  if (committeeId) query = query.contains("desired_committee_ids", [committeeId]);
  if (dateFrom) query = query.gte("created_at", dateFrom);
  if (dateTo) query = query.lte("created_at", dateTo);
  if (q) {
    query = query.or(
      `real_name.ilike.%${q}%,english_name.ilike.%${q}%,email.ilike.%${q}%,phone.ilike.%${q}%,company_name_zh.ilike.%${q}%,company_name_en.ilike.%${q}%,application_no.ilike.%${q}%`
    );
  }

  query = query.order(sortBy, { ascending: sortDir === "asc" });

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  const { data, count, error } = await query.range(from, to);

  if (error) console.error("[listApplicationsAdmin]", error);

  return { items: data ?? [], total: count ?? 0, page, pageSize };
}

export async function getApplicationById(id: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("member_applications")
    .select(
      "*, industries(name_zh,name_en), membership_types(name_zh,name_en), chapters:desired_chapter_id(name_zh,name_en), reviewer:admin_users!member_applications_reviewed_by_fkey(full_name,email)"
    )
    .eq("id", id)
    .maybeSingle();
  return data;
}

export async function getApplicationStats(filters: ApplicationFilters) {
  const { total } = await listApplicationsAdmin({ ...filters, page: 1, pageSize: 1 });
  return { total };
}
