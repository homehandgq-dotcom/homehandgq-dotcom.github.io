"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, FileCheck2, Users, Newspaper, CalendarDays, Users2, MapPin,
  UserCog, Handshake, FileText, FolderDown, Menu, Settings, Inbox, Mail,
  ShieldCheck, ScrollText, Heart, BookOpen, HeartHandshake, Film, Tags, type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { AdminNavItem } from "@/lib/admin/nav";

const icons: Record<string, LucideIcon> = {
  LayoutDashboard, FileCheck2, Users, Newspaper, CalendarDays, Users2, MapPin,
  UserCog, Handshake, FileText, FolderDown, Menu, Settings, Inbox, Mail,
  ShieldCheck, ScrollText, Heart, BookOpen, HeartHandshake, Film, Tags,
};

export function AdminSidebar({ items }: { items: AdminNavItem[] }) {
  const pathname = usePathname() || "";

  return (
    <nav className="flex h-full flex-col gap-1 overflow-y-auto p-3">
      {items.map((item) => {
        const Icon = icons[item.icon] || FileText;
        const active =
          item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded px-3 py-2.5 text-sm font-medium transition-colors",
              active ? "bg-navy-900 text-white" : "text-navy-100 hover:bg-white/10"
            )}
          >
            <Icon className="h-4 w-4 shrink-0" aria-hidden />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
