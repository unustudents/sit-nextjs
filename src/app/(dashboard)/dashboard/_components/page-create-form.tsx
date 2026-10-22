"use client";

import { useActionState } from "react";
import { ArrowRight, AtSign, FileText, Plus } from "lucide-react";
import {
  createPageAction,
  type CreatePageState,
} from "../_actions/pages";

export function PageCreateForm() {
  const [state, formAction, isPending] = useActionState<
    CreatePageState | null,
    FormData
  >(createPageAction, null);

  return (
    <form action={formAction} className="space-y-5">
      {state?.error ? (
        <div
          role="alert"
          className="rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-3 text-sm leading-5 text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-200"
        >
          {state.error}
        </div>
      ) : null}

      <div className="space-y-2">
        <label
          htmlFor="page-title"
          className="text-sm font-semibold text-slate-900 dark:text-slate-100"
        >
          Nama halaman
        </label>
        <div className="relative">
          <FileText
            aria-hidden="true"
            className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
          />
          <input
            id="page-title"
            name="title"
            type="text"
            required
            maxLength={120}
            placeholder="Contoh: Layanan TI"
            className="min-h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 pl-10 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500"
            aria-describedby={state?.fieldErrors?.title ? "page-title-error" : undefined}
          />
        </div>
        {state?.fieldErrors?.title ? (
          <p id="page-title-error" className="text-xs text-rose-600 dark:text-rose-300">
            {state.fieldErrors.title[0]}
          </p>
        ) : null}
      </div>

      <div className="space-y-2">
        <label
          htmlFor="page-slug"
          className="text-sm font-semibold text-slate-900 dark:text-slate-100"
        >
          Alamat halaman
        </label>
        <div className="flex min-h-11 items-center rounded-xl border border-slate-200 bg-white focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-950">
          <span className="pl-3.5 text-sm text-slate-400 dark:text-slate-500">/</span>
          <AtSign
            aria-hidden="true"
            className="ml-2 h-4 w-4 shrink-0 text-slate-400"
          />
          <input
            id="page-slug"
            name="slug"
            type="text"
            required
            minLength={3}
            maxLength={40}
            pattern="[a-z0-9](?:[a-z0-9-]{1,38}[a-z0-9])"
            placeholder="layananti"
            spellCheck={false}
            className="min-h-11 min-w-0 flex-1 bg-transparent px-2.5 text-sm text-slate-900 outline-none placeholder:text-slate-400 dark:text-slate-100 dark:placeholder:text-slate-500"
            aria-describedby={state?.fieldErrors?.slug ? "page-slug-error" : "page-slug-help"}
          />
        </div>
        <p id="page-slug-help" className="text-xs leading-5 text-slate-500 dark:text-slate-400">
          Gunakan huruf kecil, angka, dan tanda hubung.
        </p>
        {state?.fieldErrors?.slug ? (
          <p id="page-slug-error" className="text-xs text-rose-600 dark:text-rose-300">
            {state.fieldErrors.slug[0]}
          </p>
        ) : null}
      </div>

      <div className="space-y-2">
        <label
          htmlFor="page-description"
          className="text-sm font-semibold text-slate-900 dark:text-slate-100"
        >
          Deskripsi <span className="font-normal text-slate-400">(opsional)</span>
        </label>
        <textarea
          id="page-description"
          name="description"
          rows={3}
          maxLength={500}
          placeholder="Jelaskan tujuan halaman ini secara singkat."
          className="w-full resize-y rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm leading-6 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500"
          aria-describedby={state?.fieldErrors?.description ? "page-description-error" : undefined}
        />
        {state?.fieldErrors?.description ? (
          <p id="page-description-error" className="text-xs text-rose-600 dark:text-rose-300">
            {state.fieldErrors.description[0]}
          </p>
        ) : null}
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="flex min-h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-500/25 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? (
          "Menyimpan..."
        ) : (
          <>
            <Plus aria-hidden="true" className="h-4 w-4" />
            Buat halaman
            <ArrowRight aria-hidden="true" className="h-4 w-4" />
          </>
        )}
      </button>
    </form>
  );
}
