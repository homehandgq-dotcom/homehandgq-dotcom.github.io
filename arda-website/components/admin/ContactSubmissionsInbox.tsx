"use client";

import { updateContactStatus, deleteContactSubmission } from "@/lib/actions/admin-inbox";
import { InboxTable } from "@/components/admin/InboxTable";
import { Badge } from "@/components/ui/primitives";

const TYPE_LABEL: Record<string, string> = {
  general: "一般咨询",
  media: "媒体合作",
  business: "商务合作",
  membership: "会员相关",
  chapter: "分会相关",
  donation: "捐赠相关",
};

export interface ContactRow {
  id: string;
  type: string;
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  subject: string | null;
  message: string;
  status: string;
  created_at: string;
  chapter_id: string | null;
  chapters?: { name_zh: string } | null;
}

/**
 * "联系与咨询"列表——独立成一个 Client Component 是关键：columns/titleOf 这些
 * 渲染函数必须在客户端组件内部定义并直接消费，不能由 page.tsx（Server
 * Component）定义好再当 props 传进来。之前就是反过来写的，导致线上报错
 * "Functions cannot be passed directly to Client Components"，页面整个崩溃。
 * onStatusChange/onDelete 这两个是真正的 Server Action（"use server"），
 * 直接在这里 import 使用，这是官方文档里 Server Function 用于 Client
 * Component 的标准写法，跟传函数 props 是两回事。
 */
export function ContactSubmissionsInbox({ rows, canDelete }: { rows: ContactRow[]; canDelete: boolean }) {
  return (
    <InboxTable
      rows={rows}
      titleOf={(r) => `${r.name} · ${r.subject || TYPE_LABEL[r.type]}`}
      canDelete={canDelete}
      onStatusChange={updateContactStatus}
      onDelete={deleteContactSubmission}
      columns={[
        { key: "type", label: "类型", render: (r) => <Badge tone="navy">{TYPE_LABEL[r.type] || r.type}</Badge> },
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
        { key: "company", label: "公司/分会", render: (r) => r.company || r.chapters?.name_zh || "—" },
        {
          key: "message",
          label: "留言内容",
          render: (r) => (
            <div className="max-w-sm">
              {r.subject && <div className="font-medium text-navy-800">{r.subject}</div>}
              <div className="line-clamp-2 text-xs text-ink-500">{r.message}</div>
            </div>
          ),
        },
        { key: "created_at", label: "提交时间", render: (r) => new Date(r.created_at).toLocaleString("zh-CN") },
      ]}
    />
  );
}
