"use client";

import Image from "next/image";
import {
  Camera,
  ChevronRight,
  ExternalLink,
  Eye,
  Link as LinkIcon,
  Share2,
} from "lucide-react";
import {
  SocialIcon,
  getSocialPlatform,
  formatSocialSubtitle,
} from "@/components/ui/social-icons";
import type { ThemeConfig } from "@/types/database.types";
import { DEFAULT_THEME } from "@/lib/validators/theme";
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
  theme?: ThemeConfig | null;
  status: "draft" | "published" | "archived";
};

export function PageLivePreview({
  title,
  slug,
  description,
  avatarUrl,
  socialLinks,
  customLinks = [],
  theme,
  status,
}: PageLivePreviewProps) {
  const activeTheme: ThemeConfig =
    theme && theme.version === 1 ? theme : DEFAULT_THEME;

  const fontClass =
    activeTheme.font === "serif"
      ? "font-serif"
      : activeTheme.font === "mono"
        ? "font-mono"
        : "font-sans";

  const radiusClass =
    activeTheme.buttonRadius === "sm"
      ? "rounded-md"
      : activeTheme.buttonRadius === "md"
        ? "rounded-xl"
        : activeTheme.buttonRadius === "full"
          ? "rounded-full"
          : "rounded-2xl";

  const isAnimated = activeTheme.animation === "subtle";

  const getInitials = (text: string) => {
    return text
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase() || "")
      .join("");
  };

  const activeCustomLinks = customLinks.filter((l) => l.is_active);
  const inactiveCount = customLinks.length - activeCustomLinks.length;
  const hasAnyLinks = socialLinks.length > 0 || activeCustomLinks.length > 0;

  return (
    <div className="rounded-3xl border border-slate-200/90 bg-gradient-to-b from-slate-50 to-white p-4 shadow-sm dark:border-slate-800 dark:from-slate-900/60 dark:to-slate-950 sm:p-5">
      {/* Header with Live Indicator */}
      <div className="mb-3.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
          </span>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            Pratinjau Live
          </h3>
        </div>

        <div className="flex items-center gap-2">
          {status === "published" ? (
            <a
              href={`/${slug}`}
              target="_blank"
              rel="noreferrer noopener"
              className="flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-700 transition hover:bg-blue-100 dark:bg-blue-950/60 dark:text-blue-300"
              title="Buka Halaman Publik"
            >
              <span>Publik</span>
              <ExternalLink className="h-2.5 w-2.5" />
            </a>
          ) : null}

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
      </div>

      {/* Phone Mockup Canvas with Dynamic Theme */}
      <div
        className={`relative mx-auto flex max-w-sm flex-col overflow-hidden rounded-[2.5rem] border-4 border-slate-900/80 p-5 shadow-2xl transition-all duration-300 dark:border-slate-800 ${fontClass}`}
        style={{
          backgroundColor: activeTheme.colors.background,
          color: activeTheme.colors.text,
        }}
      >
        {/* Subtle Background Glow Mesh / Gradient (FR-018) */}
        {activeTheme.backgroundStyle === "mesh" ? (
          <div className="pointer-events-none absolute inset-0 -z-0 overflow-hidden">
            <div
              className="absolute -top-10 -left-10 h-40 w-40 rounded-full blur-3xl opacity-35"
              style={{ backgroundColor: activeTheme.colors.button }}
            />
            <div
              className="absolute -bottom-10 -right-10 h-40 w-40 rounded-full blur-3xl opacity-35"
              style={{ backgroundColor: activeTheme.colors.button }}
            />
          </div>
        ) : activeTheme.backgroundStyle === "gradient" ? (
          <div className="pointer-events-none absolute inset-0 -z-0 bg-gradient-to-b from-white/10 via-transparent to-black/25" />
        ) : null}

        {/* Subtle top phone speaker / notch indicator */}
        <div className="relative z-10 mx-auto mb-4 h-1.5 w-16 rounded-full bg-white/20" />

        {/* Top header handle & share pill */}
        <div className="relative z-10 mb-4 flex items-center justify-between">
          <span className="rounded-full border border-current/15 bg-current/[0.06] px-2.5 py-0.5 font-mono text-[10px] opacity-80">
            @{slug || "slug"}
          </span>
          <div className="flex h-7 w-7 items-center justify-center rounded-full border border-current/15 bg-current/[0.06] opacity-80">
            <Share2 className="h-3 w-3" />
          </div>
        </div>

        {/* Avatar with radiant border */}
        <div className="relative z-10 flex flex-col items-center text-center">
          <div
            className="relative mb-3 flex h-20 w-20 items-center justify-center rounded-full p-[2.5px] shadow-lg"
            style={{
              background: `linear-gradient(135deg, ${activeTheme.colors.button}, #A855F7, #EC4899)`,
            }}
          >
            <div
              className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-full"
              style={{ backgroundColor: activeTheme.colors.background }}
            >
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
                <span className="text-xl font-black text-current">
                  {title.trim() ? (
                    getInitials(title)
                  ) : (
                    <Camera className="h-6 w-6 opacity-60" />
                  )}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center justify-center gap-1">
            <h4 className="text-base font-bold text-current">
              {title.trim() || "Nama Halaman Anda"}
            </h4>
            <span
              className="inline-flex h-3.5 w-3.5 items-center justify-center rounded-full text-white"
              style={{ backgroundColor: activeTheme.colors.button }}
            >
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
            <p className="mt-1 text-xs leading-relaxed opacity-80 line-clamp-2">
              {description}
            </p>
          ) : (
            <p className="mt-1 text-xs italic opacity-50">
              Deskripsi profil belum diisi...
            </p>
          )}

          {/* Mini social circles bar */}
          {socialLinks.length > 0 ? (
            <div className="mt-3 flex flex-wrap justify-center gap-1.5">
              {socialLinks.map((link, idx) => (
                <span
                  key={`mini-${link.icon}-${idx}`}
                  className={`flex h-7 w-7 items-center justify-center rounded-full border border-current/15 bg-current/[0.06] text-current ${
                    isAnimated ? "transition hover:scale-110" : ""
                  }`}
                >
                  <SocialIcon icon={link.icon} className="h-3 w-3" />
                </span>
              ))}
            </div>
          ) : null}
        </div>

        {/* Linktree style full button cards */}
        <div className="relative z-10 mt-5 space-y-2.5 transition-all duration-300">
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
                className={`flex items-center justify-between p-2.5 shadow-sm border border-current/15 ${radiusClass} ${
                  activeTheme.template === "glass"
                    ? "backdrop-blur-md bg-white/[0.08]"
                    : "bg-current/[0.05]"
                } ${isAnimated ? "transition hover:bg-current/[0.12]" : ""}`}
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
                    <p className="truncate text-xs font-bold text-current">
                      {link.label}
                    </p>
                    <p className="truncate text-[10px] opacity-70">
                      {subtitle || link.url || platform?.defaultSubtitle}
                    </p>
                  </div>
                </div>
                <ChevronRight className="h-3.5 w-3.5 shrink-0 opacity-60" />
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
                className={`flex items-center justify-between p-3 shadow-md ${radiusClass} ${
                  isAnimated
                    ? "transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg active:scale-[0.99]"
                    : ""
                }`}
                style={{
                  backgroundColor: activeTheme.colors.button,
                  color: activeTheme.colors.buttonText,
                }}
              >
                <div className="flex min-w-0 items-center gap-2.5">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-black/15 shadow-inner">
                    <LinkIcon className="h-3.5 w-3.5 text-current" />
                  </div>
                  <div className="min-w-0 text-left">
                    <p className="truncate text-xs font-bold text-current">
                      {link.title}
                    </p>
                    <p className="truncate font-mono text-[10px] opacity-80">
                      {host}
                    </p>
                  </div>
                </div>
                <ExternalLink className="h-3.5 w-3.5 shrink-0 opacity-70" />
              </div>
            );
          })}

          {!hasAnyLinks ? (
            <div
              className={`border border-dashed border-current/20 p-5 text-center text-xs opacity-70 ${radiusClass}`}
            >
              Belum ada tautan yang ditambahkan
            </div>
          ) : null}
        </div>

        {/* Mini SIT Branding */}
        <div className="relative z-10 mt-6 text-center">
          <span className="font-mono text-[9px] opacity-60">
            Dibuat dengan <strong className="opacity-90">SIT</strong>
          </span>
        </div>
      </div>

      {/* Inactive links hint */}
      {inactiveCount > 0 ? (
        <div className="mt-3 flex items-center justify-center gap-1.5 text-center text-[11px] text-slate-500 dark:text-slate-400">
          <Eye className="h-3.5 w-3.5 text-slate-400" />
          <span>
            {inactiveCount} tautan dinonaktifkan (disembunyikan dari publik)
          </span>
        </div>
      ) : null}
    </div>
  );
}
