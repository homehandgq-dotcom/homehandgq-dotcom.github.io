import Link from "next/link";

export default function RootNotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-navy-900 px-6 text-center text-white">
      <p className="mb-3 text-xs font-bold uppercase tracking-[0.3em] text-gold-300">ARDA</p>
      <h1 className="text-4xl font-extrabold">404</h1>
      <p className="mt-4 text-navy-100">页面未找到 / Page not found</p>
      <div className="mt-8 flex gap-4">
        <Link href="/zh" className="rounded bg-gold-400 px-6 py-3 text-sm font-bold text-navy-900">
          中文首页
        </Link>
        <Link href="/en" className="rounded border border-white/50 px-6 py-3 text-sm font-bold text-white">
          English Home
        </Link>
      </div>
    </div>
  );
}
