"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateSiteSetting } from "@/lib/actions/admin-settings";

export function JsonSettingEditor({ settingKey, initialJson }: { settingKey: string; initialJson: string }) {
  const router = useRouter();
  const [text, setText] = useState(initialJson);
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  function handleSave() {
    setMessage(null);
    startTransition(async () => {
      const res = await updateSiteSetting(settingKey, text);
      if (res.ok) {
        setMessage({ type: "success", text: "已保存" });
        router.refresh();
      } else {
        setMessage({ type: "error", text: res.error });
      }
    });
  }

  return (
    <div className="space-y-4">
      <textarea
        rows={20}
        className="input w-full font-mono text-xs leading-relaxed"
        value={text}
        onChange={(e) => setText(e.target.value)}
        spellCheck={false}
      />
      {message && (
        <p className={`text-sm ${message.type === "success" ? "text-green-700" : "text-red-600"}`}>
          {message.text}
        </p>
      )}
      <button
        onClick={handleSave}
        disabled={pending}
        className="rounded bg-navy-900 px-6 py-2.5 text-sm font-bold text-white disabled:opacity-60"
      >
        保存
      </button>
    </div>
  );
}
