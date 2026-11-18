import Link from "next/link";
import { cn } from "@/lib/utils/cn";

export function Pagination({
  page,
  pageSize,
  total,
  buildHref,
}: {
  page: number;
  pageSize: number;
  total: number;
  buildHref: (page: number) => string;
}) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1).filter(
    (p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1
  );

  return (
    <nav aria-label="Pagination" className="mt-10 flex items-center justify-center gap-1">
      <Link
        href={buildHref(Math.max(1, page - 1))}
        aria-disabled={page === 1}
        className={cn(
          "rounded border border-navy-200 px-3 py-2 text-sm",
          page === 1 ? "pointer-events-none opacity-40" : "hover:bg-navy-50"
        )}
      >
        ‹
      </Link>
      {pages.map((p, idx) => (
        <span key={p} className="flex items-center">
          {idx > 0 && pages[idx - 1] !== p - 1 && <span className="px-1 text-ink-400">…</span>}
          <Link
            href={buildHref(p)}
            aria-current={p === page ? "page" : undefined}
            className={cn(
              "min-w-[2.25rem] rounded border px-3 py-2 text-center text-sm",
              p === page
                ? "border-navy-900 bg-navy-900 text-white"
                : "border-navy-200 hover:bg-navy-50"
            )}
          >
            {p}
          </Link>
        </span>
      ))}
      <Link
        href={buildHref(Math.min(totalPages, page + 1))}
        aria-disabled={page === totalPages}
        className={cn(
          "rounded border border-navy-200 px-3 py-2 text-sm",
          page === totalPages ? "pointer-events-none opacity-40" : "hover:bg-navy-50"
        )}
      >
        ›
      </Link>
    </nav>
  );
}
