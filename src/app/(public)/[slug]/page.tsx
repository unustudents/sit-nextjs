import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Camera,
  ChevronRight,
  ExternalLink,
  Link as LinkIcon,
  Sparkles,
} from "lucide-react";
import { getPublicLinks, getPublicPage } from "@/lib/public-page-cache";
import { slugSchema } from "@/lib/validators/page";
import { DEFAULT_THEME } from "@/lib/validators/theme";
import {
  SocialIcon,
  getSocialPlatform,
  formatSocialSubtitle,
} from "@/components/ui/social-icons";
import type { SocialLink } from "@/types/database.types";
import { PublicShareButton } from "./_components/public-share-button";
import { PageViewTracker } from "./_components/page-view-tracker";

type PublicPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: PublicPageProps): Promise<Metadata> {
  const { slug } = await params;
  const parsed = slugSchema.safeParse(slug);
  if (!parsed.success) {
    return {
      title: "Halaman Tidak Ditemukan — SIT",
      robots: { index: false, follow: false },
    };
  }

  const page = await getPublicPage(slug);

  if (!page) {
    return {
      title: "Halaman Tidak Ditemukan — SIT",
      robots: { index: false, follow: false },
    };
  }

  const pageDescription =
    page.description || `Kumpulan tautan dan profil resmi dari ${page.title}.`;
  const canonicalUrl = `/${page.slug}`;
  const avatarUrl = page.avatar_path
    ? `/api/assets/pages/${page.id}?v=${encodeURIComponent(page.avatar_path)}`
    : undefined;

  return {
    title: `${page.title} — SIT`,
    description: pageDescription,
    alternates: {
      canonical: canonicalUrl,
    },
    robots: {
      index: true,
      follow: true,
    },
    openGraph: {
      title: `${page.title} — SIT`,
      description: pageDescription,
      url: canonicalUrl,
      siteName: "SIT",
      type: "profile",
      images: avatarUrl
        ? [
            {
              url: avatarUrl,
              width: 512,
              height: 512,
              alt: `Avatar ${page.title}`,
            },
          ]
        : undefined,
    },
    twitter: {
      card: "summary",
      title: `${page.title} — SIT`,
      description: pageDescription,
      images: avatarUrl ? [avatarUrl] : undefined,
    },
  };
}

