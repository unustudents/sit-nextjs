"use client";

import React, { useRef, useState } from "react";
import Image from "next/image";
import {
  Camera,
  CheckCircle2,
  Loader2,
  Trash2,
  UploadCloud,
  AlertCircle,
} from "lucide-react";

type AvatarUploaderProps = {
  pageId: string;
  currentAvatarPath: string | null;
  pageTitle: string;
  onAvatarChange: (newPath: string | null) => void;
};

export function AvatarUploader({
  pageId,
  currentAvatarPath,
  pageTitle,
  onAvatarChange,
}: AvatarUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    currentAvatarPath ? `/api/assets/pages/${pageId}` : null,
  );

  const getInitials = (title: string) => {
    return title
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() || "")
      .join("");
  };

  const handleFile = async (file: File) => {
    setError(null);
    setSuccess(null);

    if (file.size > 2 * 1024 * 1024) {
      setError("Ukuran foto melebihi batas maksimal 2 MB.");
      return;
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      setError("Format berkas harus JPEG, PNG, WebP, atau GIF.");
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(`/api/assets/pages/${pageId}`, {
        method: "POST",
        body: formData,
      });

      const json = await res.json();

      if (!res.ok) {
        setPreviewUrl(currentAvatarPath ? `/api/assets/pages/${pageId}` : null);
        setError(json.error || "Gagal mengunggah foto avatar.");
        return;
      }

      const newPath = json?.data?.path ?? null;
      setPreviewUrl(`/api/assets/pages/${pageId}?t=${Date.now()}`);
      setSuccess("Foto profil berhasil diperbarui.");
      onAvatarChange(newPath);
    } catch {
      setPreviewUrl(currentAvatarPath ? `/api/assets/pages/${pageId}` : null);
      setError("Terjadi kesalahan jaringan saat mengunggah foto.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      void handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleDelete = async () => {
    setError(null);
    setSuccess(null);
    setIsDeleting(true);

    try {
      const res = await fetch(`/api/assets/pages/${pageId}`, {
        method: "DELETE",
      });

      const json = await res.json();

      if (!res.ok) {
        setError(json.error || "Gagal menghapus foto avatar.");
        return;
      }

      setPreviewUrl(null);
      setSuccess("Foto profil berhasil dihapus.");
      onAvatarChange(null);
    } catch {
      setError("Terjadi kesalahan saat menghapus avatar.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-4">
      {error ? (
        <div
          role="alert"
          className="flex items-center gap-2.5 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-xs font-medium text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-200"
        >
          <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400" />
          <span>{error}</span>
        </div>
      ) : null}

      {success ? (
        <div
          role="status"
          className="flex items-center gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-2.5 text-xs font-medium text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-200"
        >
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
          <span>{success}</span>
        </div>
      ) : null}

      <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              fileInputRef.current?.click();
            }
          }}
          aria-label="Pilih foto profil baru"
          className={`group relative flex h-24 w-24 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-full border-2 transition focus:outline-none focus:ring-4 focus:ring-blue-500/20 sm:h-28 sm:w-28 ${
            isDragging
              ? "border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-blue-950/40"
              : "border-slate-200 bg-slate-100 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900"
          }`}
        >
          {previewUrl ? (
            <Image
              src={previewUrl}
              alt={`Avatar ${pageTitle}`}
              fill
              unoptimized
              sizes="(max-width: 640px) 96px, 112px"
              className="object-cover"
            />
          ) : (
            <span className="text-xl font-bold tracking-tight text-slate-500 dark:text-slate-400 sm:text-2xl">
              {getInitials(pageTitle) || (
                <Camera className="h-8 w-8 text-slate-400" />
              )}
            </span>
          )}

          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 text-white opacity-0 backdrop-blur-[2px] transition group-hover:opacity-100">
            {isUploading ? (
              <Loader2 className="h-6 w-6 animate-spin text-white" />
            ) : (
              <>
                <Camera className="h-5 w-5 text-white" />
                <span className="mt-1 text-[10px] font-semibold">
                  Ganti Foto
                </span>
              </>
            )}
          </div>

          {isUploading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-xs">
              <Loader2 className="h-6 w-6 animate-spin text-white" />
            </div>
          )}
        </div>

        <div className="flex-1 space-y-2.5">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void handleFile(file);
            }}
          />

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              disabled={isUploading}
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-xl bg-slate-900 px-4 text-xs font-semibold text-white shadow-xs transition hover:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-slate-500/20 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Mengunggah...</span>
                </>
              ) : (
                <>
                  <UploadCloud className="h-3.5 w-3.5" />
                  <span>Unggah Foto Baru</span>
                </>
              )}
            </button>

            {previewUrl ? (
              <button
                type="button"
                disabled={isDeleting || isUploading}
                onClick={handleDelete}
                className="inline-flex min-h-10 cursor-pointer items-center gap-1.5 rounded-xl border border-rose-200 px-3 text-xs font-semibold text-rose-600 transition hover:bg-rose-50 focus:outline-none focus:ring-4 focus:ring-rose-500/20 disabled:cursor-not-allowed disabled:opacity-60 dark:border-rose-900/60 dark:text-rose-300 dark:hover:bg-rose-950/40"
              >
                {isDeleting ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Trash2 className="h-3.5 w-3.5" />
                )}
                <span>Hapus Foto</span>
              </button>
            ) : null}
          </div>

          <p className="text-xs leading-5 text-slate-500 dark:text-slate-400">
            JPG, PNG, WebP, atau GIF. Maksimal 2 MB. Gambar otomatis dioptimasi
            ke WebP 512x512 dan metadata privasi dibersihkan.
          </p>
        </div>
      </div>
    </div>
  );
}
