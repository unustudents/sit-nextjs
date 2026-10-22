import Link from "next/link";
import { FileQuestion, Home, LayoutDashboard } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-between bg-[#0A0E17] px-4 py-8 text-white selection:bg-blue-600 selection:text-white sm:px-6 sm:py-12">
      {/* Top Header */}
      <nav
        aria-label="Navigasi 404"
        className="w-full max-w-lg flex items-center justify-between"
      >
        <Link
          href="/"
          className="inline-flex items-center gap-2 font-mono text-sm font-bold tracking-tight text-white hover:opacity-80"
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 font-black text-white shadow-md shadow-blue-600/30">
            S
          </span>
          <span>SIT</span>
        </Link>
      </nav>

      {/* Main Error Box */}
      <main className="my-auto flex w-full max-w-md flex-col items-center text-center">
        <div className="relative mb-6 flex h-20 w-20 items-center justify-center rounded-3xl border border-white/10 bg-white/[0.04] p-4 shadow-2xl backdrop-blur-xl sm:h-24 sm:w-24">
          <div className="absolute inset-0 rounded-3xl bg-blue-600/10 blur-xl" />
          <FileQuestion className="relative h-10 w-10 text-blue-400 sm:h-12 sm:w-12" />
        </div>

        <span className="rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 font-mono text-xs font-semibold text-blue-400">
          Galat 404
        </span>

        <h1
          id="not-found-heading"
          className="mt-4 text-2xl font-black tracking-tight text-white sm:text-3xl"
        >
          Halaman Tidak Ditemukan
        </h1>

        <p className="mt-3 max-w-sm text-xs leading-relaxed text-slate-400 sm:text-sm">
          Halaman yang Anda tuju mungkin belum dipublikasikan, berstatus draft,
          telah diarsipkan, dinonaktifkan oleh administrator, atau alamat URL
          salah.
        </p>

        {/* Action Buttons */}
        <div className="mt-8 flex w-full flex-col gap-3 sm:flex-row">
          <Link
            href="/"
            id="not-found-home-btn"
            className="flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-blue-600/25 transition hover:bg-blue-500 active:scale-[0.98] sm:text-sm"
          >
            <Home className="h-4 w-4" />
            <span>Kembali ke Beranda</span>
          </Link>

          <Link
            href="/dashboard"
            id="not-found-dashboard-btn"
            className="flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/[0.06] px-4 py-2.5 text-xs font-bold text-slate-200 backdrop-blur-md transition hover:bg-white/[0.12] hover:text-white active:scale-[0.98] sm:text-sm"
          >
            <LayoutDashboard className="h-4 w-4" />
            <span>Ke Dashboard</span>
          </Link>
        </div>
      </main>

      {/* Footer Branding */}
      <footer className="w-full max-w-lg border-t border-white/10 pt-6 text-center text-xs text-slate-500">
        <p className="font-mono text-[11px]">
          SIT • Self-Hosted Link in Bio Platform
        </p>
      </footer>
    </div>
  );
}
