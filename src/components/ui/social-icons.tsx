import React from "react";
import { Globe, Mail, Link as LinkIcon } from "lucide-react";

export type SocialPlatformDef = {
  id: string;
  name: string;
  icon: string;
  urlPrefix: string;
  placeholder: string;
  colorClass: string;
  badgeBg: string;
  defaultSubtitle: string;
};

export const SOCIAL_PLATFORMS: SocialPlatformDef[] = [
  {
    id: "instagram",
    name: "Instagram",
    icon: "instagram",
    urlPrefix: "https://instagram.com/",
    placeholder: "https://instagram.com/username",
    colorClass: "from-pink-500 via-rose-500 to-amber-500 text-white",
    badgeBg:
      "bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] text-white shadow-pink-500/20",
    defaultSubtitle: "Ikuti kami di Instagram",
  },
  {
    id: "tiktok",
    name: "TikTok",
    icon: "tiktok",
    urlPrefix: "https://tiktok.com/@",
    placeholder: "https://tiktok.com/@username",
    colorClass: "bg-black text-white dark:bg-white dark:text-black",
    badgeBg: "bg-black text-white border border-slate-700 shadow-cyan-500/10",
    defaultSubtitle: "Tonton konten video terbaru kami",
  },
  {
    id: "twitter",
    name: "X (Twitter)",
    icon: "twitter",
    urlPrefix: "https://x.com/",
    placeholder: "https://x.com/username",
    colorClass: "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900",
    badgeBg: "bg-black text-white border border-slate-700",
    defaultSubtitle: "Ikuti kabar & utas terbaru kami",
  },
  {
    id: "youtube",
    name: "YouTube",
    icon: "youtube",
    urlPrefix: "https://youtube.com/@",
    placeholder: "https://youtube.com/@channel",
    colorClass: "bg-red-600 text-white",
    badgeBg: "bg-[#FF0000] text-white shadow-red-500/20",
    defaultSubtitle: "Subscribe ke channel YouTube kami",
  },
  {
    id: "linkedin",
    name: "LinkedIn",
    icon: "linkedin",
    urlPrefix: "https://linkedin.com/in/",
    placeholder: "https://linkedin.com/in/username",
    colorClass: "bg-sky-700 text-white",
    badgeBg: "bg-[#0A66C2] text-white shadow-blue-500/20",
    defaultSubtitle: "Terhubung secara profesional di LinkedIn",
  },
  {
    id: "github",
    name: "GitHub",
    icon: "github",
    urlPrefix: "https://github.com/",
    placeholder: "https://github.com/username",
    colorClass: "bg-slate-800 text-white dark:bg-slate-200 dark:text-slate-900",
    badgeBg: "bg-[#24292F] text-white border border-slate-700",
    defaultSubtitle: "Lihat kode & repositori open source",
  },
  {
    id: "whatsapp",
    name: "WhatsApp",
    icon: "whatsapp",
    urlPrefix: "https://wa.me/",
    placeholder: "https://wa.me/628123456789",
    colorClass: "bg-emerald-600 text-white",
    badgeBg: "bg-[#25D366] text-white shadow-emerald-500/25",
    defaultSubtitle: "Hubungi langsung melalui WhatsApp",
  },
  {
    id: "telegram",
    name: "Telegram",
    icon: "telegram",
    urlPrefix: "https://t.me/",
    placeholder: "https://t.me/username",
    colorClass: "bg-sky-500 text-white",
    badgeBg: "bg-[#229ED9] text-white shadow-sky-500/20",
    defaultSubtitle: "Bergabung dengan channel Telegram",
  },
  {
    id: "discord",
    name: "Discord",
    icon: "discord",
    urlPrefix: "https://discord.gg/",
    placeholder: "https://discord.gg/invite",
    colorClass: "bg-indigo-600 text-white",
    badgeBg: "bg-[#5865F2] text-white shadow-indigo-500/20",
    defaultSubtitle: "Masuk ke server komunitas Discord",
  },
  {
    id: "facebook",
    name: "Facebook",
    icon: "facebook",
    urlPrefix: "https://facebook.com/",
    placeholder: "https://facebook.com/username",
    colorClass: "bg-blue-600 text-white",
    badgeBg: "bg-[#1877F2] text-white shadow-blue-500/20",
    defaultSubtitle: "Ikuti halaman resmi Facebook kami",
  },
  {
    id: "email",
    name: "Email",
    icon: "email",
    urlPrefix: "mailto:",
    placeholder: "mailto:halo@domain.com",
    colorClass: "bg-slate-600 text-white",
    badgeBg:
      "bg-gradient-to-tr from-amber-500 to-rose-500 text-white shadow-rose-500/20",
    defaultSubtitle: "Kirim pesan email langsung ke kami",
  },
  {
    id: "website",
    name: "Website",
    icon: "website",
    urlPrefix: "https://",
    placeholder: "https://domainanda.com",
    colorClass: "bg-emerald-700 text-white",
    badgeBg:
      "bg-gradient-to-tr from-blue-600 to-cyan-500 text-white shadow-blue-500/20",
    defaultSubtitle: "Kunjungi situs web resmi kami",
  },
];

