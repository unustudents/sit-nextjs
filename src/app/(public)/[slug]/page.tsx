import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  Camera,
  ChevronRight,
  ExternalLink,
  Link as LinkIcon,
  ShieldAlert,
  Sparkles,
} from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { slugSchema } from "@/lib/validators/page";
import {
  SocialIcon,
  getSocialPlatform,
  formatSocialSubtitle,
} from "@/components/ui/social-icons";
import type { SocialLink } from "@/types/database.types";
import { PublicShareButton } from "./_components/public-share-button";

type PublicPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: PublicPageProps): Promise<Metadata> {
  const { slug } = await params;
  const parsed = slugSchema.safeParse(slug);
  if (!parsed.success) {
    return { title: "Halaman Tidak Ditemukan — SIT" };
  }

  const adminClient = createAdminClient();
  const { data: page } = await adminClient
    .from("pages")
    .select("title, description")
    .eq("slug", slug)
    .single();

  if (!page) {
    return { title: "Halaman Tidak Ditemukan — SIT" };
  }

  return {
    title: `${page.title} (@${slug}) — SIT`,
    description:
      page.description || `Kunjungi tautan profil ${page.title} di SIT.`,
  };
}

export default async function PublicPage({ params }: PublicPageProps) {
  const { slug } = await params;

  const parsedSlug = slugSchema.safeParse(slug);
  if (!parsedSlug.success) {
    notFound();
  }

  const adminClient = createAdminClient();
  const { data: page, error } = await adminClient
    .from("pages")
    .select(
      "id, slug, title, description, avatar_path, social_links, theme_config, status, admin_disabled, owner_id",
    )
    .eq("slug", slug)
    .single();

  if (error || !page || page.admin_disabled) {
    notFound();
  }

  const isPublished = page.status === "published";
  let isOwnerOrAdmin = false;

  if (!isPublished) {
    try {
      const userSupabase = await createClient();
      const { data: claimsData } = await userSupabase.auth.getClaims();
      const currentUserId = claimsData?.claims?.sub;

      if (currentUserId) {
        const { data: profile } = await userSupabase
          .from("profiles")
          .select("role, is_active")
          .eq("id", currentUserId)
          .single();

        isOwnerOrAdmin =
          page.owner_id === currentUserId ||
          (profile?.role === "admin" && !!profile?.is_active);
      }
    } catch {
      isOwnerOrAdmin = false;
    }

    if (!isOwnerOrAdmin) {
      notFound();
    }
  }

  const { data: customLinks } = await adminClient
    .from("links")
    .select("id, title, url, icon, sort_order")
    .eq("page_id", page.id)
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  const socialLinks = (
    Array.isArray(page.social_links) ? page.social_links : []
  ) as SocialLink[];

  const getInitials = (text: string) => {
    return text
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() || "")
      .join("");
  };

  const hasAnyLinks =
    socialLinks.length > 0 || (customLinks && customLinks.length > 0);

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#0A0E17] text-slate-100 antialiased selection:bg-blue-600 selection:text-white">
      {/* Ambient background glow orbs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-32 left-1/2 h-[450px] w-[500px] -translate-x-1/2 rounded-full bg-gradient-to-b from-blue-600/25 via-indigo-600/15 to-transparent blur-3xl" />
        <div className="absolute top-1/3 -right-32 h-80 w-80 rounded-full bg-purple-600/15 blur-3xl" />
        <div className="absolute bottom-20 -left-32 h-80 w-80 rounded-full bg-cyan-600/15 blur-3xl" />
      </div>

      {!isPublished ? (
        <aside
          aria-label="Informasi Pratinjau"
          className="relative z-20 border-b border-amber-500/30 bg-amber-950/70 px-4 py-2 text-center text-xs font-semibold text-amber-200 backdrop-blur-md"
        >
          <div className="mx-auto flex max-w-md items-center justify-center gap-2">
            <ShieldAlert className="h-4 w-4 shrink-0 text-amber-400" />
            <span>
              Mode Pratinjau Pemilik — Status halaman:{" "}
              <strong className="uppercase">{page.status}</strong>
            </span>
          </div>
        </aside>
      ) : null}

      <div className="relative z-10 mx-auto flex min-h-screen max-w-lg flex-col justify-between px-4 py-6 sm:px-6 sm:py-8">
        {/* Top Header Bar */}
        <nav
          aria-label="Aksi Halaman"
          className="flex items-center justify-between pb-6"
        >
          <div className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 font-mono text-[11px] font-medium text-slate-300 backdrop-blur-md">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>@{page.slug}</span>
          </div>

          <PublicShareButton title={page.title} slug={page.slug} />
        </nav>

        {/* Profile Hero Section */}
        <header className="flex flex-col items-center text-center">
          {/* Avatar with radiant gradient ring */}
          <div className="relative mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-tr from-blue-500 via-indigo-500 to-purple-500 p-[3px] shadow-2xl shadow-indigo-500/25 sm:h-28 sm:w-28">
            <div className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-full bg-[#0E1424]">
              {page.avatar_path ? (
                <Image
                  src={`/api/assets/pages/${page.id}?v=${encodeURIComponent(page.avatar_path)}`}
                  alt={`Avatar ${page.title}`}
                  fill
                  unoptimized
                  sizes="(max-width: 640px) 96px, 112px"
                  className="object-cover"
                  priority
                />
              ) : (
                <span className="text-2xl font-black tracking-tight text-white sm:text-3xl">
                  {page.title.trim() ? (
                    getInitials(page.title)
                  ) : (
                    <Camera className="h-8 w-8 text-slate-400" />
                  )}
                </span>
              )}
            </div>
          </div>

          {/* Profile Name & Verified Badge */}
          <div className="flex items-center justify-center gap-1.5">
            <h1 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
              {page.title}
            </h1>
            <span
              title="Terverifikasi SIT"
              className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-blue-500 text-white"
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

          {/* Bio / Description */}
          {page.description ? (
            <p className="mt-2 max-w-sm text-sm leading-relaxed text-slate-300">
              {page.description}
            </p>
          ) : null}

          {/* Quick Circular Social Icons Row */}
          {socialLinks.length > 0 ? (
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
              {socialLinks.map((item, idx) => (
                <a
                  key={`hero-${item.icon}-${idx}`}
                  href={item.url}
                  target="_blank"
                  rel="noreferrer noopener"
                  title={item.label}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.06] text-slate-300 backdrop-blur-md transition hover:scale-110 hover:border-white/30 hover:bg-white/[0.15] hover:text-white active:scale-95"
                >
                  <SocialIcon icon={item.icon} className="h-4 w-4" />
                </a>
              ))}
            </div>
          ) : null}
        </header>

        {/* Linktree-Style Tactile Link Buttons Section */}
        <main
          aria-label="Daftar Tautan"
          className="mt-8 w-full flex-1 space-y-3.5"
        >
          {/* Social Links rendered as full Linktree cards */}
          {socialLinks.map((item, idx) => {
            const platform = getSocialPlatform(item.icon);
            const subtitle = formatSocialSubtitle(
              platform?.id || item.icon,
              item.url,
            );

            return (
              <a
                key={`card-${item.icon}-${idx}`}
                href={item.url}
                target="_blank"
                rel="noreferrer noopener"
                className="group flex w-full items-center justify-between gap-3.5 rounded-2xl border border-white/10 bg-white/[0.06] p-3.5 shadow-lg shadow-black/25 backdrop-blur-md transition-all duration-200 hover:-translate-y-0.5 hover:border-white/25 hover:bg-white/[0.12] hover:shadow-xl hover:shadow-indigo-500/10 active:translate-y-0 active:scale-[0.99] sm:p-4"
              >
                <div className="flex min-w-0 items-center gap-3.5">
                  <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl shadow-md transition group-hover:scale-105 ${
                      platform?.badgeBg || "bg-blue-600 text-white"
                    }`}
                  >
                    <SocialIcon icon={item.icon} className="h-5 w-5" />
                  </div>

                  <div className="min-w-0 text-left">
                    <p className="truncate text-sm font-bold text-white transition group-hover:text-blue-300">
                      {item.label}
                    </p>
                    <p className="truncate text-xs text-slate-400">
                      {subtitle || platform?.defaultSubtitle || item.url}
                    </p>
                  </div>
                </div>

                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 transition group-hover:translate-x-1 group-hover:text-white">
                  <ChevronRight className="h-4 w-4" />
                </div>
              </a>
            );
          })}

          {/* Custom Links from links table */}
          {customLinks && customLinks.length > 0
            ? customLinks.map((link) => (
                <a
                  key={link.id}
                  href={`/api/click/${link.id}`}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="group flex w-full items-center justify-between gap-3.5 rounded-2xl border border-white/10 bg-white/[0.06] p-3.5 shadow-lg shadow-black/25 backdrop-blur-md transition-all duration-200 hover:-translate-y-0.5 hover:border-white/25 hover:bg-white/[0.12] hover:shadow-xl hover:shadow-indigo-500/10 active:translate-y-0 active:scale-[0.99] sm:p-4"
                >
                  <div className="flex min-w-0 items-center gap-3.5">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-800 text-slate-200 shadow-md transition group-hover:scale-105 group-hover:bg-blue-600 group-hover:text-white">
                      <LinkIcon className="h-5 w-5" />
                    </div>

                    <div className="min-w-0 text-left">
                      <p className="truncate text-sm font-bold text-white transition group-hover:text-blue-300">
                        {link.title}
                      </p>
                      <p className="truncate text-xs text-slate-400 font-mono">
                        {link.url}
                      </p>
                    </div>
                  </div>

                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 transition group-hover:translate-x-1 group-hover:text-white">
                    <ExternalLink className="h-4 w-4" />
                  </div>
                </a>
              ))
            : null}

          {!hasAnyLinks ? (
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-8 text-center backdrop-blur-md">
              <Sparkles className="mx-auto h-6 w-6 text-blue-400" />
              <p className="mt-2 text-sm font-semibold text-white">
                Belum ada tautan yang ditambahkan
              </p>
              <p className="mt-1 text-xs text-slate-400">
                Pemilik halaman belum menyematkan tautan pada profil ini.
              </p>
            </div>
          ) : null}
        </main>

        {/* Linktree style Branding Footer */}
        <footer className="pt-10 pb-2 text-center">
          <Link
            href="/"
            className="group inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-1.5 text-xs font-semibold text-slate-400 backdrop-blur-md transition hover:border-white/25 hover:bg-white/[0.08] hover:text-white"
          >
            <span className="flex h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
            <span>Dibuat dengan</span>
            <span className="font-extrabold tracking-tight text-white transition group-hover:text-blue-400">
              SIT
            </span>
          </Link>
        </footer>
      </div>
    </div>
  );
}
