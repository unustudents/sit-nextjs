"use client";

import Image from "next/image";
import {
  Camera,
  ChevronRight,
  ExternalLink,
  Link as LinkIcon,
  Share2,
  Sparkles,
} from "lucide-react";
import {
  SocialIcon,
  getSocialPlatform,
  formatSocialSubtitle,
} from "@/components/ui/social-icons";
import type { SocialLinkItem } from "./social-links-manager";

export type CustomLinkItem = {
  id: string;
  title: string;
  url: string;
  icon?: string | null;
  sort_order?: number;
  is_active: boolean;
};

type PageLivePreviewProps = {
  title: string;
  slug: string;
  description: string;
  avatarUrl: string | null;
  socialLinks: SocialLinkItem[];
  customLinks?: CustomLinkItem[];
  status: "draft" | "published" | "archived";
};

export function PageLivePreview({
  title,
  slug,
  description,
  avatarUrl,
  socialLinks,
  customLinks = [],
  status,
}: PageLivePreviewProps) {
  const getInitials = (text: string) => {
    return text
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase() || "")
      .join("");
  };

  const activeCustomLinks = customLinks.filter((l) => l.is_active);
  const hasAnyLinks = socialLinks.length > 0 || activeCustomLinks.length > 0;

  return (
    <div className="rounded-3xl border border-slate-200/90 bg-gradient-to-b from-slate-50 to-white p-4 shadow-sm dark:border-slate-800 dark:from-slate-900/60 dark:to-slate-950 sm:p-5">
      <div className="mb-3.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            Pratinjau Linktree Live
          </h3>
        </div>
        <span
          className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
            status === "published"
              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
              : status === "archived"
                ? "bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                : "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300"
          }`}
        >
          {status}
        </span>
      </div>

      {/* Phone Mockup Canvas */}
      <div className="relative mx-auto flex max-w-sm flex-col overflow-hidden rounded-[2.5rem] border-4 border-slate-900/80 bg-[#0A0E17] p-5 text-white shadow-2xl shadow-indigo-950/30 dark:border-slate-800">
        {/* Subtle top phone speaker / notch notch indicator */}
        <div className="mx-auto mb-4 h-1.5 w-16 rounded-full bg-slate-700/60" />

        {/* Top header handle & share pill */}
        <div className="mb-4 flex items-center justify-between">
          <span className="rounded-full border border-white/10 bg-white/[0.06] px-2.5 py-0.5 font-mono text-[10px] text-slate-300">
            @{slug || "slug"}
          </span>
          <div className="flex h-7 w-7 items-center justify-center rounded-full border border-white/10 bg-white/[0.06] text-slate-300">
            <Share2 className="h-3 w-3" />
          </div>
        </div>

        {/* Avatar with radiant gradient border */}
        <div className="flex flex-col items-center text-center">
          <div className="relative mb-3 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-tr from-blue-500 via-indigo-500 to-purple-500 p-[2.5px] shadow-lg shadow-indigo-500/20">
            <div className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-full bg-[#0E1424]">
              {avatarUrl ? (
                <Image
                  src={avatarUrl}
                  alt="Avatar Pratinjau"
                  fill
                  unoptimized
                  sizes="80px"
                  className="object-cover"
                />
              ) : (
                <span className="text-xl font-black text-white">
                  {title.trim() ? (
                    getInitials(title)
                  ) : (
                    <Camera className="h-6 w-6 text-slate-400" />
                  )}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center justify-center gap-1">
            <h4 className="text-base font-bold text-white">
              {title.trim() || "Nama Halaman Anda"}
            </h4>
            <span className="inline-flex h-3.5 w-3.5 items-center justify-center rounded-full bg-blue-500 text-white">
              <svg
                viewBox="0 0 20 20"
                fill="currentColor"
                className="h-2.5 w-2.5"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </span>
          </div>

          {description.trim() ? (
            <p className="mt-1 text-xs leading-relaxed text-slate-300 line-clamp-2">
              {description}
            </p>
          ) : (
            <p className="mt-1 text-xs italic text-slate-500">
              Deskripsi profil belum diisi...
            </p>
          )}

          {/* Mini social circles bar */}
          {socialLinks.length > 0 ? (
            <div className="mt-3 flex flex-wrap justify-center gap-1.5">
              {socialLinks.map((link, idx) => (
                <span
                  key={`mini-${link.icon}-${idx}`}
                  className="flex h-7 w-7 items-center justify-center rounded-full border border-white/10 bg-white/[0.06] text-slate-300"
                >
                  <SocialIcon icon={link.icon} className="h-3 w-3" />
                </span>
              ))}
            </div>
          ) : null}
        </div>

        {/* Linktree style full button cards */}
        <div className="mt-5 space-y-2.5">
          {/* 1. Social Links as full cards */}
          {socialLinks.map((link, idx) => {
            const platform = getSocialPlatform(link.icon);
            const subtitle = formatSocialSubtitle(
              platform?.id || link.icon,
              link.url,
            );

            return (
              <div
                key={`preview-social-${link.icon}-${idx}`}
                className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.06] p-2.5 shadow-sm backdrop-blur-md"
              >
                <div className="flex min-w-0 items-center gap-2.5">
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg shadow-xs ${
                      platform?.badgeBg || "bg-blue-600 text-white"
                    }`}
                  >
                    <SocialIcon icon={link.icon} className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 text-left">
                    <p className="truncate text-xs font-bold text-white">
                      {link.label}
                    </p>
                    <p className="truncate text-[10px] text-slate-400">
                      {subtitle || link.url || platform?.defaultSubtitle}
                    </p>
                  </div>
                </div>
                <ChevronRight className="h-3.5 w-3.5 shrink-0 text-slate-400" />
              </div>
            );
          })}

          {/* 2. Custom Links from links table */}
          {activeCustomLinks.map((link) => {
            let host = "";
            try {
              host = new URL(link.url).hostname.replace(/^www\./, "");
            } catch {
              host = link.url;
            }

            return (
              <div
                key={`preview-custom-${link.id}`}
                className="flex items-center justify-between rounded-xl border border-blue-500/20 bg-blue-950/20 p-2.5 shadow-sm backdrop-blur-md"
              >
                <div className="flex min-w-0 items-center gap-2.5">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white shadow-xs">
                    <LinkIcon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 text-left">
                    <p className="truncate text-xs font-bold text-white">
                      {link.title}
                    </p>
                    <p className="truncate text-[10px] text-blue-300/80 font-mono">
                      {host}
                    </p>
                  </div>
                </div>
                <ExternalLink className="h-3.5 w-3.5 shrink-0 text-blue-300/60" />
              </div>
            );
          })}

          {!hasAnyLinks ? (
            <div className="rounded-xl border border-dashed border-white/10 p-5 text-center text-xs text-slate-400">
              Belum ada tautan yang ditambahkan
            </div>
          ) : null}
        </div>

        {/* Mini SIT Branding */}
        <div className="mt-6 text-center">
          <span className="font-mono text-[9px] text-slate-500">
            Dibuat dengan <strong className="text-slate-300">SIT</strong>
          </span>
        </div>
      </div>
    </div>
  );
}
