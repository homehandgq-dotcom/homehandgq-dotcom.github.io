import { createClient } from "@/lib/supabase/server";
import type { EventItem } from "@/lib/supabase/types";

export async function listEvents(params: {
  when?: "upcoming" | "past" | "all";
  category?: string;
  page?: number;
  pageSize?: number;
} = {}) {
  const { when = "all", category, page = 1, pageSize = 9 } = params;
  const supabase = await createClient();

  let query = supabase
    .from("events")
    .select("*", { count: "exact" })
    .eq("status", "published");

  if (when === "upcoming") {
    query = query.in("event_status", ["upcoming", "ongoing"]).order("start_at", { ascending: true });
  } else if (when === "past") {
    query = query.eq("event_status", "past").order("start_at", { ascending: false });
  } else {
    query = query.order("start_at", { ascending: false });
  }

  if (category && category !== "all") {
    query = query.eq("category", category);
  }

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  const { data, count } = await query.range(from, to);
  return { items: (data ?? []) as EventItem[], total: count ?? 0, page, pageSize };
}

export async function getUpcomingEvents(limit = 3) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("events")
    .select("*")
    .eq("status", "published")
    .in("event_status", ["upcoming", "ongoing"])
    .order("start_at", { ascending: true })
    .limit(limit);
  return (data ?? []) as EventItem[];
}

export async function getEventBySlug(slug: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("events")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();
  return data as EventItem | null;
}

export async function countEventRegistrations(eventId: string) {
  const supabase = await createClient();
  const { count } = await supabase
    .from("event_registrations")
    .select("*", { count: "exact", head: true })
    .eq("event_id", eventId)
    .in("status", ["registered", "attended"]);
  return count ?? 0;
}
