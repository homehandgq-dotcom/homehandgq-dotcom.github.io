import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { Locale } from "@/lib/i18n/config";

export interface Crumb {
  label: string;
  href?: string;
}

export function Breadcrumbs({ locale, items }: { locale: Locale; items: Crumb[] }) {
  const homeLabel = locale === "zh" ? "首页" : "Home";
  return (
    <nav aria-label="Breadcrumb" className="border-b border-navy-100 bg-mist">
      <div className="container-arda flex flex-wrap items-center gap-1.5 py-3 text-sm text-ink-600">
        <Link href={`/${locale}`} className="hover:text-navy-900">
          {homeLabel}
        </Link>
        {items.map((item, i) => (
          <span key={i} className="flex items-center gap-1.5">
            <ChevronRight className="h-3.5 w-3.5 text-ink-400" aria-hidden />
            {item.href ? (
              <Link href={item.href} className="hover:text-navy-900">
                {item.label}
              </Link>
            ) : (
              <span className="font-medium text-navy-900" aria-current="page">
                {item.label}
              </span>
            )}
          </span>
        ))}
      </div>
    </nav>
  );
}
