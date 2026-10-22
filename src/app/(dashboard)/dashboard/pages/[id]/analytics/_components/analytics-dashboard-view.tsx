"use client";

import { useTransition } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Award,
  Calendar,
  Eye,
  MousePointerClick,
  Percent,
  QrCode,
  Share2,
} from "lucide-react";
import type { PageAnalyticsData } from "@/lib/analytics";
import { AnalyticsTrendChart } from "./analytics-trend-chart";
import { LinkPerformanceTable } from "./link-performance-table";

type AnalyticsDashboardViewProps = {
  data: PageAnalyticsData;
};

export function AnalyticsDashboardView({ data }: AnalyticsDashboardViewProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const currentPeriod = data.timeframeDays === 30 ? "30" : "7";

  const handlePeriodChange = (period: "7" | "30") => {
    if (period === currentPeriod) return;
    const nextParams = new URLSearchParams(searchParams.toString());
    nextParams.set("period", period);

    startTransition(() => {
      router.push(`${pathname}?${nextParams.toString()}`);
    });
  };

  const { summary, dailyTrends, linkRankings, page } = data;
  const hasZeroTraffic = summary.totalViews === 0 && summary.totalClicks === 0;

  return (
    <div className="space-y-6">
      {/* Timeframe Control Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-slate-500" />
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            Rentang Waktu:
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {data.timeframeDays === 30 ? "30 Hari Terakhir" : "7 Hari Terakhir"}
          </span>
        </div>

        <div className="flex items-center gap-1.5 rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
          <button
            type="button"
            onClick={() => handlePeriodChange("7")}
            disabled={isPending}
            className={`cursor-pointer rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
              currentPeriod === "7"
                ? "bg-white text-slate-950 shadow-xs dark:bg-slate-900 dark:text-white"
                : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            }`}
          >
            7 Hari
          </button>
          <button
            type="button"
            onClick={() => handlePeriodChange("30")}
            disabled={isPending}
            className={`cursor-pointer rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
              currentPeriod === "30"
                ? "bg-white text-slate-950 shadow-xs dark:bg-slate-900 dark:text-white"
                : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            }`}
          >
            30 Hari
          </button>
        </div>
      </div>

      {/* KPI Stat Cards (FR-025) */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Page Views */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Total Views
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
              <Eye className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-3 text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            {summary.totalViews}
          </p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Kunjungan halaman publik
          </p>
        </div>

        {/* Total Link Clicks */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Total Clicks
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400">
              <MousePointerClick className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-3 text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            {summary.totalClicks}
          </p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Klik pada seluruh tautan
          </p>
        </div>

        {/* Click-Through Rate (CTR) */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Rasio Klik (CTR)
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
              <Percent className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-3 text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            {summary.ctr}%
          </p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Rata-rata klik per kunjungan
          </p>
        </div>

        {/* Top Link */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Tautan Terpopuler
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400">
              <Award className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-3 truncate text-lg font-bold tracking-tight text-slate-900 dark:text-white">
            {summary.topLinkTitle || "—"}
          </p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            {summary.topLinkClicks > 0
              ? `${summary.topLinkClicks} klik tercatat`
              : "Belum ada klik"}
          </p>
        </div>
      </div>

      {/* Empty Traffic State Card */}
      {hasZeroTraffic ? (
        <div className="flex flex-col items-center justify-between gap-4 rounded-2xl border border-blue-200/60 bg-blue-50/50 p-6 text-center dark:border-blue-900/40 dark:bg-blue-950/20 sm:flex-row sm:text-left">
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
              Mulai Kumpulkan Data Kunjungan
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Belum ada event statistik untuk periode ini. Sebarkan tautan Anda
              atau bagikan QR Code agar pengunjung dapat mulai mengakses laman
              ini.
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Link
              href={`/dashboard/pages/${page.id}/qr`}
              className="inline-flex min-h-10 cursor-pointer items-center gap-1.5 rounded-xl bg-blue-600 px-3.5 text-xs font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-500/20"
            >
              <QrCode className="h-3.5 w-3.5" />
              <span>Lihat QR Code</span>
            </Link>
            <a
              href={`/${page.slug}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-10 cursor-pointer items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            >
              <Share2 className="h-3.5 w-3.5" />
              <span>Buka Laman</span>
            </a>
          </div>
        </div>
      ) : null}

      {/* Daily Trend Chart (FR-026) */}
      <AnalyticsTrendChart data={dailyTrends} />

      {/* Link Click Ranking Table (FR-026) */}
      <LinkPerformanceTable
        rankings={linkRankings}
        totalClicks={summary.totalClicks}
      />
    </div>
  );
}
