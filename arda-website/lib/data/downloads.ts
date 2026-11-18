import { createClient } from "@/lib/supabase/server";
import type { Download } from "@/lib/supabase/types";

export async function listDownloads(category?: Download["category"]) {
  const supabase = await createClient();
  let query = supabase
    .from("downloads")
    .select("*")
    .eq("status", "published")
    .order("sort_order");
  if (category) query = query.eq("category", category);
  const { data } = await query;
  return (data ?? []) as Download[];
}
