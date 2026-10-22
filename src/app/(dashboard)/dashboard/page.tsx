import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowUpRight,
  ExternalLink,
  LayoutGrid,
  LogOut,
  Plus,
  Settings,
  UserRound,
} from "lucide-react";
import { Suspense } from "react";
import { logoutAction } from "@/app/(auth)/login/_actions/auth";
import { requireUser } from "@/lib/auth/require-user";
import { PageCreateForm } from "./_components/page-create-form";

export const metadata: Metadata = {
  title: "Dashboard — SIT",
  description: "Kelola semua halaman link-in-bio Anda dari satu tempat.",
};

type DashboardPageProps = {
  searchParams: Promise<{
    created?: string | string[];
    deleted?: string | string[];
  }>;
};

function statusLabel(status: string) {
  if (status === "published") return "Published";
  if (status === "archived") return "Archived";
  return "Draft";
}

function statusClassName(status: string) {
  if (status === "published") {
    return "bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-950/40 dark:text-emerald-300";
  }

  if (status === "archived") {
    return "bg-slate-100 text-slate-600 ring-slate-500/20 dark:bg-slate-800 dark:text-slate-300";
  }

  return "bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-950/40 dark:text-amber-300";
}

async function DashboardContent({ searchParams }: DashboardPageProps) {
  const [{ profile, supabase }, params] = await Promise.all([
    requireUser(),
    searchParams,
  ]);
  const { data: pages, error } = await supabase
    .from("pages")
    .select("id, slug, title, description, status, admin_disabled, created_at")
    .order("created_at", { ascending: false });

  const createdId =
    typeof params.created === "string" ? params.created : undefined;
  const isDeleted =
    params.deleted === "true" ||
    (Array.isArray(params.deleted) && params.deleted[0] === "true");
  const pageRows = pages ?? [];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950 dark:bg-slate-950 dark:text-slate-50">
      <header className="border-b border-slate-200/80 bg-white/90 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90">
        <div className="mx-auto flex min-h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <Link
            href="/dashboard"
            className="flex min-h-11 items-center gap-3 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-500/20"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-sm font-bold tracking-tight text-white shadow-sm">
              S
            </span>
            <span>
              <span className="block text-sm font-bold tracking-tight">
                SIT
              </span>
              <span className="hidden text-xs text-slate-500 dark:text-slate-400 sm:block">
                Workspace halaman Anda
              </span>
            </span>
          </Link>

          <div className="flex items-center gap-2 sm:gap-4">
            <div className="hidden items-center gap-2 text-right sm:flex">
              <UserRound
                aria-hidden="true"
                className="h-4 w-4 text-slate-400"
              />
              <div className="max-w-44">
                <p className="truncate text-xs font-semibold text-slate-800 dark:text-slate-200">
                  {profile.display_name || profile.email}
                </p>
                <p className="truncate text-[11px] text-slate-500 dark:text-slate-400">
                  {profile.email}
                </p>
              </div>
            </div>
            <form action={logoutAction}>
              <button
                type="submit"
                aria-label="Keluar dari SIT"
                className="flex min-h-11 cursor-pointer items-center gap-2 rounded-xl border border-slate-200 px-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-blue-500/20 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-900"
              >
                <LogOut aria-hidden="true" className="h-4 w-4" />
                <span className="hidden sm:inline">Keluar</span>
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <section className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-blue-600 dark:text-blue-400">
              Dashboard
            </p>
            <h1 className="text-3xl font-bold tracking-tight text-slate-950 dark:text-white sm:text-4xl">
              Semua halaman Anda
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-400">
              Buat halaman berbeda untuk setiap kebutuhan, lalu kelola semuanya
              dari satu workspace.
            </p>
          </div>
          <a
            href="#buat-halaman"
            className="flex min-h-11 w-fit cursor-pointer items-center gap-2 rounded-xl bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-slate-500/25 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
          >
            <Plus aria-hidden="true" className="h-4 w-4" />
            Halaman baru
          </a>
        </section>

        {createdId ? (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3.5 text-sm text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-200">
            <span
              className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-emerald-500"
              aria-hidden="true"
            />
            Halaman berhasil dibuat. Anda bisa melanjutkan ke pengaturan konten
            pada tahap berikutnya.
          </div>
        ) : null}

        {isDeleted ? (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-100/90 px-4 py-3.5 text-sm text-slate-800 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200">
            <span
              className="mt-1 h-2 w-2 shrink-0 rounded-full bg-slate-500"
              aria-hidden="true"
            />
            Halaman berhasil dihapus.
          </div>
        ) : null}

        <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
          <section
            aria-labelledby="pages-heading"
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/60 sm:p-6"
          >
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <h2
                  id="pages-heading"
                  className="text-lg font-bold tracking-tight"
                >
                  Halaman yang Anda kelola
                </h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  {pageRows.length} halaman tersimpan
                </p>
              </div>
              <LayoutGrid
                aria-hidden="true"
                className="h-5 w-5 text-blue-500"
              />
            </div>

            {error ? (
              <div
                role="alert"
                className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-200"
              >
                Daftar halaman belum dapat dimuat. Silakan refresh halaman ini.
              </div>
            ) : pageRows.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-5 py-12 text-center dark:border-slate-700 dark:bg-slate-950/50">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-blue-600 dark:bg-blue-950/60 dark:text-blue-300">
                  <Plus aria-hidden="true" className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-base font-bold">
                  Mulai dari halaman pertama
                </h3>
                <p className="mx-auto mt-1 max-w-sm text-sm leading-6 text-slate-500 dark:text-slate-400">
                  Buat satu halaman untuk mulai mengatur profil, tautan, dan
                  tampilan publik Anda.
                </p>
                <a
                  href="#buat-halaman"
                  className="mt-5 inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-500/25"
                >
                  Buat halaman pertama{" "}
                  <ArrowUpRight aria-hidden="true" className="h-4 w-4" />
                </a>
              </div>
            ) : (
              <div className="grid gap-3">
                {pageRows.map((page) => {
                  const date = new Intl.DateTimeFormat("id-ID", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  }).format(new Date(page.created_at));
                  const isAvailable =
                    page.status === "published" && !page.admin_disabled;

                  return (
                    <article
                      key={page.id}
                      className="group rounded-2xl border border-slate-200 p-4 transition hover:border-blue-200 hover:shadow-sm dark:border-slate-800 dark:hover:border-blue-900 sm:p-5"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <Link
                              href={`/dashboard/pages/${page.id}/edit`}
                              className="truncate text-base font-bold text-slate-900 transition hover:text-blue-600 dark:text-white dark:hover:text-blue-400"
                            >
                              {page.title}
                            </Link>
                            <span
                              className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-bold ring-1 ring-inset ${statusClassName(page.status)}`}
                            >
                              {statusLabel(page.status)}
                            </span>
                          </div>
                          <p className="mt-1 truncate text-sm text-slate-500 dark:text-slate-400">
                            /{page.slug}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/dashboard/pages/${page.id}/edit`}
                            className="inline-flex min-h-9 items-center gap-1.5 rounded-xl border border-slate-200 px-3 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 hover:text-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-500/20 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-blue-400"
                          >
                            <Settings className="h-3.5 w-3.5" />
                            <span>Kelola</span>
                          </Link>
                          {isAvailable ? (
                            <a
                              href={`/${page.slug}`}
                              target="_blank"
                              rel="noreferrer"
                              aria-label={`Buka halaman ${page.title}`}
                              className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition hover:bg-blue-50 hover:text-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-500/20 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-blue-950/40 dark:hover:text-blue-300"
                            >
                              <ExternalLink
                                aria-hidden="true"
                                className="h-3.5 w-3.5"
                              />
                            </a>
                          ) : null}
                        </div>
                      </div>
                      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
                        <span>Dibuat {date}</span>
                        <span>{page.description || "Belum ada deskripsi"}</span>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>

          <aside
            id="buat-halaman"
            className="scroll-mt-6 rounded-2xl border border-blue-100 bg-gradient-to-b from-blue-50 to-white p-5 shadow-sm dark:border-blue-950/70 dark:from-blue-950/40 dark:to-slate-900 sm:p-6"
          >
            <div className="mb-5">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
                <Plus aria-hidden="true" className="h-5 w-5" />
              </div>
              <h2 className="text-xl font-bold tracking-tight">
                Buat halaman baru
              </h2>
              <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-400">
                Siapkan nama dan alamat unik. Konten bisa Anda lengkapi setelah
                halaman dibuat.
              </p>
            </div>
            <PageCreateForm />
          </aside>
        </div>
      </main>
    </div>
  );
}

export default function DashboardPage(props: DashboardPageProps) {
  return (
    <Suspense
      fallback={<div className="min-h-screen bg-slate-50 dark:bg-slate-950" />}
    >
      <DashboardContent {...props} />
    </Suspense>
  );
}
