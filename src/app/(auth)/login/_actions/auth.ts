"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { flattenError, z } from "zod";

const loginSchema = z.object({
  email: z.email("Format email tidak valid").trim(),
  password: z.string().min(1, "Kata sandi wajib diisi"),
  redirectTo: z.string().optional(),
});

export type LoginState = {
  error?: string;
  fieldErrors?: {
    email?: string[];
    password?: string[];
  };
};

export async function loginAction(
  _prevState: LoginState | null,
  formData: FormData,
): Promise<LoginState> {
  const rawData = {
    email: formData.get("email"),
    password: formData.get("password"),
    redirectTo: formData.get("redirectTo") || undefined,
  };

  const parsed = loginSchema.safeParse(rawData);
  if (!parsed.success) {
    return {
      fieldErrors: flattenError(parsed.error).fieldErrors,
    };
  }

  const { email, password, redirectTo } = parsed.data;
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  // Prevent email enumeration: generic error for any failed sign in.
  if (error || !data.user) {
    return {
      error:
        "Email atau kata sandi salah. Silakan periksa kembali kredensial Anda.",
    };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_active")
    .eq("id", data.user.id)
    .single();

  if (profile && !profile.is_active) {
    await supabase.auth.signOut();
    return {
      error: "Akun ini dinonaktifkan. Silakan hubungi administrator.",
    };
  }

  const safeRedirect =
    redirectTo && redirectTo.startsWith("/") && !redirectTo.startsWith("//")
      ? redirectTo
      : "/dashboard";

  redirect(safeRedirect);
}

export async function logoutAction(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
