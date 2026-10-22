import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import {
  ArrowLeft,
  BarChart3,
  ExternalLink,
  Layers,
  Palette,
  QrCode,
  Settings,
} from "lucide-react";
import { requireUser } from "@/lib/auth/require-user";
import { PageEditForm } from "./_components/page-edit-form";

export const metadata: Metadata = {
  title: "Pengaturan Halaman — SIT",
  description: "Kelola rincian judul, slug, dan status publikasi halaman Anda.",
};

type PageProps = {
  params: Promise<{ id: string }>;
};

async function PageEditContent({ params }: PageProps) {
  const [{ supabase }, resolvedParams] = await Promise.all([
    requireUser(),
    params,
  ]);

  const { data: page, error } = await supabase
    .from("pages")
    .select(
      "id, title, slug, description, avatar_path, social_links, status, admin_disabled, created_at, published_at",
    )
    .eq("id", resolvedParams.id)
    .single();

  if (error || !page) {
    notFound();
  }

  const isLive = page.status === "published" && !page.admin_disabled;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950 dark:bg-slate-950 dark:text-slate-50">
      <header className="border-b border-slate-200/80 bg-white/90 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90">
        <div className="mx-auto flex min-h-16 max-w-5xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus:ring-4 focus:ring-blue-500/20 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800"
              aria-label="Kembali ke Dashboard"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <nav
              aria-label="Breadcrumb"
              className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400"
            >
              <Link
                href="/dashboard"
                className="transition hover:text-slate-900 dark:hover:text-slate-200"
              >
                Dashboard
              </Link>
              <span>/</span>
              <span className="max-w-40 truncate font-medium text-slate-900 dark:text-white sm:max-w-xs">
                {page.title}
              </span>
              <span>/</span>
              <span className="font-semibold text-blue-600 dark:text-blue-400">
                Pengaturan
              </span>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            {isLive ? (
              <a
                href={`/${page.slug}`}
                target="_blank"
                rel="noreferrer"
                className="flex min-h-9 items-center gap-1.5 rounded-xl bg-blue-50 px-3 text-xs font-semibold text-blue-700 transition hover:bg-blue-100 focus:outline-none focus:ring-4 focus:ring-blue-500/20 dark:bg-blue-950/60 dark:text-blue-300 dark:hover:bg-blue-900/60"
              >
                <span>Halaman Live</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            ) : (
              <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700 ring-1 ring-inset ring-amber-600/20 dark:bg-amber-950/40 dark:text-amber-300">
                {page.status === "archived" ? "Archived" : "Draft"}
              </span>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600 dark:text-blue-400">
            Editor Halaman
          </p>
          <div className="mt-1 flex flex-wrap items-baseline justify-between gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-slate-950 dark:text-white sm:text-3xl">
              {page.title}
            </h1>
            <p className="font-mono text-xs text-slate-500 dark:text-slate-400">
              /{page.slug}
            </p>
          </div>
        </div>

        {/* Feature Navigation Tabs */}
        <div className="mb-8 flex overflow-x-auto border-b border-slate-200 dark:border-slate-800">
          <div className="flex gap-1 py-1">
            <span className="flex min-h-10 items-center gap-2 border-b-2 border-blue-600 px-4 text-xs font-bold text-blue-600 dark:border-blue-400 dark:text-blue-400">
              <Settings className="h-4 w-4" />
              <span>Profil & Pengaturan</span>
            </span>

            <span
              title="Akan aktif pada tahapan berikutnya"
              className="flex min-h-10 cursor-not-allowed items-center gap-2 border-b-2 border-transparent px-4 text-xs font-medium text-slate-400 opacity-60 dark:text-slate-500"
            >
              <Layers className="h-4 w-4" />
              <span>Tautan (Links)</span>
            </span>

            <span
              title="Akan aktif pada tahapan berikutnya"
              className="flex min-h-10 cursor-not-allowed items-center gap-2 border-b-2 border-transparent px-4 text-xs font-medium text-slate-400 opacity-60 dark:text-slate-500"
            >
              <Palette className="h-4 w-4" />
              <span>Tema Visual</span>
            </span>

            <span
              title="Akan aktif pada tahapan berikutnya"
              className="flex min-h-10 cursor-not-allowed items-center gap-2 border-b-2 border-transparent px-4 text-xs font-medium text-slate-400 opacity-60 dark:text-slate-500"
            >
              <QrCode className="h-4 w-4" />
              <span>QR Code</span>
            </span>

            <span
              title="Akan aktif pada tahapan berikutnya"
              className="flex min-h-10 cursor-not-allowed items-center gap-2 border-b-2 border-transparent px-4 text-xs font-medium text-slate-400 opacity-60 dark:text-slate-500"
            >
              <BarChart3 className="h-4 w-4" />
              <span>Statistik</span>
            </span>
          </div>
        </div>

        <PageEditForm initialData={page} />
      </main>
    </div>
  );
}

export default function PageEditPage(props: PageProps) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
          <div className="mx-auto max-w-5xl px-4 py-12">
            <div className="h-8 w-48 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800" />
            <div className="mt-8 h-64 animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-800" />
          </div>
        </div>
      }
    >
      <PageEditContent {...props} />
    </Suspense>
  );
}