export function getSocialPlatform(
  iconKey: string,
): SocialPlatformDef | undefined {
  return SOCIAL_PLATFORMS.find(
    (p) =>
      p.icon.toLowerCase() === iconKey.toLowerCase() ||
      p.id.toLowerCase() === iconKey.toLowerCase(),
  );
}

export function formatSocialSubtitle(platformId: string, url: string): string {
  if (!url) return "";
  try {
    if (url.startsWith("mailto:")) {
      return url.replace("mailto:", "");
    }
    if (url.startsWith("tel:")) {
      return url.replace("tel:", "");
    }
    const parsed = new URL(url);
    const path = parsed.pathname.replace(/^\/+/, "").replace(/\/+$/, "");

    if (
      platformId === "instagram" ||
      platformId === "tiktok" ||
      platformId === "twitter" ||
      platformId === "x"
    ) {
      const handle = path.split("/")[0]?.replace(/^@/, "");
      return handle ? `@${handle}` : parsed.hostname;
    }
    if (platformId === "whatsapp") {
      return path ? `+${path}` : "Chat WhatsApp";
    }
    if (platformId === "youtube") {
      return path ? path : "YouTube Channel";
    }
    return parsed.hostname + (path ? `/${path}` : "");
  } catch {
    return url;
  }
}

export function SocialIcon({
  icon,
  className = "w-5 h-5",
}: {
  icon: string;
  className?: string;
}) {
  const normalized = icon.toLowerCase().trim();

  switch (normalized) {
    case "instagram":
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
          aria-hidden="true"
        >
          <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
          <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
        </svg>
      );

    case "tiktok":
      return (
        <svg
          viewBox="0 0 24 24"
          fill="currentColor"
          className={className}
          aria-hidden="true"
        >
          <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.24 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
        </svg>
      );

    case "twitter":
    case "x":
      return (
        <svg
          viewBox="0 0 24 24"
          fill="currentColor"
          className={className}
          aria-hidden="true"
        >
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      );

    case "youtube":
      return (
        <svg
          viewBox="0 0 24 24"
          fill="currentColor"
          className={className}
          aria-hidden="true"
        >
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
        </svg>
      );

    case "linkedin":
      return (
        <svg
          viewBox="0 0 24 24"
          fill="currentColor"
          className={className}
          aria-hidden="true"
        >
          <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
        </svg>
      );

    case "github":
      return (
        <svg
          viewBox="0 0 24 24"
          fill="currentColor"
          className={className}
          aria-hidden="true"
        >
          <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0 0 22 12.017C22 6.484 17.522 2 12 2z" />
        </svg>
      );

    case "whatsapp":
      return (
        <svg
          viewBox="0 0 24 24"
          fill="currentColor"
          className={className}
          aria-hidden="true"
        >
          <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2m.01 1.67c2.2 0 4.26.86 5.82 2.42a8.225 8.225 0 0 1 2.41 5.83c0 4.54-3.7 8.24-8.24 8.24-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.196 8.196 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24m4.52 11.59c-.25-.13-1.47-.72-1.7-.81-.23-.08-.39-.13-.56.13-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.13-1.06-.39-2.02-1.24-.75-.67-1.25-1.49-1.4-1.74-.14-.25-.02-.39.11-.51.11-.11.25-.29.37-.43.13-.15.17-.25.25-.42.08-.17.04-.32-.02-.45-.06-.13-.56-1.35-.77-1.85-.2-.49-.41-.42-.56-.43h-.48c-.17 0-.43.06-.66.31-.23.25-.87.85-.87 2.07 0 1.22.89 2.4 1.02 2.57.13.17 1.75 2.67 4.24 3.74.59.26 1.05.41 1.41.53.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.15-1.18-.06-.11-.23-.17-.48-.3z" />
        </svg>
      );

    case "telegram":
      return (
        <svg
          viewBox="0 0 24 24"
          fill="currentColor"
          className={className}
          aria-hidden="true"
        >
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 0 0-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.75-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z" />
        </svg>
      );

    case "discord":
      return (
        <svg
          viewBox="0 0 24 24"
          fill="currentColor"
          className={className}
          aria-hidden="true"
        >
          <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
        </svg>
      );

    case "facebook":
      return (
        <svg
          viewBox="0 0 24 24"
          fill="currentColor"
          className={className}
          aria-hidden="true"
        >
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      );

    case "email":
    case "mail":
      return <Mail className={className} aria-hidden="true" />;

    case "website":
    case "globe":
      return <Globe className={className} aria-hidden="true" />;

    default:
      return <LinkIcon className={className} aria-hidden="true" />;
  }
}
