"use client";

import { deleteNewsletterSubscriber } from "@/lib/actions/admin-inbox";
import { InboxTable } from "@/components/admin/InboxTable";
import { Badge } from "@/components/ui/primitives";

export interface SubscriberRow {
  id: string;
  email: string;
  locale_pref: string;
  is_confirmed: boolean;
  subscribed_at: string;
  unsubscribed_at: string | null;
}

/** 见 ContactSubmissionsInbox.tsx 顶部注释——同样的原因，columns/titleOf
 * 必须在这个 Client Component 内部定义，不能从 page.tsx 当 props 传进来。 */
export function NewsletterInbox({ rows, canDelete }: { rows: SubscriberRow[]; canDelete: boolean }) {
  return (
    <InboxTable
      rows={rows}
      titleOf={(r) => r.email}
      canDelete={canDelete}
      onDelete={deleteNewsletterSubscriber}
      columns={[
        { key: "email", label: "邮箱", render: (r) => r.email },
        { key: "locale_pref", label: "语言偏好", render: (r) => (r.locale_pref === "zh" ? "中文" : "English") },
        {
          key: "is_confirmed",
          label: "确认状态",
          render: (r) => <Badge tone={r.is_confirmed ? "green" : "neutral"}>{r.is_confirmed ? "已确认" : "待确认"}</Badge>,
        },
        { key: "subscribed_at", label: "订阅时间", render: (r) => new Date(r.subscribed_at).toLocaleDateString("zh-CN") },
      ]}
    />
  );
}
