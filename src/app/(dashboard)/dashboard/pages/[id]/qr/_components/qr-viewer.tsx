"use client";

import { useState } from "react";
import {
  Check,
  Copy,
  Download,
  ExternalLink,
  Info,
  Printer,
  QrCode,
  Share2,
} from "lucide-react";

type QrViewerProps = {
  pageId: string;
  title: string;
  slug: string;
  publicUrl: string;
  initialSvg: string;
  initialDataUrl: string;
  isLive: boolean;
};

export function QrViewer({
  title,
  slug,
  publicUrl,
  initialSvg,
  initialDataUrl,
  isLive,
}: QrViewerProps) {
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState<string | null>(null);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(publicUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback if clipboard API is restricted
    }
  };

  const handleDownloadPng = () => {
    setDownloading("png");
    try {
      const link = document.createElement("a");
      link.href = initialDataUrl;
      link.download = `${slug}-qrcode.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } finally {
      setTimeout(() => setDownloading(null), 600);
    }
  };

  const handleDownloadSvg = () => {
    setDownloading("svg");
    try {
      const blob = new Blob([initialSvg], {
        type: "image/svg+xml;charset=utf-8",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${slug}-qrcode.svg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } finally {
      setTimeout(() => setDownloading(null), 600);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {!isLive ? (
        <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-200">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
          <div>
            <p className="font-semibold">Halaman Belum Ditayangkan (Draft)</p>
            <p className="mt-0.5 text-xs text-amber-800 dark:text-amber-300">
              QR Code ini sudah mengarah ke alamat publik Anda. Pastikan untuk
              mengubah status menjadi <strong>Published</strong> di tab
              Pengaturan agar pengunjung dapat membuka kontennya.
            </p>
          </div>
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[400px_minmax(0,1fr)]">
        {/* QR Code Presentation Card */}
        <div
          id="qr-print-card"
          className="flex flex-col items-center justify-center rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900"
        >
          {/* Header Branding in Card */}
          <div className="mb-5 flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 text-xs font-bold text-white shadow-xs">
              S
            </span>
            <span className="text-xs font-bold tracking-tight text-slate-900 dark:text-white">
              SIT LINK-IN-BIO
            </span>
          </div>

          {/* SVG QR Code Frame */}
          <div className="relative flex aspect-square w-full max-w-[280px] items-center justify-center rounded-2xl border-4 border-slate-950/5 bg-white p-4 shadow-inner dark:border-white/10 dark:bg-white">
            <div
              className="h-full w-full [&>svg]:h-full [&>svg]:w-full"
              dangerouslySetInnerHTML={{ __html: initialSvg }}
            />
          </div>

          {/* Page Info */}
          <div className="mt-5 w-full">
            <h2 className="truncate text-lg font-bold text-slate-900 dark:text-white">
              {title}
            </h2>
            <div className="mt-1 flex items-center justify-center gap-1.5 font-mono text-xs text-slate-500 dark:text-slate-400">
              <span>/{slug}</span>
            </div>
          </div>

          <p className="mt-3 text-[11px] text-slate-400 dark:text-slate-500">
            Pindai dengan kamera ponsel untuk membuka halaman
          </p>
        </div>

        {/* Action Controls & Sharing Options */}
        <div className="space-y-6">
          {/* Download Options (FR-022) */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Unduh QR Code
            </h3>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Pilih format sesuai kebutuhan publikasi digital maupun media cetak
              Anda.
            </p>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={handleDownloadPng}
                disabled={downloading === "png"}
                className="flex min-h-12 cursor-pointer items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-left transition hover:border-blue-400 hover:bg-blue-50/50 focus:outline-none focus:ring-4 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800/80 dark:hover:border-blue-500 dark:hover:bg-blue-950/30"
              >
                <div>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">
                    Format PNG
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Resolusi tinggi (raster gambar)
                  </p>
                </div>
                <Download className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </button>

              <button
                type="button"
                onClick={handleDownloadSvg}
                disabled={downloading === "svg"}
                className="flex min-h-12 cursor-pointer items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-left transition hover:border-blue-400 hover:bg-blue-50/50 focus:outline-none focus:ring-4 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800/80 dark:hover:border-blue-500 dark:hover:bg-blue-950/30"
              >
                <div>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">
                    Format SVG
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Vektor tanpa batas (desain cetak)
                  </p>
                </div>
                <Download className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </button>
            </div>

            <div className="mt-4 border-t border-slate-100 pt-4 dark:border-slate-800">
              <button
                type="button"
                onClick={handlePrint}
                className="inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-xl border border-slate-200 px-3.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 focus:outline-none focus:ring-4 focus:ring-blue-500/20 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                <Printer className="h-4 w-4" />
                <span>Cetak Lembar QR</span>
              </button>
            </div>
          </div>

          {/* Quick Link Share & Copy */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Tautan Halaman Publik
            </h3>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              URL yang disematkan di dalam QR Code ini.
            </p>

            <div className="mt-3 flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 p-1.5 dark:border-slate-700 dark:bg-slate-800/50">
              <input
                type="text"
                readOnly
                value={publicUrl}
                aria-label="URL Halaman Publik"
                className="w-full min-w-0 bg-transparent px-2.5 font-mono text-xs text-slate-800 outline-none dark:text-slate-200"
              />
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex min-h-9 cursor-pointer shrink-0 items-center gap-1.5 rounded-lg bg-blue-600 px-3 text-xs font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-500/20"
              >
                {copied ? (
                  <>
                    <Check className="h-3.5 w-3.5" />
                    <span>Tersalin</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    <span>Salin</span>
                  </>
                )}
              </button>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <a
                href={publicUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-xl border border-slate-200 px-3.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 hover:text-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-500/20 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-blue-400"
              >
                <span>Buka di Tab Baru</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>

          {/* Usage Ideas & Guidance */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-6 dark:border-slate-800 dark:bg-slate-900/50">
            <h4 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              <Share2 className="h-3.5 w-3.5" />
              Saran Penempatan QR Code
            </h4>
            <ul className="mt-3 space-y-2 text-xs text-slate-600 dark:text-slate-400">
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" />
                <span>
                  <strong>Meja Layanan / Resepsionis:</strong> Cetak QR dalam
                  bentuk stand akrilik untuk memudahkan tamu mengakses portal
                  layanan.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" />
                <span>
                  <strong>Materi Promosi & Brosur:</strong> Gunakan format SVG
                  agar tetap tajam saat dicetak dalam ukuran besar pada banner
                  atau poster.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" />
                <span>
                  <strong>Presentasi & Slide:</strong> Sisipkan QR Code di slide
                  penutup agar audiens dapat langsung membuka link portofolio
                  atau materi.
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
