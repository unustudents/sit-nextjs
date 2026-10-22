"use client";

import { useActionState, useState } from "react";
import {
  AlertCircle,
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  FileText,
  Layers,
  Loader2,
  Palette,
  QrCode,
  Save,
  Settings,
  Share2,
  Trash2,
  User,
} from "lucide-react";
import {
  updatePageAction,
  deletePageAction,
  type UpdatePageState,
} from "@/app/(dashboard)/dashboard/_actions/pages";
import type { LinkRow } from "@/app/(dashboard)/dashboard/_actions/links";
import type { ThemeConfig } from "@/types/database.types";
import { DEFAULT_THEME } from "@/lib/validators/theme";
import { AvatarUploader } from "./avatar-uploader";
import {
  SocialLinksManager,
  type SocialLinkItem,
} from "./social-links-manager";
import { LinksManager } from "./links-manager";
import { ThemeEditor } from "./theme-editor";
import { PageLivePreview, type CustomLinkItem } from "./page-live-preview";

type PageEditFormProps = {
  initialData: {
    id: string;
    title: string;
    slug: string;
    description: string;
    avatar_path: string | null;
    social_links: SocialLinkItem[] | null;
    theme_config?: ThemeConfig | null;
    status: "draft" | "published" | "archived";
    admin_disabled: boolean;
    created_at: string;
    published_at: string | null;
  };
  initialLinks?: LinkRow[];
  initialTab?: "profile" | "links" | "theme";
};

