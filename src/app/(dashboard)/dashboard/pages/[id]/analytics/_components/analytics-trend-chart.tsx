"use client";

import { useState } from "react";
import type { DailyTrendPoint } from "@/lib/analytics-aggregate";

type AnalyticsTrendChartProps = {
  data: DailyTrendPoint[];
};

export function AnalyticsTrendChart({ data }: AnalyticsTrendChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  if (data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-2xl border border-dashed border-slate-200 text-sm text-slate-400 dark:border-slate-800">
        Tidak ada data dalam rentang waktu ini.
      </div>
    );
  }

  const maxVal = Math.max(...data.map((d) => Math.max(d.views, d.clicks)), 5);

  const width = 600;
  const height = 220;
  const paddingLeft = 40;
  const paddingRight = 20;
  const paddingTop = 20;
  const paddingBottom = 35;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  const getX = (index: number) => {
    if (data.length <= 1) return paddingLeft + chartWidth / 2;
    return paddingLeft + (index / (data.length - 1)) * chartWidth;
  };

  const getY = (val: number) => {
    return paddingTop + chartHeight - (val / maxVal) * chartHeight;
  };

  // Generate SVG path for Views line and area
  const viewsPoints = data.map((d, i) => `${getX(i)},${getY(d.views)}`);
  const viewsPath = viewsPoints.join(" ");
  const viewsArea = `${viewsPoints.join(" ")} ${getX(data.length - 1)},${getY(0)} ${getX(0)},${getY(0)}`;

  // Generate SVG path for Clicks line and area
  const clicksPoints = data.map((d, i) => `${getX(i)},${getY(d.clicks)}`);
  const clicksPath = clicksPoints.join(" ");
  const clicksArea = `${clicksPoints.join(" ")} ${getX(data.length - 1)},${getY(0)} ${getX(0)},${getY(0)}`;

  const activePoint = hoveredIndex !== null ? data[hoveredIndex] : null;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Aktivitas Harian
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Perbandingan kunjungan halaman dan klik tautan per hari
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs font-semibold">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-blue-600" />
            <span className="text-slate-700 dark:text-slate-300">Views</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
            <span className="text-slate-700 dark:text-slate-300">Clicks</span>
          </div>
        </div>
      </div>

      <div className="relative rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
        {/* Hover Tooltip Overlay */}
        {activePoint && hoveredIndex !== null ? (
          <div
            className="pointer-events-none absolute z-20 -top-2 rounded-xl border border-slate-200 bg-slate-950 px-3 py-2 text-xs text-white shadow-xl dark:border-slate-800"
            style={{
              left: `${Math.min(Math.max(15, (getX(hoveredIndex) / width) * 100), 85)}%`,
              transform: "translateX(-50%)",
            }}
          >
            <p className="font-semibold text-slate-300">{activePoint.label}</p>
            <div className="mt-1 flex items-center gap-3">
              <span className="text-blue-400 font-bold">
                {activePoint.views} Views
              </span>
              <span className="text-amber-400 font-bold">
                {activePoint.clicks} Clicks
              </span>
            </div>
          </div>
        ) : null}

        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full overflow-visible"
        >
          <defs>
            <linearGradient id="viewsGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2563EB" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#2563EB" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="clicksGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#F59E0B" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Gridlines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
            const y = paddingTop + chartHeight * (1 - ratio);
            const labelVal = Math.round(maxVal * ratio);
            return (
              <g key={`grid-${ratio}`}>
                <line
                  x1={paddingLeft}
                  y1={y}
                  x2={width - paddingRight}
                  y2={y}
                  stroke="currentColor"
                  className="text-slate-100 dark:text-slate-800/80"
                  strokeDasharray="4 4"
                />
                <text
                  x={paddingLeft - 8}
                  y={y + 3}
                  textAnchor="end"
                  className="fill-slate-400 text-[10px] font-mono"
                >
                  {labelVal}
                </text>
              </g>
            );
          })}

          {/* Views Area & Line */}
          <polygon points={viewsArea} fill="url(#viewsGradient)" />
          <polyline
            points={viewsPath}
            fill="none"
            stroke="#2563EB"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Clicks Area & Line */}
          <polygon points={clicksArea} fill="url(#clicksGradient)" />
          <polyline
            points={clicksPath}
            fill="none"
            stroke="#F59E0B"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Data Points and Hit Columns */}
          {data.map((d, i) => {
            const x = getX(i);
            const isHovered = hoveredIndex === i;
            const skipLabel =
              data.length > 14 ? i % Math.ceil(data.length / 7) !== 0 : false;

            return (
              <g key={`point-${d.date}`}>
                {/* Invisible hover trigger column */}
                <rect
                  x={x - chartWidth / (data.length * 2)}
                  y={paddingTop}
                  width={chartWidth / data.length}
                  height={chartHeight}
                  fill="transparent"
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredIndex(i)}
                  onMouseLeave={() => setHoveredIndex(null)}
                />

                {/* Vertical indicator line when hovered */}
                {isHovered ? (
                  <line
                    x1={x}
                    y1={paddingTop}
                    x2={x}
                    y2={paddingTop + chartHeight}
                    stroke="#94A3B8"
                    strokeDasharray="2 2"
                    strokeWidth="1.5"
                  />
                ) : null}

                {/* Point for Views */}
                <circle
                  cx={x}
                  cy={getY(d.views)}
                  r={isHovered ? 4.5 : 2.5}
                  className="fill-blue-600 transition-all"
                />

                {/* Point for Clicks */}
                <circle
                  cx={x}
                  cy={getY(d.clicks)}
                  r={isHovered ? 4.5 : 2.5}
                  className="fill-amber-500 transition-all"
                />

                {/* X Axis Date Label */}
                {!skipLabel ? (
                  <text
                    x={x}
                    y={height - 8}
                    textAnchor="middle"
                    className={`fill-slate-500 text-[10px] font-medium ${
                      isHovered
                        ? "font-bold fill-slate-900 dark:fill-white"
                        : ""
                    }`}
                  >
                    {d.label}
                  </text>
                ) : null}
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
