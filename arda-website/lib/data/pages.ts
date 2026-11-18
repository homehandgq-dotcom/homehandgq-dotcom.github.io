import { createClient } from "@/lib/supabase/server";
import type { Page } from "@/lib/supabase/types";

export async function getPageBySlug(group: Page["group"], slug: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("pages")
    .select("*")
    .eq("group", group)
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();
  return data as Page | null;
}

export async function listPagesByGroup(group: Page["group"]) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("pages")
    .select("*")
    .eq("group", group)
    .eq("status", "published")
    .order("sort_order");
  return (data ?? []) as Page[];
}
