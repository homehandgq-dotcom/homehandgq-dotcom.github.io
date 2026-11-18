import { createClient } from "@/lib/supabase/server";
import type { Department, GovernanceBody, LeadershipPerson } from "@/lib/supabase/types";

export async function listLeadershipByBody(body: GovernanceBody) {
  const supabase = await createClient();
  // 用 governance_bodies 数组字段做包含查询：一个人可以同时挂在多个治理机构下
  // （比如同时是董事局与执行理事会成员），这样两边页面都能显示，不用重复建档
  const { data } = await supabase
    .from("leadership_people")
    .select("*")
    .eq("is_public", true)
    .contains("governance_bodies", [body])
    .order("sort_order");
  return (data ?? []) as LeadershipPerson[];
}

export async function listTopLeadership(limit = 8) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("leadership_people")
    .select("*")
    .eq("is_public", true)
    .overlaps("governance_bodies", ["board_of_directors", "executive_council", "honorary"])
    .order("sort_order")
    .limit(limit);
  return (data ?? []) as LeadershipPerson[];
}

export async function listDepartmentsWithPeople() {
  const supabase = await createClient();
  const { data: departments } = await supabase
    .from("departments")
    .select("*")
    .order("sort_order");
  const { data: people } = await supabase
    .from("leadership_people")
    .select("*")
    .eq("is_public", true)
    .contains("governance_bodies", ["secretariat"])
    .order("sort_order");

  return {
    departments: (departments ?? []) as Department[],
    people: (people ?? []) as LeadershipPerson[],
  };
}
