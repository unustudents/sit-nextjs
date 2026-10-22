import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginForm } from "./_components/login-form";

export const metadata: Metadata = {
  title: "Masuk — SIT Platform",
  description: "Masuk ke dashboard pengelolaan SIT Link-in-Bio",
};

type LoginPageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

async function LoginCard({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const redirectTo =
    typeof params.redirectTo === "string" ? params.redirectTo : undefined;
  const errorParam =
    typeof params.error === "string" ? params.error : undefined;

  let initialError: string | undefined;
  if (errorParam === "account_inactive") {
    initialError =
      "Sesi dihentikan karena akun berstatus nonaktif. Hubungi administrator.";
  }

  return <LoginForm redirectTo={redirectTo} initialError={initialError} />;
}

export default function LoginPage({ searchParams }: LoginPageProps) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-sm space-y-6">
        <div className="space-y-1.5 text-center">
          <div className="inline-flex h-9 items-center justify-center rounded-md border border-neutral-200 bg-neutral-50 px-2.5 font-mono text-xs font-semibold tracking-wider text-neutral-800 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-200">
            SIT
          </div>
          <h1 className="text-xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
            Masuk ke Akun Anda
          </h1>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            Kelola halaman multi-page dan tautan bio internal Anda
          </p>
        </div>

        <div className="rounded-xl border border-neutral-200/80 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
          <Suspense
            fallback={
              <div className="h-44 animate-pulse rounded-lg bg-neutral-100 dark:bg-neutral-900" />
            }
          >
            <LoginCard searchParams={searchParams} />
          </Suspense>
        </div>

        <p className="text-center text-[11px] text-neutral-400 dark:text-neutral-600">
          Pendaftaran akun hanya dikelola oleh administrator internal.
        </p>
      </div>
    </div>
  );
}
