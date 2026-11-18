"use client";

import { updateDonationInquiryStatus, deleteDonationInquiry } from "@/lib/actions/admin-inbox";
import { InboxTable } from "@/components/admin/InboxTable";
import { Badge } from "@/components/ui/primitives";

const TYPE_LABEL: Record<string, string> = {
  donation: "捐赠",
  corporate_sponsorship: "企业赞助",
  event_sponsorship: "活动赞助",
};

export interface DonationRow {
  id: string;
  inquiry_type: string;
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  amount_range: string | null;
  message: string | null;
  status: string;
  created_at: string;
}

/** 见 ContactSubmissionsInbox.tsx 顶部注释——同样的原因，columns/titleOf
 * 必须在这个 Client Component 内部定义，不能从 page.tsx 当 props 传进来。 */
export function DonationInquiriesInbox({ rows, canDelete }: { rows: DonationRow[]; canDelete: boolean }) {
  return (
    <InboxTable
      rows={rows}
      titleOf={(r) => `${r.name} · ${TYPE_LABEL[r.inquiry_type]}`}
      canDelete={canDelete}
      onStatusChange={updateDonationInquiryStatus}
      onDelete={deleteDonationInquiry}
      columns={[
        {
          key: "inquiry_type",
          label: "类型",
          render: (r) => <Badge tone="gold">{TYPE_LABEL[r.inquiry_type] || r.inquiry_type}</Badge>,
        },
        {
          key: "contact",
          label: "联系人",
          render: (r) => (
            <div>
              <div className="font-medium text-navy-900">{r.name}</div>
              <div className="text-xs text-ink-400">
                {r.email}
                {r.phone ? ` · ${r.phone}` : ""}
              </div>
            </div>
          ),
        },
        { key: "company", label: "公司", render: (r) => r.company || "—" },
        { key: "amount_range", label: "意向金额区间", render: (r) => r.amount_range || "—" },
        {
          key: "message",
          label: "留言",
          render: (r) => <div className="line-clamp-2 max-w-sm text-xs text-ink-500">{r.message || "—"}</div>,
        },
        { key: "created_at", label: "提交时间", render: (r) => new Date(r.created_at).toLocaleString("zh-CN") },
      ]}
    />
  );
}