async function PublicPageContent({
  page,
}: {
  page: NonNullable<Awaited<ReturnType<typeof getPublicPage>>>;
}) {
  const customLinks = await getPublicLinks(page.id);

  const socialLinks = (
    Array.isArray(page.social_links) ? page.social_links : []
  ) as SocialLink[];

  const activeTheme =
    page.theme_config && page.theme_config.version === 1
      ? page.theme_config
      : DEFAULT_THEME;

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
      .map((part) => part[0]?.toUpperCase() || "")
      .join("");
  };

  const hasAnyLinks = socialLinks.length > 0 || customLinks.length > 0;

  return (
    <div
      className={`relative min-h-screen overflow-x-hidden antialiased selection:bg-blue-600 selection:text-white ${fontClass}`}
      style={{
        backgroundColor: activeTheme.colors.background,
        color: activeTheme.colors.text,
      }}
    >
      {/* Dynamic ambient background style (FR-018) */}
      {activeTheme.backgroundStyle === "mesh" ? (
        <div className="pointer-events-none fixed inset-0 overflow-hidden">
          <div
            className="absolute -top-32 left-1/2 h-[450px] w-[500px] -translate-x-1/2 rounded-full blur-3xl opacity-30"
            style={{ backgroundColor: activeTheme.colors.button }}
          />
          <div
            className="absolute top-1/3 -right-32 h-80 w-80 rounded-full blur-3xl opacity-20"
            style={{ backgroundColor: activeTheme.colors.button }}
          />
        </div>
      ) : activeTheme.backgroundStyle === "gradient" ? (
        <div className="pointer-events-none fixed inset-0 bg-gradient-to-b from-white/10 via-transparent to-black/30" />
      ) : null}

      {/* Non-blocking Page View Analytics Tracker (FR-023 & NFR-015) */}
      <PageViewTracker pageId={page.id} />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-lg flex-col justify-between px-4 py-6 sm:px-6 sm:py-8">
        {/* Top Header Bar */}
        <nav
          aria-label="Aksi Halaman"
          className="flex items-center justify-between pb-6"
        >
          <div className="inline-flex items-center gap-1.5 rounded-full border border-current/15 bg-current/[0.06] px-3 py-1 font-mono text-[11px] font-medium opacity-85 backdrop-blur-md">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>@{page.slug}</span>
          </div>

          <PublicShareButton title={page.title} slug={page.slug} />
        </nav>

        {/* Profile Hero Section */}
        <header className="flex flex-col items-center text-center">
          {/* Avatar with radiant gradient ring */}
          <div
            className="relative mb-4 flex h-24 w-24 items-center justify-center rounded-full p-[3px] shadow-2xl sm:h-28 sm:w-28"
            style={{
              background: `linear-gradient(135deg, ${activeTheme.colors.button}, #A855F7, #EC4899)`,
            }}
          >
            <div
              className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-full"
              style={{ backgroundColor: activeTheme.colors.background }}
            >
              {page.avatar_path ? (
                <Image
                  src={`/api/assets/pages/${page.id}?v=${encodeURIComponent(page.avatar_path)}`}
                  alt={`Avatar ${page.title}`}
                  fill
                  unoptimized
                  sizes="(max-width: 640px) 96px, 112px"
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  {page.title.trim() ? (
                    <span className="text-2xl font-black tracking-tight text-current sm:text-3xl">
                      {getInitials(page.title)}
                    </span>
                  ) : (
                    <Camera className="h-8 w-8 opacity-60 sm:h-10 sm:w-10" />
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Page Title & Verified Badge */}
          <div className="flex items-center justify-center gap-1.5">
            <h1
              id="public-profile-title"
              className="text-xl font-bold tracking-tight text-current break-words sm:text-2xl"
            >
              {page.title}
            </h1>
            <span
              className="inline-flex h-4 w-4 items-center justify-center rounded-full text-white shadow-xs"
              style={{ backgroundColor: activeTheme.colors.button }}
              title="Terverifikasi SIT"
            >
              <svg
                viewBox="0 0 20 20"
                fill="currentColor"
                className="h-3 w-3"
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

          {/* Description / Bio */}
          {page.description ? (
            <p
              id="public-profile-bio"
              className="mt-2 max-w-sm text-xs leading-relaxed opacity-80 break-words sm:text-sm"
            >
              {page.description}
            </p>
          ) : null}

          {/* Social Icons Bar (Circle icons) */}
          {socialLinks.length > 0 ? (
            <div
              id="public-social-icons-bar"
              className="mt-4 flex flex-wrap justify-center gap-2"
            >
              {socialLinks.map((item, idx) => (
                <a
                  key={`social-circle-${item.icon}-${idx}`}
                  id={`public-social-circle-${item.icon}-${idx}`}
                  href={item.url}
                  target="_blank"
                  rel="noreferrer noopener"
                  aria-label={item.label}
                  className={`flex h-9 w-9 items-center justify-center rounded-full border border-current/15 bg-current/[0.06] text-current shadow-sm backdrop-blur-md ${
                    isAnimated
                      ? "transition-all duration-200 hover:scale-110 hover:bg-current/[0.12] motion-reduce:transition-none motion-reduce:transform-none"
                      : ""
                  }`}
                  title={item.label}
                >
                  <SocialIcon icon={item.icon} className="h-4 w-4" />
                </a>
              ))}
            </div>
          ) : null}
        </header>

        {/* Links Stack Area */}
        <main id="public-links-container" className="my-6 space-y-3">
          {/* Social Links rendered as full Linktree cards */}
          {socialLinks.map((item, idx) => {
            const platform = getSocialPlatform(item.icon);
            const subtitle = formatSocialSubtitle(
              platform?.id || item.icon,
              item.url,
            );

            return (
              <a
                key={`social-card-${item.icon}-${idx}`}
                id={`public-social-card-${item.icon}-${idx}`}
                href={item.url}
                target="_blank"
                rel="noreferrer noopener"
                className={`group flex w-full items-center justify-between gap-3.5 p-3.5 shadow-md border border-current/15 ${radiusClass} ${
                  activeTheme.template === "glass"
                    ? "backdrop-blur-md bg-white/[0.08]"
                    : "bg-current/[0.06]"
                } ${
                  isAnimated
                    ? "transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg active:scale-[0.99] motion-reduce:transition-none motion-reduce:transform-none"
                    : ""
                } sm:p-4`}
              >
                <div className="flex min-w-0 items-center gap-3.5">
                  <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl shadow-md ${
                      isAnimated
                        ? "transition group-hover:scale-105 motion-reduce:transition-none motion-reduce:transform-none"
                        : ""
                    } ${platform?.badgeBg || "bg-blue-600 text-white"}`}
                  >
                    <SocialIcon icon={item.icon} className="h-5 w-5" />
                  </div>

                  <div className="min-w-0 text-left">
                    <p className="truncate text-sm font-bold text-current">
                      {item.label}
                    </p>
                    <p className="truncate text-xs opacity-70">
                      {subtitle || item.url || platform?.defaultSubtitle}
                    </p>
                  </div>
                </div>

                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg opacity-60">
                  <ChevronRight
                    className={`h-4 w-4 ${
                      isAnimated
                        ? "transition group-hover:translate-x-1 group-hover:opacity-100 motion-reduce:transition-none motion-reduce:transform-none"
                        : ""
                    }`}
                  />
                </div>
              </a>
            );
          })}

          {/* Custom Links from links table */}
          {customLinks.length > 0
            ? customLinks.map((link) => (
                <a
                  key={link.id}
                  id={`public-link-${link.id}`}
                  href={`/api/click/${link.id}`}
                  target="_blank"
                  rel="noreferrer noopener"
                  className={`group flex w-full items-center justify-between gap-3.5 p-3.5 shadow-lg ${radiusClass} ${
                    isAnimated
                      ? "transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl active:translate-y-0 active:scale-[0.99] motion-reduce:transition-none motion-reduce:transform-none"
                      : ""
                  } sm:p-4`}
                  style={{
                    backgroundColor: activeTheme.colors.button,
                    color: activeTheme.colors.buttonText,
                  }}
                >
                  <div className="flex min-w-0 items-center gap-3.5">
                    <div
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-black/15 text-current shadow-md ${
                        isAnimated
                          ? "transition group-hover:scale-105 motion-reduce:transition-none motion-reduce:transform-none"
                          : ""
                      }`}
                    >
                      <LinkIcon className="h-5 w-5" />
                    </div>

                    <div className="min-w-0 text-left">
                      <p className="truncate text-sm font-bold text-current">
                        {link.title}
                      </p>
                      <p className="truncate text-xs opacity-80 font-mono">
                        {link.url}
                      </p>
                    </div>
                  </div>

                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg opacity-75">
                    <ExternalLink
                      className={`h-4 w-4 ${
                        isAnimated
                          ? "transition group-hover:translate-x-1 group-hover:opacity-100 motion-reduce:transition-none motion-reduce:transform-none"
                          : ""
                      }`}
                    />
                  </div>
                </a>
              ))
            : null}

          {!hasAnyLinks ? (
            <div
              id="public-empty-links-state"
              className={`border border-dashed border-current/20 p-8 text-center backdrop-blur-md ${radiusClass}`}
            >
              <Sparkles className="mx-auto h-6 w-6 opacity-60" />
              <p className="mt-2 text-sm font-semibold text-current">
                Belum ada tautan yang ditambahkan
              </p>
              <p className="mt-1 text-xs opacity-60">
                Pemilik halaman sedang menyiapkan konten tautan terbaik untuk
                Anda.
              </p>
            </div>
          ) : null}
        </main>

        {/* Footer Branding */}
        <footer
          id="public-brand-footer"
          className="mt-auto border-t border-current/15 pt-6 text-center"
        >
          <Link
            href="/"
            className={`inline-flex items-center gap-1.5 font-mono text-xs opacity-60 ${
              isAnimated
                ? "transition hover:opacity-100 motion-reduce:transition-none motion-reduce:transform-none"
                : ""
            }`}
          >
            <span>Dibuat dengan</span>
            <strong className="font-bold opacity-90">SIT</strong>
            <span>• Link-in-Bio Mandiri</span>
          </Link>
        </footer>
      </div>
    </div>
  );
}

export default async function PublicPage({ params }: PublicPageProps) {
  const { slug } = await params;

  const parsedSlug = slugSchema.safeParse(slug);
  if (!parsedSlug.success) {
    notFound();
  }

  const page = await getPublicPage(slug);
  if (!page) {
    notFound();
  }

  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0A0E17] text-white">
          <div className="mx-auto max-w-lg px-4 py-12">
            <div className="mx-auto h-24 w-24 animate-pulse rounded-full bg-slate-800" />
            <div className="mx-auto mt-4 h-6 w-40 animate-pulse rounded-lg bg-slate-800" />
            <div className="mt-8 space-y-3">
              <div className="h-16 animate-pulse rounded-2xl bg-slate-800" />
              <div className="h-16 animate-pulse rounded-2xl bg-slate-800" />
              <div className="h-16 animate-pulse rounded-2xl bg-slate-800" />
            </div>
          </div>
        </div>
      }
    >
      <PublicPageContent page={page} />
    </Suspense>
  );
}
