"use client";

import { useState } from "react";
import { Check, Share2 } from "lucide-react";

type PublicShareButtonProps = {
  title: string;
  slug: string;
};

export function PublicShareButton({ title, slug }: PublicShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const url =
      typeof window !== "undefined" ? window.location.href : `/${slug}`;

    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title,
          text: `Kunjungi profil ${title} di SIT`,
          url,
        });
        return;
      } catch {
        // Fallback to clipboard if user cancelled or error
      }
    }

    if (typeof navigator !== "undefined" && navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2200);
      } catch {
        // Fallback
      }
    }
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={handleShare}
        aria-label="Bagikan profil ini"
        className="group flex h-9 items-center gap-1.5 rounded-full border border-white/10 bg-white/10 px-3.5 text-xs font-semibold text-slate-200 backdrop-blur-md transition hover:border-white/25 hover:bg-white/20 hover:text-white focus:outline-none focus:ring-4 focus:ring-blue-500/20 active:scale-95"
      >
        {copied ? (
          <>
            <Check className="h-3.5 w-3.5 text-emerald-400" />
            <span className="text-emerald-300">Tersalin!</span>
          </>
        ) : (
          <>
            <Share2 className="h-3.5 w-3.5 text-slate-300 transition group-hover:scale-110" />
            <span>Bagikan</span>
          </>
        )}
      </button>

      {copied ? (
        <div
          role="status"
          className="pointer-events-none absolute right-0 top-11 z-50 whitespace-nowrap rounded-xl border border-emerald-500/30 bg-slate-900/95 px-3 py-1.5 text-xs font-medium text-emerald-300 shadow-xl backdrop-blur-md animate-in fade-in zoom-in-95 duration-150"
        >
          Tautan berhasil disalin ke clipboard!
        </div>
      ) : null}
    </div>
  );
}
