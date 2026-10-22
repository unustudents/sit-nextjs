import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { connection } from "next/server";
import { getPageAnalytics } from "@/lib/analytics";
import { PageSubNav } from "../_components/page-sub-nav";
import { AnalyticsDashboardView } from "./_components/analytics-dashboard-view";

export const metadata: Metadata = {
  title: "Statistik & Analitik — SIT",
  description: "Pantau kunjungan halaman dan performa klik tautan Anda.",
};

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ period?: string }>;
};

async function PageAnalyticsContent({ params, searchParams }: PageProps) {
  await connection();
  const [resolvedParams, resolvedSearchParams] = await Promise.all([
    params,
    searchParams ?? Promise.resolve({ period: "7" }),
  ]);

  const timeframeDays = resolvedSearchParams.period === "30" ? 30 : 7;
  const result = await getPageAnalytics(resolvedParams.id, timeframeDays);

  if (!result.success) {
    notFound();
  }

  const { page } = result.data;
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
                Statistik
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
            Analytics & Statistik
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

        <PageSubNav pageId={page.id} activeTab="analytics" />

        <AnalyticsDashboardView data={result.data} />
      </main>
    </div>
  );
}

export default function PageAnalyticsPage(props: PageProps) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
          <div className="mx-auto max-w-5xl px-4 py-12">
            <div className="h-8 w-48 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800" />
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="h-28 animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-800" />
              <div className="h-28 animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-800" />
              <div className="h-28 animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-800" />
              <div className="h-28 animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-800" />
            </div>
            <div className="mt-8 h-64 animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-800" />
          </div>
        </div>
      }
    >
      <PageAnalyticsContent {...props} />
    </Suspense>
  );
}
