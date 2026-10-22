"use client";

import {
  ArrowDown,
  ArrowUp,
  ExternalLink,
  Plus,
  Trash2,
  AlertCircle,
  Share2,
} from "lucide-react";
import {
  SOCIAL_PLATFORMS,
  SocialIcon,
  getSocialPlatform,
  type SocialPlatformDef,
} from "@/components/ui/social-icons";

export type SocialLinkItem = {
  label: string;
  url: string;
  icon: string;
};

type SocialLinksManagerProps = {
  links: SocialLinkItem[];
  onChange: (links: SocialLinkItem[]) => void;
};

export function SocialLinksManager({
  links,
  onChange,
}: SocialLinksManagerProps) {
  const handleAddPreset = (platform: SocialPlatformDef) => {
    if (links.length >= 20) return;

    const newLink: SocialLinkItem = {
      label: platform.name,
      url: platform.urlPrefix,
      icon: platform.icon,
    };

    onChange([...links, newLink]);
  };

  const handleUpdate = (
    index: number,
    field: keyof SocialLinkItem,
    value: string,
  ) => {
    const updated = [...links];
    const current = updated[index];
    if (!current) return;

    updated[index] = {
      ...current,
      [field]: value,
    };

    onChange(updated);
  };

  const handleMove = (index: number, direction: "up" | "down") => {
    if (
      (direction === "up" && index === 0) ||
      (direction === "down" && index === links.length - 1)
    ) {
      return;
    }

    const targetIndex = direction === "up" ? index - 1 : index + 1;
    const updated = [...links];
    const item = updated[index];
    const targetItem = updated[targetIndex];

    if (!item || !targetItem) return;

    updated[index] = targetItem;
    updated[targetIndex] = item;

    onChange(updated);
  };

  const handleRemove = (index: number) => {
    const updated = links.filter((_, i) => i !== index);
    onChange(updated);
  };

  const isUrlValid = (url: string) => {
    if (!url.trim()) return false;
    try {
      const parsed = new URL(url);
      return ["http:", "https:", "mailto:", "tel:"].includes(parsed.protocol);
    } catch {
      return false;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-2 border-b border-slate-100 pb-4 dark:border-slate-800 sm:flex-row sm:items-center">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Tautan Media Sosial
          </h3>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            Tampilkan ikon sosial langsung di bawah profil header halaman
            publik.
          </p>
        </div>
        <span className="text-xs font-semibold text-slate-400">
          {links.length}/20 tautan
        </span>
      </div>

      {/* Preset Quick Add Bar */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
          Tambah Cepat Platform Populer:
        </label>
        <div className="flex flex-wrap gap-2">
          {SOCIAL_PLATFORMS.map((platform) => {
            const alreadyAdded = links.some(
              (l) => l.icon.toLowerCase() === platform.icon.toLowerCase(),
            );
            return (
              <button
                key={platform.id}
                type="button"
                onClick={() => handleAddPreset(platform)}
                disabled={links.length >= 20}
                className={`inline-flex min-h-8 cursor-pointer items-center gap-1.5 rounded-lg border px-2.5 text-xs font-medium transition focus:outline-none focus:ring-4 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-50 ${
                  alreadyAdded
                    ? "border-blue-200 bg-blue-50/70 text-blue-700 dark:border-blue-900/60 dark:bg-blue-950/40 dark:text-blue-300"
                    : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
                }`}
              >
                <SocialIcon icon={platform.icon} className="h-3.5 w-3.5" />
                <span>{platform.name}</span>
                <Plus className="h-3 w-3 opacity-60" />
              </button>
            );
          })}
        </div>
      </div>

      {/* Links List */}
      <div className="space-y-3">
        {links.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 py-8 text-center dark:border-slate-800 dark:bg-slate-950/30">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500">
              <Share2 className="h-5 w-5" />
            </div>
            <p className="mt-3 text-xs font-semibold text-slate-700 dark:text-slate-300">
              Belum ada tautan media sosial
            </p>
            <p className="mt-1 max-w-xs text-xs text-slate-400">
              Klik salah satu tombol platform di atas untuk menghubungkan
              Instagram, WhatsApp, atau akun lainnya.
            </p>
          </div>
        ) : (
          links.map((link, index) => {
            const platform = getSocialPlatform(link.icon);
            const valid = isUrlValid(link.url);

            return (
              <div
                key={`${link.icon}-${index}`}
                className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-3.5 shadow-2xs transition focus-within:border-blue-500/60 dark:border-slate-800 dark:bg-slate-950/70 sm:flex-row sm:items-center sm:gap-4"
              >
                <div className="flex items-center gap-2.5">
                  <div className="flex flex-col gap-1">
                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={() => handleMove(index, "up")}
                      aria-label="Pindahkan ke atas"
                      className="flex h-6 w-6 cursor-pointer items-center justify-center rounded-md text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-30 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                    >
                      <ArrowUp className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={index === links.length - 1}
                      onClick={() => handleMove(index, "down")}
                      aria-label="Pindahkan ke bawah"
                      className="flex h-6 w-6 cursor-pointer items-center justify-center rounded-md text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-30 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                    >
                      <ArrowDown className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                    <SocialIcon icon={link.icon} className="h-5 w-5" />
                  </div>
                </div>

                <div className="grid flex-1 gap-2.5 sm:grid-cols-12 sm:items-center">
                  <div className="sm:col-span-3">
                    <select
                      value={link.icon}
                      onChange={(e) => {
                        const newIcon = e.target.value;
                        const p = getSocialPlatform(newIcon);
                        handleUpdate(index, "icon", newIcon);
                        if (p && link.label === platform?.name) {
                          handleUpdate(index, "label", p.name);
                        }
                      }}
                      className="min-h-9.5 w-full rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-semibold text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                    >
                      {SOCIAL_PLATFORMS.map((p) => (
                        <option key={p.id} value={p.icon}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="sm:col-span-4">
                    <input
                      type="text"
                      value={link.label}
                      maxLength={50}
                      onChange={(e) =>
                        handleUpdate(index, "label", e.target.value)
                      }
                      placeholder="Label Tautan"
                      className="min-h-9.5 w-full rounded-lg border border-slate-200 bg-white px-2.5 text-xs text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                    />
                  </div>

                  <div className="sm:col-span-5">
                    <div className="relative">
                      <input
                        type="text"
                        value={link.url}
                        maxLength={2048}
                        onChange={(e) =>
                          handleUpdate(index, "url", e.target.value)
                        }
                        placeholder={platform?.placeholder || "https://..."}
                        className={`min-h-9.5 w-full rounded-lg border bg-white px-2.5 text-xs text-slate-900 outline-none transition placeholder:text-slate-400 focus:ring-2 dark:bg-slate-900 dark:text-slate-100 ${
                          valid || link.url === ""
                            ? "border-slate-200 focus:border-blue-500 focus:ring-blue-500/15 dark:border-slate-700"
                            : "border-rose-300 focus:border-rose-500 focus:ring-rose-500/15 dark:border-rose-800"
                        }`}
                      />
                      {!valid && link.url !== "" ? (
                        <span
                          title="URL harus valid dan diawali http://, https://, atau mailto:"
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-rose-500"
                        >
                          <AlertCircle className="h-4 w-4" />
                        </span>
                      ) : null}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-1 sm:justify-center">
                  {valid && (
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noreferrer"
                      title="Tes buka tautan"
                      className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-blue-600 dark:hover:bg-slate-800 dark:hover:text-blue-400"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  )}

                  <button
                    type="button"
                    onClick={() => handleRemove(index)}
                    title="Hapus tautan ini"
                    className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-slate-400 transition hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40 dark:hover:text-rose-400"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
