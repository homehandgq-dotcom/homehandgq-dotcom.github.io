import { createClient } from "@/lib/supabase/server";
import type { MembershipType } from "@/lib/supabase/types";

export async function listMembershipTypes() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("membership_types")
    .select("*")
    .eq("is_active", true)
    .order("sort_order");
  return (data ?? []) as MembershipType[];
}

export async function listIndustries() {
  const supabase = await createClient();
  const { data } = await supabase.from("industries").select("*").order("sort_order");
  return data ?? [];
}

export interface PublicMember {
  id: string;
  display_name_zh: string;
  display_name_en: string;
  company_name_zh: string | null;
  company_name_en: string | null;
  logo_url: string | null;
  city: string | null;
  state: string | null;
  industry_id: string | null;
  website: string | null;
  membership_type_id: string;
}

export async function listPublicMembers(params: {
  q?: string;
  state?: string;
  membershipTypeId?: string;
  page?: number;
  pageSize?: number;
} = {}) {
  const { q, state, membershipTypeId, page = 1, pageSize = 12 } = params;
  const supabase = await createClient();

  let query = supabase
    .from("members")
    .select("*", { count: "exact" })
    .eq("is_public", true)
    .eq("status", "active")
    .order("member_since", { ascending: false });

  if (state) query = query.eq("state", state);
  if (membershipTypeId) query = query.eq("membership_type_id", membershipTypeId);
  if (q) {
    query = query.or(
      `display_name_zh.ilike.%${q}%,display_name_en.ilike.%${q}%,company_name_zh.ilike.%${q}%,company_name_en.ilike.%${q}%`
    );
  }

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  const { data, count } = await query.range(from, to);
  return { items: (data ?? []) as PublicMember[], total: count ?? 0, page, pageSize };
}

export async function getFeaturedMembers(limit = 8) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("members")
    .select("*")
    .eq("is_public", true)
    .eq("status", "active")
    .order("member_since", { ascending: false })
    .limit(limit);
  return (data ?? []) as PublicMember[];
}

export async function listFaqs(group: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("faq_items")
    .select("*")
    .eq("group", group)
    .order("sort_order");
  return data ?? [];
}
