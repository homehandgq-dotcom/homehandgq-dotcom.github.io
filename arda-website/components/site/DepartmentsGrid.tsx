import { PeopleGrid } from "@/components/site/PeopleGrid";
import type { Locale } from "@/lib/i18n/config";
import type { Department, LeadershipPerson } from "@/lib/supabase/types";

/**
 * 秘书处页面：按部门分组展示秘书处、办公室及各部门（财务与基金部、
 * 国际事务与战略合作部、品牌宣传公关部、法务部）及其负责人，
 * 数据来自 departments 表 + leadership_people（governance_body = 'secretariat'）。
 * 尚未指派负责人的部门会显示"负责人待定"，与其他治理页面的 TBA 处理方式一致。
 */
export function DepartmentsGrid({
  locale,
  departments,
  people,
}: {
  locale: Locale;
  departments: Department[];
  people: LeadershipPerson[];
}) {
  return (
    <div className="space-y-12">
      {departments.map((dept) => {
        const deptPeople = people.filter((p) => p.department_ids?.includes(dept.id));
        return (
          <div key={dept.id}>
            <h2 className="mb-4 text-lg font-bold text-navy-900">
              {locale === "zh" ? dept.name_zh : dept.name_en}
            </h2>
            <PeopleGrid
              locale={locale}
              people={deptPeople}
              emptyLabel={locale === "zh" ? "负责人待定" : "Lead to be announced"}
            />
          </div>
        );
      })}
    </div>
  );
}
