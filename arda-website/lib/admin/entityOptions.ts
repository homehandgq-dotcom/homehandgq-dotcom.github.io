import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { FieldOption } from "@/lib/admin/entityRegistry";

interface RelationDef {
  table: string;
  selectCols: string;
  buildLabel: (row: Record<string, unknown>) => string;
  orderBy: string;
}

const RELATION_DEFS: Record<string, RelationDef> = {
  news_categories: {
    table: "news_categories",
    selectCols: "id, name_zh, sort_order",
    buildLabel: (r) => `${r.name_zh as string}`,
    orderBy: "sort_order",
  },
  video_categories: {
    table: "video_categories",
    selectCols: "id, name_zh, sort_order",
    buildLabel: (r) => `${r.name_zh as string}`,
    orderBy: "sort_order",
  },
  leadership_people: {
    table: "leadership_people",
    selectCols: "id, name_zh, title_zh, sort_order",
    buildLabel: (r) => `${r.name_zh as string} · ${r.title_zh as string}`,
    orderBy: "sort_order",
  },
  departments: {
    table: "departments",
    selectCols: "id, name_zh, sort_order",
    buildLabel: (r) => `${r.name_zh as string}`,
    orderBy: "sort_order",
  },
  committees: {
    table: "committees",
    selectCols: "id, name_zh, sort_order",
    buildLabel: (r) => `${r.name_zh as string}`,
    orderBy: "sort_order",
  },
  chapters: {
    table: "chapters",
    selectCols: "id, name_zh, sort_order",
    buildLabel: (r) => `${r.name_zh as string}`,
    orderBy: "sort_order",
  },
  membership_types: {
    table: "membership_types",
    selectCols: "id, name_zh, sort_order",
    buildLabel: (r) => `${r.name_zh as string}`,
    orderBy: "sort_order",
  },
  industries: {
    table: "industries",
    selectCols: "id, name_zh, sort_order",
    buildLabel: (r) => `${r.name_zh as string}`,
    orderBy: "sort_order",
  },
  navigation_items: {
    table: "navigation_items",
    selectCols: "id, label_zh, menu, sort_order",
    buildLabel: (r) => `[${r.menu as string}] ${r.label_zh as string}`,
    orderBy: "sort_order",
  },
};

/** 批量加载表单下拉框所需的关联数据选项（如所属分会/委员会/召集人等） */
export async function loadRelationOptions(
  relationKeys: string[]
): Promise<Record<string, FieldOption[]>> {
  if (relationKeys.length === 0) return {};
  const supabase = await createClient();
  const result: Record<string, FieldOption[]> = {};

  await Promise.all(
    relationKeys.map(async (key) => {
      const def = RELATION_DEFS[key];
      if (!def) {
        result[key] = [];
        return;
      }
      const { data } = await supabase
        .from(def.table)
        .select(def.selectCols)
        .order(def.orderBy, { ascending: true });
      const rows = (data ?? []) as unknown as Record<string, unknown>[];
      result[key] = rows.map((row) => ({
        value: row.id as string,
        label: def.buildLabel(row),
      }));
    })
  );

  return result;
}
