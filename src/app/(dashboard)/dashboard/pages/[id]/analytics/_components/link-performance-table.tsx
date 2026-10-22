import { ExternalLink, Link2, Sparkles } from "lucide-react";
import type { LinkRankingItem } from "@/lib/analytics-aggregate";

type LinkPerformanceTableProps = {
  rankings: LinkRankingItem[];
  totalClicks: number;
};

export function LinkPerformanceTable({
  rankings,
  totalClicks,
}: LinkPerformanceTableProps) {
  if (rankings.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center dark:border-slate-800 dark:bg-slate-900">
        <Sparkles className="mx-auto h-6 w-6 text-slate-400" />
        <h3 className="mt-2 text-sm font-bold text-slate-900 dark:text-white">
          Belum Ada Tautan
        </h3>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          Tambahkan tautan di tab Pengaturan & Konten untuk mulai memantau
          performa tiap tombol.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Peringkat Klik Tautan
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Performa masing-masing tautan berdasarkan jumlah klik yang tercatat
          </p>
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-1 font-mono text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
          {totalClicks} Total Klik
        </span>
      </div>

      <div className="divide-y divide-slate-100 dark:divide-slate-800">
        {rankings.map((item, index) => {
          const isTop = index === 0 && item.clicks > 0;

          return (
            <div
              key={item.linkId}
              className="group flex flex-col gap-3 py-4 transition first:pt-0 last:pb-0 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex min-w-0 items-start gap-3 sm:items-center">
                {/* Ranking Position Badge */}
                <span
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${
                    isTop
                      ? "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 ring-1 ring-amber-500/30"
                      : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                  }`}
                >
                  #{index + 1}
                </span>

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-bold text-slate-900 dark:text-white">
                      {item.title}
                    </p>
                    {isTop ? (
                      <span className="rounded-md bg-amber-50 px-1.5 py-0.5 text-[10px] font-bold text-amber-700 ring-1 ring-inset ring-amber-600/20 dark:bg-amber-950/40 dark:text-amber-300">
                        Terpopuler
                      </span>
                    ) : null}
                  </div>
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex max-w-md items-center gap-1 truncate font-mono text-xs text-slate-400 hover:text-blue-600 dark:hover:text-blue-400"
                  >
                    <span className="truncate">{item.url}</span>
                    <ExternalLink className="h-3 w-3 shrink-0 opacity-60" />
                  </a>
                </div>
              </div>

              {/* Click Metric & Progress Bar */}
              <div className="flex w-full items-center justify-between gap-4 sm:w-auto sm:justify-end">
                <div className="w-32">
                  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isTop ? "bg-amber-500" : "bg-blue-600 dark:bg-blue-500"
                      }`}
                      style={{ width: `${Math.min(item.percentage, 100)}%` }}
                    />
                  </div>
                </div>

                <div className="min-w-20 text-right">
                  <span className="text-sm font-bold text-slate-900 dark:text-white">
                    {item.clicks}
                  </span>
                  <span className="ml-1 text-xs text-slate-500 dark:text-slate-400">
                    ({item.percentage}%)
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
