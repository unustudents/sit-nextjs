"use client";

import { useActionState, useState } from "react";
import {
  AlertCircle,
  Check,
  CheckCircle2,
  Loader2,
  Palette,
  RotateCcw,
  Save,
  Sparkles,
  Type,
  Zap,
} from "lucide-react";
import type { ThemeConfig } from "@/types/database.types";
import { DEFAULT_THEME, THEME_PRESETS } from "@/lib/validators/theme";
import {
  updatePageAction,
  type UpdatePageState,
} from "@/app/(dashboard)/dashboard/_actions/pages";

type ThemeEditorProps = {
  pageId: string;
  initialTheme?: ThemeConfig | null;
  onThemeChange?: (theme: ThemeConfig) => void;
};

export function ThemeEditor({
  pageId,
  initialTheme,
  onThemeChange,
}: ThemeEditorProps) {
  const [theme, setTheme] = useState<ThemeConfig>(
    initialTheme?.version === 1 ? initialTheme : DEFAULT_THEME,
  );
  const [activePresetId, setActivePresetId] = useState<string | null>(() => {
    const found = THEME_PRESETS.find(
      (p) =>
        p.config.template === initialTheme?.template &&
        p.config.colors.background === initialTheme?.colors.background &&
        p.config.colors.button === initialTheme?.colors.button,
    );
    return found ? found.id : "minimalDark";
  });

  const [toastMessage, setToastMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Sync helper
  const updateTheme = (updater: (prev: ThemeConfig) => ThemeConfig) => {
    setTheme((prev) => {
      const next = updater(prev);
      if (onThemeChange) {
        onThemeChange(next);
      }
      return next;
    });
  };

  const handleSelectPreset = (preset: (typeof THEME_PRESETS)[number]) => {
    setActivePresetId(preset.id);
    updateTheme(() => preset.config);
  };

  const [, formAction, isPending] = useActionState<
    UpdatePageState | null,
    FormData
  >(async (prevState, formData) => {
    const res = await updatePageAction(prevState, formData);
    if (res.success) {
      setToastMessage({
        type: "success",
        text: "Desain dan tema halaman berhasil disimpan.",
      });
      setTimeout(() => setToastMessage(null), 4000);
    } else if (res.error) {
      setToastMessage({
        type: "error",
        text: res.error,
      });
      setTimeout(() => setToastMessage(null), 4000);
    }
    return res;
  }, null);

  return (
    <div className="space-y-8">
      {/* Toast Alert */}
      {toastMessage ? (
        <div
          role="status"
          className={`flex items-center gap-3 rounded-2xl border p-4 text-xs font-medium transition-all ${
            toastMessage.type === "success"
              ? "border-emerald-300 bg-emerald-50 text-emerald-900 dark:border-emerald-800/60 dark:bg-emerald-950/40 dark:text-emerald-200"
              : "border-rose-300 bg-rose-50 text-rose-900 dark:border-rose-800/60 dark:bg-rose-950/40 dark:text-rose-200"
          }`}
        >
          {toastMessage.type === "success" ? (
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
          ) : (
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400" />
          )}
          <span>{toastMessage.text}</span>
        </div>
      ) : null}

      <form action={formAction} className="space-y-8">
        <input type="hidden" name="id" value={pageId} />
        <input
          type="hidden"
          name="theme_config"
          value={JSON.stringify(theme)}
        />

        {/* Section 1: Presets (FR-017) */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Pilihan Template Siap Pakai
                </h3>
              </div>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                Pilih gaya desain instan atau gunakan sebagai inspirasi awal.
              </p>
            </div>

            <button
              type="button"
              onClick={() => handleSelectPreset(THEME_PRESETS[0])}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Reset Default</span>
            </button>
          </div>

          <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
            {THEME_PRESETS.map((preset) => {
              const isSelected = activePresetId === preset.id;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => handleSelectPreset(preset)}
                  className={`relative flex flex-col justify-between rounded-2xl border p-4 text-left transition-all ${
                    isSelected
                      ? "border-blue-600 bg-blue-50/50 shadow-md ring-2 ring-blue-500/20 dark:border-blue-500 dark:bg-blue-950/30"
                      : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/60 dark:border-slate-800 dark:bg-slate-900/60 dark:hover:border-slate-700"
                  }`}
                >
                  <div>
                    {/* Header: Title & Check */}
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        {preset.name}
                      </span>
                      {isSelected ? (
                        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-white">
                          <Check className="h-3 w-3" />
                        </div>
                      ) : null}
                    </div>

                    <p className="mt-1 text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
                      {preset.description}
                    </p>
                  </div>

                  {/* Visual Color Chips */}
                  <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 dark:border-slate-800">
                    <span className="rounded-md bg-slate-100 px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                      {preset.config.template}
                    </span>

                    <div className="flex items-center gap-1.5">
                      <span
                        className="h-4 w-4 rounded-full border border-black/10 shadow-xs"
                        style={{ backgroundColor: preset.config.colors.background }}
                        title="Background"
                      />
                      <span
                        className="h-4 w-4 rounded-full border border-black/10 shadow-xs"
                        style={{ backgroundColor: preset.config.colors.button }}
                        title="Button"
                      />
                      <span
                        className="h-4 w-4 rounded-full border border-black/10 shadow-xs"
                        style={{ backgroundColor: preset.config.colors.text }}
                        title="Text"
                      />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* Section 2: Fine-Tuning Colors (FR-018) */}
        <section className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50/60 p-5 dark:border-slate-800 dark:bg-slate-950/40">
          <div className="flex items-center gap-2 border-b border-slate-200 pb-3 dark:border-slate-800">
            <Palette className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Penyesuaian Palet Warna
            </h3>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {/* Background Color */}
            <div className="rounded-xl border border-slate-200 bg-white p-3.5 dark:border-slate-800 dark:bg-slate-900">
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                Warna Latar (Background)
              </label>
              <div className="mt-2 flex items-center gap-2.5">
                <input
                  type="color"
                  value={theme.colors.background}
                  onChange={(e) => {
                    setActivePresetId(null);
                    updateTheme((prev) => ({
                      ...prev,
                      colors: { ...prev.colors, background: e.target.value },
                    }));
                  }}
                  className="h-9 w-9 cursor-pointer rounded-lg border-0 bg-transparent p-0"
                />
                <input
                  type="text"
                  maxLength={7}
                  value={theme.colors.background}
                  onChange={(e) => {
                    setActivePresetId(null);
                    updateTheme((prev) => ({
                      ...prev,
                      colors: { ...prev.colors, background: e.target.value },
                    }));
                  }}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 font-mono text-xs text-slate-800 focus:border-blue-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                />
              </div>
            </div>

            {/* Text Color */}
            <div className="rounded-xl border border-slate-200 bg-white p-3.5 dark:border-slate-800 dark:bg-slate-900">
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                Warna Teks Utama
              </label>
              <div className="mt-2 flex items-center gap-2.5">
                <input
                  type="color"
                  value={theme.colors.text}
                  onChange={(e) => {
                    setActivePresetId(null);
                    updateTheme((prev) => ({
                      ...prev,
                      colors: { ...prev.colors, text: e.target.value },
                    }));
                  }}
                  className="h-9 w-9 cursor-pointer rounded-lg border-0 bg-transparent p-0"
                />
                <input
                  type="text"
                  maxLength={7}
                  value={theme.colors.text}
                  onChange={(e) => {
                    setActivePresetId(null);
                    updateTheme((prev) => ({
                      ...prev,
                      colors: { ...prev.colors, text: e.target.value },
                    }));
                  }}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 font-mono text-xs text-slate-800 focus:border-blue-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                />
              </div>
            </div>

            {/* Button Background Color */}
            <div className="rounded-xl border border-slate-200 bg-white p-3.5 dark:border-slate-800 dark:bg-slate-900">
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                Warna Tombol Tautan
              </label>
              <div className="mt-2 flex items-center gap-2.5">
                <input
                  type="color"
                  value={theme.colors.button}
                  onChange={(e) => {
                    setActivePresetId(null);
                    updateTheme((prev) => ({
                      ...prev,
                      colors: { ...prev.colors, button: e.target.value },
                    }));
                  }}
                  className="h-9 w-9 cursor-pointer rounded-lg border-0 bg-transparent p-0"
                />
                <input
                  type="text"
                  maxLength={7}
                  value={theme.colors.button}
                  onChange={(e) => {
                    setActivePresetId(null);
                    updateTheme((prev) => ({
                      ...prev,
                      colors: { ...prev.colors, button: e.target.value },
                    }));
                  }}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 font-mono text-xs text-slate-800 focus:border-blue-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                />
              </div>
            </div>

            {/* Button Text Color */}
            <div className="rounded-xl border border-slate-200 bg-white p-3.5 dark:border-slate-800 dark:bg-slate-900">
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                Warna Teks Tombol
              </label>
              <div className="mt-2 flex items-center gap-2.5">
                <input
                  type="color"
                  value={theme.colors.buttonText}
                  onChange={(e) => {
                    setActivePresetId(null);
                    updateTheme((prev) => ({
                      ...prev,
                      colors: { ...prev.colors, buttonText: e.target.value },
                    }));
                  }}
                  className="h-9 w-9 cursor-pointer rounded-lg border-0 bg-transparent p-0"
                />
                <input
                  type="text"
                  maxLength={7}
                  value={theme.colors.buttonText}
                  onChange={(e) => {
                    setActivePresetId(null);
                    updateTheme((prev) => ({
                      ...prev,
                      colors: { ...prev.colors, buttonText: e.target.value },
                    }));
                  }}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 font-mono text-xs text-slate-800 focus:border-blue-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Section 3: Typography & Button Shape */}
        <section className="grid gap-4 sm:grid-cols-2">
          {/* Typography */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-3 flex items-center gap-2">
              <Type className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <label className="text-xs font-bold text-slate-900 dark:text-white">
                Gaya Tipografi (Font)
              </label>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: "sans", label: "Sans", sub: "Modern" },
                { id: "serif", label: "Serif", sub: "Editorial" },
                { id: "mono", label: "Mono", sub: "Tech" },
              ].map((fontOption) => (
                <button
                  key={fontOption.id}
                  type="button"
                  onClick={() => {
                    setActivePresetId(null);
                    updateTheme((prev) => ({
                      ...prev,
                      font: fontOption.id as "sans" | "serif" | "mono",
                    }));
                  }}
                  className={`rounded-xl border p-2.5 text-center transition ${
                    theme.font === fontOption.id
                      ? "border-blue-600 bg-blue-50/60 font-bold text-blue-700 dark:border-blue-500 dark:bg-blue-950/40 dark:text-blue-300"
                      : "border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/60"
                  }`}
                >
                  <p
                    className={`text-sm ${
                      fontOption.id === "serif"
                        ? "font-serif"
                        : fontOption.id === "mono"
                          ? "font-mono"
                          : "font-sans"
                    }`}
                  >
                    {fontOption.label}
                  </p>
                  <span className="text-[10px] text-slate-400">
                    {fontOption.sub}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Button Radius */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-3 flex items-center gap-2">
              <div className="h-4 w-4 rounded-md border border-slate-400" />
              <label className="text-xs font-bold text-slate-900 dark:text-white">
                Radius Kelengkungan Tombol
              </label>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[
                { id: "sm", label: "Small", radius: "rounded-md" },
                { id: "md", label: "Medium", radius: "rounded-xl" },
                { id: "lg", label: "Large", radius: "rounded-2xl" },
                { id: "full", label: "Pill", radius: "rounded-full" },
              ].map((radOption) => (
                <button
                  key={radOption.id}
                  type="button"
                  onClick={() => {
                    setActivePresetId(null);
                    updateTheme((prev) => ({
                      ...prev,
                      buttonRadius: radOption.id as "sm" | "md" | "lg" | "full",
                    }));
                  }}
                  className={`flex flex-col items-center justify-center rounded-xl border p-2 transition ${
                    theme.buttonRadius === radOption.id
                      ? "border-blue-600 bg-blue-50/60 font-bold text-blue-700 dark:border-blue-500 dark:bg-blue-950/40 dark:text-blue-300"
                      : "border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/60"
                  }`}
                >
                  <div
                    className={`h-5 w-8 border-2 border-current ${radOption.radius}`}
                  />
                  <span className="mt-1 text-[10px]">{radOption.label}</span>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Section 4: Background Style & Animation (FR-019) */}
        <section className="grid gap-4 sm:grid-cols-2">
          {/* Background Style */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
            <label className="block text-xs font-bold text-slate-900 dark:text-white">
              Gaya Latar Belakang
            </label>
            <div className="mt-2.5 grid grid-cols-3 gap-2">
              {[
                { id: "solid", label: "Solid" },
                { id: "gradient", label: "Gradient" },
                { id: "mesh", label: "Mesh Glow" },
              ].map((styleOption) => (
                <button
                  key={styleOption.id}
                  type="button"
                  onClick={() => {
                    setActivePresetId(null);
                    updateTheme((prev) => ({
                      ...prev,
                      backgroundStyle: styleOption.id as
                        | "solid"
                        | "gradient"
                        | "mesh",
                    }));
                  }}
                  className={`rounded-xl border p-2 text-center text-xs font-medium transition ${
                    theme.backgroundStyle === styleOption.id
                      ? "border-blue-600 bg-blue-50/60 font-bold text-blue-700 dark:border-blue-500 dark:bg-blue-950/40 dark:text-blue-300"
                      : "border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/60"
                  }`}
                >
                  {styleOption.label}
                </button>
              ))}
            </div>
          </div>

          {/* Micro-Animations (FR-019) */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <label className="text-xs font-bold text-slate-900 dark:text-white">
                Efek Animasi Interaktif
              </label>
            </div>
            <div className="mt-2.5 flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  updateTheme((prev) => ({
                    ...prev,
                    animation: prev.animation === "subtle" ? "off" : "subtle",
                  }));
                }}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-4 focus:ring-blue-500/20 ${
                  theme.animation === "subtle"
                    ? "bg-blue-600"
                    : "bg-slate-200 dark:bg-slate-700"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                    theme.animation === "subtle"
                      ? "translate-x-5"
                      : "translate-x-0"
                  }`}
                />
              </button>
              <span className="text-xs text-slate-600 dark:text-slate-300">
                {theme.animation === "subtle"
                  ? "Aktif (Micro-animations halus)"
                  : "Mati (Sesuai prefers-reduced-motion)"}
              </span>
            </div>
          </div>
        </section>

        {/* Submit Save Button */}
        <div className="flex items-center justify-end border-t border-slate-200 pt-5 dark:border-slate-800">
          <button
            type="submit"
            disabled={isPending}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 text-xs font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-blue-600 dark:hover:bg-blue-500"
          >
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Menyimpan Konfigurasi Desain...</span>
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                <span>Simpan Perubahan Desain & Tema</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
