"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus } from "lucide-react";
import { createAdminUser, updateAdminUser } from "@/lib/actions/admin-users";
import { Badge } from "@/components/ui/primitives";

const ROLE_LABEL: Record<string, string> = {
  super_admin: "超级管理员",
  content_admin: "内容管理员",
  membership_admin: "会员管理员",
  chapter_admin: "分会管理员",
  viewer: "只读查看",
};

interface UserRow {
  id: string;
  email: string;
  full_name: string | null;
  is_active: boolean;
  last_login_at: string | null;
  role_key: string;
  assigned_chapter_id: string | null;
}

export function UsersManager({
  users,
  chapters,
  currentAdminId,
}: {
  users: UserRow[];
  chapters: { value: string; label: string }[];
  currentAdminId: string;
}) {
  const router = useRouter();
  const [showCreate, setShowCreate] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button
          onClick={() => setShowCreate((v) => !v)}
          className="flex items-center gap-1.5 rounded bg-navy-900 px-4 py-2.5 text-sm font-bold text-white hover:bg-navy-800"
        >
          <Plus className="h-4 w-4" aria-hidden /> 新建后台账号
        </button>
      </div>

      {showCreate && (
        <CreateUserForm chapters={chapters} onDone={() => { setShowCreate(false); router.refresh(); }} />
      )}

      <div className="overflow-x-auto rounded-lg border border-navy-100 bg-white">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead className="border-b border-navy-100 bg-mist text-xs font-semibold uppercase text-ink-500">
            <tr>
              <th className="px-3 py-3">邮箱</th>
              <th className="px-3 py-3">姓名</th>
              <th className="px-3 py-3">角色</th>
              <th className="px-3 py-3">指派分会</th>
              <th className="px-3 py-3">状态</th>
              <th className="px-3 py-3">最近登录</th>
              <th className="px-3 py-3">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-navy-100">
            {users.map((u) => (
              <UserRowEditor key={u.id} user={u} chapters={chapters} isSelf={u.id === currentAdminId} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function CreateUserForm({
  chapters,
  onDone,
}: {
  chapters: { value: string; label: string }[];
  onDone: () => void;
}) {
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [roleKey, setRoleKey] = useState("content_admin");
  const [chapterId, setChapterId] = useState("");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const res = await createAdminUser({
        email,
        full_name: fullName,
        password,
        role_key: roleKey,
        assigned_chapter_id: chapterId || undefined,
      });
      if (res.ok) onDone();
      else setError(res.error);
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border border-gold-300 bg-gold-50 p-6">
      <h3 className="text-sm font-bold text-navy-900">新建后台账号</h3>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="block space-y-1.5">
          <span className="text-xs font-semibold text-ink-500">邮箱</span>
          <input type="email" required className="input" value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
        <label className="block space-y-1.5">
          <span className="text-xs font-semibold text-ink-500">姓名</span>
          <input required className="input" value={fullName} onChange={(e) => setFullName(e.target.value)} />
        </label>
        <label className="block space-y-1.5">
          <span className="text-xs font-semibold text-ink-500">初始密码（至少 8 位，建议登录后立即修改）</span>
          <input
            type="text"
            required
            minLength={8}
            className="input font-mono"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>
        <label className="block space-y-1.5">
          <span className="text-xs font-semibold text-ink-500">角色</span>
          <select className="input" value={roleKey} onChange={(e) => setRoleKey(e.target.value)}>
            {Object.entries(ROLE_LABEL).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
        </label>
        {roleKey === "chapter_admin" && (
          <label className="block space-y-1.5 sm:col-span-2">
            <span className="text-xs font-semibold text-ink-500">指派分会</span>
            <select className="input" value={chapterId} onChange={(e) => setChapterId(e.target.value)}>
              <option value="">请选择分会</option>
              {chapters.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={pending}
          className="flex items-center gap-2 rounded bg-navy-900 px-5 py-2.5 text-sm font-bold text-white disabled:opacity-60"
        >
          {pending && <Loader2 className="h-4 w-4 animate-spin" />} 创建账号
        </button>
      </div>
    </form>
  );
}

function UserRowEditor({
  user,
  chapters,
  isSelf,
}: {
  user: UserRow;
  chapters: { value: string; label: string }[];
  isSelf: boolean;
}) {
  const router = useRouter();
  const [roleKey, setRoleKey] = useState(user.role_key);
  const [chapterId, setChapterId] = useState(user.assigned_chapter_id || "");
  const [isActive, setIsActive] = useState(user.is_active);
  const [pending, startTransition] = useTransition();
  const [dirty, setDirty] = useState(false);

  function save() {
    startTransition(async () => {
      await updateAdminUser({
        id: user.id,
        role_key: roleKey,
        assigned_chapter_id: chapterId || undefined,
        is_active: isActive,
      });
      setDirty(false);
      router.refresh();
    });
  }

  return (
    <tr className="hover:bg-mist/60">
      <td className="whitespace-nowrap px-3 py-3 text-navy-900">{user.email}</td>
      <td className="whitespace-nowrap px-3 py-3 text-ink-600">{user.full_name || "—"}</td>
      <td className="whitespace-nowrap px-3 py-3">
        <select
          value={roleKey}
          disabled={isSelf}
          onChange={(e) => {
            setRoleKey(e.target.value);
            setDirty(true);
          }}
          className="rounded border border-navy-200 px-2 py-1 text-xs disabled:opacity-50"
        >
          {Object.entries(ROLE_LABEL).map(([k, v]) => (
            <option key={k} value={k}>
              {v}
            </option>
          ))}
        </select>
      </td>
      <td className="whitespace-nowrap px-3 py-3">
        {roleKey === "chapter_admin" ? (
          <select
            value={chapterId}
            onChange={(e) => {
              setChapterId(e.target.value);
              setDirty(true);
            }}
            className="rounded border border-navy-200 px-2 py-1 text-xs"
          >
            <option value="">未指派</option>
            {chapters.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        ) : (
          <span className="text-ink-300">—</span>
        )}
      </td>
      <td className="whitespace-nowrap px-3 py-3">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={isActive}
            disabled={isSelf}
            onChange={(e) => {
              setIsActive(e.target.checked);
              setDirty(true);
            }}
          />
          <Badge tone={isActive ? "green" : "red"}>{isActive ? "启用" : "已停用"}</Badge>
        </label>
      </td>
      <td className="whitespace-nowrap px-3 py-3 text-xs text-ink-500">
        {user.last_login_at ? new Date(user.last_login_at).toLocaleString("zh-CN") : "从未登录"}
      </td>
      <td className="whitespace-nowrap px-3 py-3">
        <button
          onClick={save}
          disabled={!dirty || pending || isSelf}
          className="rounded bg-navy-900 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-40"
        >
          保存
        </button>
      </td>
    </tr>
  );
}
