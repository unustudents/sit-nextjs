"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  AlertTriangle,
  AtSign,
  CheckCircle2,
  ExternalLink,
  FileText,
  Loader2,
  Save,
  Trash2,
  User,
  Share2,
} from "lucide-react";
import {
  updatePageAction,
  deletePageAction,
  type UpdatePageState,
} from "@/app/(dashboard)/dashboard/_actions/pages";
import { AvatarUploader } from "./avatar-uploader";
import {
  SocialLinksManager,
  type SocialLinkItem,
} from "./social-links-manager";
import { PageLivePreview } from "./page-live-preview";

type PageEditFormProps = {
  initialData: {
    id: string;
    title: string;
    slug: string;
    description: string;
    avatar_path: string | null;
    social_links: SocialLinkItem[] | null;
    status: "draft" | "published" | "archived";
    admin_disabled: boolean;
    created_at: string;
    published_at: string | null;
  };
};

export function PageEditForm({ initialData }: PageEditFormProps) {
  const [state, formAction, isPending] = useActionState<
    UpdatePageState | null,
    FormData
  >(updatePageAction, null);

  const [status, setStatus] = useState<"draft" | "published" | "archived">(
    initialData.status,
  );
  const [title, setTitle] = useState(initialData.title);
  const [slug, setSlug] = useState(initialData.slug);
  const [description, setDescription] = useState(initialData.description ?? "");
  const [avatarPath, setAvatarPath] = useState<string | null>(
    initialData.avatar_path,
  );
  const [socialLinks, setSocialLinks] = useState<SocialLinkItem[]>(
    Array.isArray(initialData.social_links) ? initialData.social_links : [],
  );

  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const isLive =
    initialData.status === "published" && !initialData.admin_disabled;

  return (
    <div className="space-y-8">
      {initialData.admin_disabled ? (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-2xl border border-rose-300 bg-rose-50 p-4 text-sm text-rose-900 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-200"
        >
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-rose-600 dark:text-rose-400" />
          <div>
            <p className="font-semibold">Halaman Dinonaktifkan oleh Admin</p>
            <p className="mt-0.5 text-xs leading-5 text-rose-800 dark:text-rose-300">
              Halaman ini telah diblokir secara administratif dan tidak akan
              dapat diakses oleh publik sampai peninjauan selesai.
            </p>
          </div>
        </div>
      ) : null}

      <div className="grid gap-8 lg:grid-cols-12 lg:items-start">
        {/* Main Editor Form */}
        <div className="space-y-8 lg:col-span-8">
          <form action={formAction} className="space-y-6">
            <input type="hidden" name="id" value={initialData.id} />
            <input type="hidden" name="avatar_path" value={avatarPath ?? ""} />
            <input
              type="hidden"
              name="social_links"
              value={JSON.stringify(socialLinks)}
            />

            {state?.success ? (
              <div
                role="status"
                className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3.5 text-sm font-medium text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-200"
              >
                <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                <span>{state.success}</span>
              </div>
            ) : null}

            {state?.error ? (
              <div
                role="alert"
                className="flex items-center gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3.5 text-sm font-medium text-rose-800 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-200"
              >
                <AlertCircle className="h-5 w-5 shrink-0 text-rose-600 dark:text-rose-400" />
                <span>{state.error}</span>
              </div>
            ) : null}

            {/* Profile & Avatar Section */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/60 sm:p-7">
              <div className="mb-6 flex flex-col justify-between gap-2 border-b border-slate-100 pb-5 dark:border-slate-800 sm:flex-row sm:items-center">
                <div>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                      Profil & Foto Avatar
                    </h2>
                  </div>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    Foto avatar independen untuk halaman ini, disimpan secara
                    aman dan diisolasi per halaman.
                  </p>
                </div>
              </div>

              <AvatarUploader
                pageId={initialData.id}
                currentAvatarPath={avatarPath}
                pageTitle={title}
                onAvatarChange={(newPath) => setAvatarPath(newPath)}
              />
            </div>

            {/* Social Links Section */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/60 sm:p-7">
              <div className="mb-4 flex items-center gap-2">
                <Share2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  Media Sosial
                </h2>
              </div>
              <SocialLinksManager
                links={socialLinks}
                onChange={setSocialLinks}
              />
            </div>

            {/* Main Info Section */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/60 sm:p-7">
              <div className="mb-6 flex flex-col justify-between gap-2 border-b border-slate-100 pb-5 dark:border-slate-800 sm:flex-row sm:items-center">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                    Informasi Utama
                  </h2>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    Nama, alamat publik, dan deskripsi pengenal halaman Anda.
                  </p>
                </div>
                {isLive ? (
                  <a
                    href={`/${initialData.slug}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex min-h-9 items-center gap-1.5 rounded-xl border border-slate-200 px-3 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 hover:text-blue-600 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-blue-400"
                  >
                    <span>Lihat Halaman Publik</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                ) : null}
              </div>

              <div className="space-y-5">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor="edit-page-title"
                      className="text-sm font-semibold text-slate-900 dark:text-slate-100"
                    >
                      Nama Halaman
                    </label>
                    <span className="text-xs text-slate-400">
                      {title.length}/120
                    </span>
                  </div>
                  <div className="relative">
                    <FileText
                      aria-hidden="true"
                      className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      id="edit-page-title"
                      name="title"
                      type="text"
                      required
                      maxLength={120}
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Contoh: Layanan TI Korporat"
                      className="min-h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 pl-10 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                      aria-describedby={
                        state?.fieldErrors?.title
                          ? "edit-title-error"
                          : undefined
                      }
                    />
                  </div>
                  {state?.fieldErrors?.title ? (
                    <p
                      id="edit-title-error"
                      className="text-xs text-rose-600 dark:text-rose-300"
                    >
                      {state.fieldErrors.title[0]}
                    </p>
                  ) : null}
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="edit-page-slug"
                    className="text-sm font-semibold text-slate-900 dark:text-slate-100"
                  >
                    Alamat URL (Slug)
                  </label>
                  <div className="flex min-h-11 items-center rounded-xl border border-slate-200 bg-white focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-950">
                    <span className="pl-3.5 text-sm text-slate-400 dark:text-slate-500">
                      /
                    </span>
                    <AtSign
                      aria-hidden="true"
                      className="ml-2 h-4 w-4 shrink-0 text-slate-400"
                    />
                    <input
                      id="edit-page-slug"
                      name="slug"
                      type="text"
                      required
                      minLength={3}
                      maxLength={40}
                      pattern="[a-z0-9](?:[a-z0-9-]{1,38}[a-z0-9])"
                      value={slug}
                      onChange={(e) => setSlug(e.target.value.toLowerCase())}
                      spellCheck={false}
                      placeholder="layanan-ti"
                      className="min-h-11 min-w-0 flex-1 bg-transparent px-2.5 text-sm text-slate-900 outline-none placeholder:text-slate-400 dark:text-slate-100"
                      aria-describedby={
                        state?.fieldErrors?.slug
                          ? "edit-slug-error"
                          : "edit-slug-help"
                      }
                    />
                  </div>
                  <p
                    id="edit-slug-help"
                    className="text-xs leading-5 text-slate-500 dark:text-slate-400"
                  >
                    Huruf kecil, angka, dan tanda hubung (-). Mengubah slug akan
                    mengubah alamat publik halaman.
                  </p>
                  {state?.fieldErrors?.slug ? (
                    <p
                      id="edit-slug-error"
                      className="text-xs text-rose-600 dark:text-rose-300"
                    >
                      {state.fieldErrors.slug[0]}
                    </p>
                  ) : null}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor="edit-page-desc"
                      className="text-sm font-semibold text-slate-900 dark:text-slate-100"
                    >
                      Deskripsi Singkat{" "}
                      <span className="font-normal text-slate-400">
                        (opsional)
                      </span>
                    </label>
                    <span className="text-xs text-slate-400">
                      {description.length}/500
                    </span>
                  </div>
                  <textarea
                    id="edit-page-desc"
                    name="description"
                    rows={3}
                    maxLength={500}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Tuliskan deskripsi profil atau tujuan tautan halaman ini..."
                    className="w-full rounded-xl border border-slate-200 bg-white p-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                    aria-describedby={
                      state?.fieldErrors?.description
                        ? "edit-desc-error"
                        : undefined
                    }
                  />
                  {state?.fieldErrors?.description ? (
                    <p
                      id="edit-desc-error"
                      className="text-xs text-rose-600 dark:text-rose-300"
                    >
                      {state.fieldErrors.description[0]}
                    </p>
                  ) : null}
                </div>
              </div>
            </div>

            {/* Status Section */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/60 sm:p-7">
              <div className="mb-4">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  Status Publikasi
                </h2>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Tentukan apakah halaman dapat diakses langsung oleh pengunjung
                  atau disimpan sebagai draf.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <label
                  className={`flex cursor-pointer flex-col justify-between rounded-xl border p-4 transition ${
                    status === "draft"
                      ? "border-amber-500 bg-amber-50/50 ring-2 ring-amber-500/20 dark:border-amber-500 dark:bg-amber-950/20"
                      : "border-slate-200 hover:border-slate-300 dark:border-slate-700 dark:hover:border-slate-600"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="inline-flex rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-bold text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                      Draft
                    </span>
                    <input
                      type="radio"
                      name="status"
                      value="draft"
                      checked={status === "draft"}
                      onChange={() => setStatus("draft")}
                      className="h-4 w-4 text-amber-600 focus:ring-amber-500"
                    />
                  </div>
                  <p className="mt-3 text-xs leading-5 text-slate-600 dark:text-slate-400">
                    Hanya dapat dilihat dan diedit oleh Anda melalui dashboard.
                  </p>
                </label>

                <label
                  className={`flex cursor-pointer flex-col justify-between rounded-xl border p-4 transition ${
                    status === "published"
                      ? "border-emerald-500 bg-emerald-50/50 ring-2 ring-emerald-500/20 dark:border-emerald-500 dark:bg-emerald-950/20"
                      : "border-slate-200 hover:border-slate-300 dark:border-slate-700 dark:hover:border-slate-600"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="inline-flex rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                      Published
                    </span>
                    <input
                      type="radio"
                      name="status"
                      value="published"
                      checked={status === "published"}
                      onChange={() => setStatus("published")}
                      className="h-4 w-4 text-emerald-600 focus:ring-emerald-500"
                    />
                  </div>
                  <p className="mt-3 text-xs leading-5 text-slate-600 dark:text-slate-400">
                    Halaman live dan dapat diakses publik melalui /
                    {slug || initialData.slug}.
                  </p>
                </label>

                <label
                  className={`flex cursor-pointer flex-col justify-between rounded-xl border p-4 transition ${
                    status === "archived"
                      ? "border-slate-500 bg-slate-100/70 ring-2 ring-slate-500/20 dark:border-slate-500 dark:bg-slate-800/40"
                      : "border-slate-200 hover:border-slate-300 dark:border-slate-700 dark:hover:border-slate-600"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="inline-flex rounded-full bg-slate-200 px-2.5 py-0.5 text-xs font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                      Archived
                    </span>
                    <input
                      type="radio"
                      name="status"
                      value="archived"
                      checked={status === "archived"}
                      onChange={() => setStatus("archived")}
                      className="h-4 w-4 text-slate-600 focus:ring-slate-500"
                    />
                  </div>
                  <p className="mt-3 text-xs leading-5 text-slate-600 dark:text-slate-400">
                    Halaman dinonaktifkan sementara dari akses publik tanpa
                    menghapus tautan.
                  </p>
                </label>
              </div>
            </div>

            <div className="flex items-center justify-between gap-4 pt-2">
              <Link
                href="/dashboard"
                className="inline-flex min-h-11 items-center rounded-xl border border-slate-200 px-5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-slate-500/10 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Batal
              </Link>
              <button
                type="submit"
                disabled={isPending}
                className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-xl bg-blue-600 px-6 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-500/25 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Menyimpan...</span>
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    <span>Simpan Perubahan</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Danger Zone */}
          <section className="rounded-2xl border border-rose-200 bg-rose-50/50 p-5 shadow-sm dark:border-rose-950/60 dark:bg-rose-950/20 sm:p-7">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-100 text-rose-600 dark:bg-rose-900/40 dark:text-rose-400">
                <Trash2 className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-bold text-rose-950 dark:text-rose-200">
                  Zona Bahaya: Hapus Halaman
                </h3>
                <p className="mt-1 text-xs leading-5 text-rose-800 dark:text-rose-300">
                  Menghapus halaman ini akan menghapus semua foto avatar, tautan
                  media sosial, koleksi tautan, dan riwayat analitik yang
                  terkait. Tindakan ini permanen dan tidak dapat dipulihkan.
                </p>

                {confirmDelete ? (
                  <form
                    action={async (formData) => {
                      setIsDeleting(true);
                      try {
                        await deletePageAction(formData);
                      } finally {
                        setIsDeleting(false);
                      }
                    }}
                    className="mt-4 flex flex-wrap items-center gap-3"
                  >
                    <input type="hidden" name="pageId" value={initialData.id} />
                    <button
                      type="submit"
                      disabled={isDeleting}
                      className="inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-xl bg-rose-600 px-4 text-xs font-semibold text-white shadow-sm transition hover:bg-rose-700 focus:outline-none focus:ring-4 focus:ring-rose-500/25 disabled:opacity-60"
                    >
                      {isDeleting ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="h-3.5 w-3.5" />
                      )}
                      <span>Ya, Hapus Halaman Permanen</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmDelete(false)}
                      className="inline-flex min-h-10 cursor-pointer items-center rounded-xl border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
                    >
                      Batalkan
                    </button>
                  </form>
                ) : (
                  <div className="mt-4">
                    <button
                      type="button"
                      onClick={() => setConfirmDelete(true)}
                      className="inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-xl border border-rose-300 bg-white px-4 text-xs font-semibold text-rose-700 transition hover:bg-rose-100/60 focus:outline-none focus:ring-4 focus:ring-rose-500/20 dark:border-rose-900/60 dark:bg-slate-900 dark:text-rose-300 dark:hover:bg-rose-950/40"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>Hapus Halaman Ini</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </section>
        </div>

        {/* Live Preview Side Column */}
        <div className="lg:col-span-4 lg:sticky lg:top-8">
          <PageLivePreview
            title={title}
            slug={slug}
            description={description}
            avatarUrl={
              avatarPath
                ? `/api/assets/pages/${initialData.id}?v=${encodeURIComponent(
                    avatarPath,
                  )}`
                : null
            }
            socialLinks={socialLinks}
            status={status}
          />
        </div>
      </div>
    </div>
  );
}
