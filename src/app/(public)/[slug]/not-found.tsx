import Link from "next/link";
import { ArrowLeft, FileQuestion } from "lucide-react";

export default function PublicPageNotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 text-center text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-200/80 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
        <FileQuestion className="h-8 w-8" />
      </div>

      <h1 className="mt-5 text-xl font-bold tracking-tight sm:text-2xl">
        Halaman Tidak Ditemukan
      </h1>

      <p className="mt-2 max-w-sm text-xs leading-5 text-slate-500 dark:text-slate-400">
        Tautan yang Anda tuju mungkin belum dipublikasikan, dinonaktifkan, atau
        alamat URL salah.
      </p>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/"
          className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-slate-900 px-4 text-xs font-semibold text-white shadow-xs transition hover:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-slate-500/20 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Kembali ke Beranda</span>
        </Link>
      </div>
    </div>
  );
}