export function PageEditForm({
  initialData,
  initialLinks = [],
  initialTab = "profile",
}: PageEditFormProps) {
  const [activeTab, setActiveTab] = useState<"profile" | "links" | "theme">(initialTab);
  const [theme, setTheme] = useState<ThemeConfig>(
    initialData.theme_config && initialData.theme_config.version === 1
      ? initialData.theme_config
      : DEFAULT_THEME,
  );

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
  const [customLinks, setCustomLinks] = useState<CustomLinkItem[]>(
    initialLinks.map((l) => ({
      id: l.id,
      title: l.title,
      url: l.url,
      icon: l.icon,
      sort_order: l.sort_order,
      is_active: l.is_active,
    })),
  );

  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

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

      {/* Feature Navigation Tabs */}
      <div className="flex overflow-x-auto border-b border-slate-200 dark:border-slate-800">
        <div className="flex gap-1 py-1">
          <button
            type="button"
            onClick={() => setActiveTab("profile")}
            className={`flex min-h-10 items-center gap-2 border-b-2 px-4 text-xs font-bold transition-all ${
              activeTab === "profile"
                ? "border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400"
                : "border-transparent text-slate-600 hover:border-slate-300 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            }`}
          >
            <Settings className="h-4 w-4" />
            <span>Profil & Pengaturan</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("links")}
            className={`flex min-h-10 items-center gap-2 border-b-2 px-4 text-xs font-bold transition-all ${
              activeTab === "links"
                ? "border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400"
                : "border-transparent text-slate-600 hover:border-slate-300 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            }`}
          >
            <Layers className="h-4 w-4" />
            <span>Tautan (Links)</span>
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                activeTab === "links"
                  ? "bg-blue-600 text-white"
                  : "bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
              }`}
            >
              {customLinks.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("theme")}
            className={`flex min-h-10 items-center gap-2 border-b-2 px-4 text-xs font-bold transition-all ${
              activeTab === "theme"
                ? "border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400"
                : "border-transparent text-slate-600 hover:border-slate-300 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            }`}
          >
            <Palette className="h-4 w-4" />
            <span>Tema Visual</span>
          </button>

          <span
            title="Akan aktif pada Langkah 10 - QR & Analytics"
            className="flex min-h-10 cursor-not-allowed items-center gap-2 border-b-2 border-transparent px-4 text-xs font-medium text-slate-400 opacity-60 dark:text-slate-500"
          >
            <QrCode className="h-4 w-4" />
            <span>QR Code</span>
          </span>

          <span
            title="Akan aktif pada Langkah 10 - QR & Analytics"
            className="flex min-h-10 cursor-not-allowed items-center gap-2 border-b-2 border-transparent px-4 text-xs font-medium text-slate-400 opacity-60 dark:text-slate-500"
          >
            <BarChart3 className="h-4 w-4" />
            <span>Statistik</span>
          </span>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-12 lg:items-start">
        {/* Main Editor Column */}
        <div className="space-y-8 lg:col-span-8">
          {activeTab === "theme" ? (
            /* Theme Editor Section (Day 8) */
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/60 sm:p-7">
              <ThemeEditor
                pageId={initialData.id}
                initialTheme={theme}
                onThemeChange={(newTheme) => setTheme(newTheme)}
              />
            </div>
          ) : activeTab === "links" ? (
            /* Links Manager Section (Day 6-7) */
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/60 sm:p-7">
              <LinksManager
                pageId={initialData.id}
                initialLinks={initialLinks}
                onLinksChange={(updated) => setCustomLinks(updated)}
              />
            </div>
          ) : (
            /* Profile & Settings Section (Day 5) */
            <form action={formAction} className="space-y-6">
              <input type="hidden" name="id" value={initialData.id} />
              <input type="hidden" name="avatar_path" value={avatarPath ?? ""} />
              <input
                type="hidden"
                name="social_links"
                value={JSON.stringify(socialLinks)}
              />
              <input
                type="hidden"
                name="theme_config"
                value={JSON.stringify(theme)}
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
                      Identitas visual yang akan tampil di bagian atas halaman
                      Linktree Anda.
                    </p>
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Avatar Uploader Component */}
                  <div>
                    <label className="mb-2 block text-xs font-bold text-slate-700 dark:text-slate-300">
                      Foto Profil / Logo Avatar
                    </label>
                    <AvatarUploader
                      pageId={initialData.id}
                      currentAvatarPath={avatarPath}
                      pageTitle={title || initialData.title}
                      onAvatarChange={(newPath) => setAvatarPath(newPath)}
                    />
                  </div>

                  {/* Title & Slug inputs */}
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor="page-title"
                        className="block text-xs font-bold text-slate-700 dark:text-slate-300"
                      >
                        Judul Halaman <span className="text-rose-500">*</span>
                      </label>
                      <input
                        id="page-title"
                        name="title"
                        type="text"
                        required
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="e.g. Layanan TI & Bantuan"
                        className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-900 shadow-xs placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/20 dark:border-slate-800 dark:bg-slate-950 dark:text-white sm:text-sm"
                      />
                      {state?.fieldErrors?.title ? (
                        <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">
                          {state.fieldErrors.title[0]}
                        </p>
                      ) : null}
                    </div>

                    <div>
                      <label
                        htmlFor="page-slug"
                        className="block text-xs font-bold text-slate-700 dark:text-slate-300"
                      >
                        Slug URL <span className="text-rose-500">*</span>
                      </label>
                      <div className="mt-1.5 flex rounded-xl border border-slate-200 bg-white shadow-xs focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/20 dark:border-slate-800 dark:bg-slate-950">
                        <span className="flex items-center pl-3 pr-1 text-xs font-mono text-slate-400 dark:text-slate-500">
                          /
                        </span>
                        <input
                          id="page-slug"
                          name="slug"
                          type="text"
                          required
                          value={slug}
                          onChange={(e) =>
                            setSlug(
                              e.target.value
                                .toLowerCase()
                                .replace(/[^a-z0-9-]/g, ""),
                            )
                          }
                          placeholder="layananti"
                          className="w-full bg-transparent py-2.5 pr-3 text-xs font-mono text-slate-900 focus:outline-none dark:text-white sm:text-sm"
                        />
                      </div>
                      {state?.fieldErrors?.slug ? (
                        <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">
                          {state.fieldErrors.slug[0]}
                        </p>
                      ) : null}
                    </div>
                  </div>

                  {/* Bio / Description */}
                  <div>
                    <label
                      htmlFor="page-desc"
                      className="block text-xs font-bold text-slate-700 dark:text-slate-300"
                    >
                      Deskripsi / Bio Singkat
                    </label>
                    <textarea
                      id="page-desc"
                      name="description"
                      rows={3}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Tuliskan bio atau keterangan singkat mengenai halaman ini..."
                      className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-900 shadow-xs placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/20 dark:border-slate-800 dark:bg-slate-950 dark:text-white sm:text-sm"
                    />
                    <div className="mt-1 flex items-center justify-between text-[11px] text-slate-400">
                      <span>Maksimal 500 karakter</span>
                      <span>{description.length}/500</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Social Links Manager Section */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/60 sm:p-7">
                <div className="mb-6 flex flex-col justify-between gap-2 border-b border-slate-100 pb-5 dark:border-slate-800 sm:flex-row sm:items-center">
                  <div>
                    <div className="flex items-center gap-2">
                      <Share2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                        Tautan Media Sosial & Kontak
                      </h2>
                    </div>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      Ikon dan tombol media sosial resmi (WhatsApp, Instagram,
                      GitHub, Email, dll.).
                    </p>
                  </div>
                </div>

                <SocialLinksManager
                  links={socialLinks}
                  onChange={(updated) => setSocialLinks(updated)}
                />
              </div>

              {/* Publication Status & Actions */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/60 sm:p-7">
                <div className="mb-5 flex items-center gap-2 border-b border-slate-100 pb-4 dark:border-slate-800">
                  <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                    Status Publikasi
                  </h2>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  <label
                    className={`flex cursor-pointer flex-col gap-1 rounded-xl border p-3.5 transition ${
                      status === "draft"
                        ? "border-blue-600 bg-blue-50/50 dark:border-blue-500 dark:bg-blue-950/30"
                        : "border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/50"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        Draft
                      </span>
                      <input
                        type="radio"
                        name="status"
                        value="draft"
                        checked={status === "draft"}
                        onChange={() => setStatus("draft")}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                    </div>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                      Hanya Anda yang dapat melihat halaman ini.
                    </span>
                  </label>

                  <label
                    className={`flex cursor-pointer flex-col gap-1 rounded-xl border p-3.5 transition ${
                      status === "published"
                        ? "border-blue-600 bg-blue-50/50 dark:border-blue-500 dark:bg-blue-950/30"
                        : "border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/50"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        Published
                      </span>
                      <input
                        type="radio"
                        name="status"
                        value="published"
                        checked={status === "published"}
                        onChange={() => setStatus("published")}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                    </div>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                      Dapat diakses publik melalui /{slug}.
                    </span>
                  </label>

                  <label
                    className={`flex cursor-pointer flex-col gap-1 rounded-xl border p-3.5 transition ${
                      status === "archived"
                        ? "border-blue-600 bg-blue-50/50 dark:border-blue-500 dark:bg-blue-950/30"
                        : "border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/50"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        Archived
                      </span>
                      <input
                        type="radio"
                        name="status"
                        value="archived"
                        checked={status === "archived"}
                        onChange={() => setStatus("archived")}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                    </div>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                      Dinonaktifkan sementara dan disembunyikan.
                    </span>
                  </label>
                </div>

                <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-5 dark:border-slate-800">
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    {initialData.published_at ? (
                      <span>
                        Diterbitkan:{" "}
                        {new Date(initialData.published_at).toLocaleDateString(
                          "id-ID",
                          {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          },
                        )}
                      </span>
                    ) : (
                      <span>Halaman belum pernah diterbitkan</span>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={isPending}
                    className="inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-xs font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-blue-600 dark:hover:bg-blue-500"
                  >
                    {isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Menyimpan...</span>
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        <span>Simpan Perubahan Profil</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* Danger Zone: Delete Page */}
          <section className="rounded-2xl border border-rose-200 bg-rose-50/40 p-5 dark:border-rose-950 dark:bg-rose-950/15 sm:p-7">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-rose-100 text-rose-600 dark:bg-rose-900/40 dark:text-rose-400">
                <Trash2 className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-bold text-rose-900 dark:text-rose-200">
                  Zona Bahaya: Hapus Halaman
                </h3>
                <p className="mt-1 text-xs leading-relaxed text-rose-800/80 dark:text-rose-300/80">
                  Menghapus halaman ini akan menghapus seluruh data tautan,
                  avatar, dan catatan analitik terkait secara permanen. Tindakan
                  ini tidak dapat dibatalkan.
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
            customLinks={customLinks}
            theme={theme}
            status={status}
          />
        </div>
      </div>
    </div>
  );
}
