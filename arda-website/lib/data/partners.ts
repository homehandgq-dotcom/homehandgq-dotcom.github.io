import { createClient } from "@/lib/supabase/server";
import type { Partner } from "@/lib/supabase/types";

export async function listPartners(category?: Partner["category"]) {
  const supabase = await createClient();
  let query = supabase
    .from("partners")
    .select("*")
    .eq("status", "published")
    .order("sort_order");
  if (category) query = query.eq("category", category);
  const { data } = await query;
  return (data ?? []) as Partner[];
}

export async function getFeaturedPartners(limit = 8) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("partners")
    .select("*")
    .eq("status", "published")
    .eq("is_featured_home", true)
    .order("sort_order")
    .limit(limit);
  return (data ?? []) as Partner[];
}
