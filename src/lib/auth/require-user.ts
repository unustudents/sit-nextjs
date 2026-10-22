import "server-only";
import { connection } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function requireUser() {
  await connection();
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getClaims();

  if (error || !data) {
    redirect("/login");
  }

  const userId = data.claims.sub;

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, email, display_name, role, is_active")
    .eq("id", userId)
    .single();

  if (profileError || !profile || !profile.is_active) {
    redirect("/login?error=account_inactive");
  }

  return { userId, claims: data.claims, profile, supabase };
}
