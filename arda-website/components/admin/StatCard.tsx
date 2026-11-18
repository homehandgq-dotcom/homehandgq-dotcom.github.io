import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export function StatCard({
  label,
  value,
  icon: Icon,
  tone = "navy",
}: {
  label: string;
  value: number | string;
  icon: LucideIcon;
  tone?: "navy" | "gold" | "green" | "red";
}) {
  const toneClass: Record<string, string> = {
    navy: "bg-navy-50 text-navy-800",
    gold: "bg-gold-100 text-gold-700",
    green: "bg-green-50 text-green-700",
    red: "bg-red-50 text-red-700",
  };
  return (
    <div className="rounded-lg border border-navy-100 bg-white p-5">
      <div className="flex items-center justify-between">
        <span className={cn("flex h-10 w-10 items-center justify-center rounded-full", toneClass[tone])}>
          <Icon className="h-5 w-5" aria-hidden />
        </span>
      </div>
      <p className="mt-4 text-2xl font-extrabold text-navy-900">{value}</p>
      <p className="mt-1 text-xs font-medium text-ink-500">{label}</p>
    </div>
  );
}
