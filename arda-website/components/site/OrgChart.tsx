import Image from "next/image";
import type { Locale } from "@/lib/i18n/config";

/**
 * 协会组织架构图：应客户要求，直接使用设计好的静态架构图图片展示，
 * 不再从数据库动态拼接节点。如需更新架构图内容（比如人员调整），
 * 需要重新设计一张新图替换 public/images/org-chart.jpg。
 */
export function OrgChart({ locale }: { locale: Locale }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-navy-100 bg-mist p-4 lg:p-8">
      <Image
        src="/images/org-chart.jpg"
        alt={locale === "zh" ? "美国餐饮业发展协会组织架构图" : "ARDA Organizational Chart"}
        width={2000}
        height={2461}
        className="mx-auto h-auto w-full max-w-4xl"
        sizes="(max-width: 1024px) 100vw, 900px"
        priority
      />
    </div>
  );
}
