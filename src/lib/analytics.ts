import "server-only";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";

export type AnalyticsResult = {
  success: boolean;
  error?: string;
};

/**
 * Record a public page view event (FR-023).
 * Guarantees:
 * 1. Only records views for published and active (non-disabled) pages.
 * 2. Does not collect or store raw IP addresses or visitor PII (NFR-012).
 * 3. Fault-tolerant: failure to record analytics will never throw or crash the caller (NFR-015).
 */
export async function recordPageView(pageId: string): Promise<AnalyticsResult> {
  const parsed = z.uuid().safeParse(pageId);
  if (!parsed.success) {
    return { success: false, error: "ID halaman tidak valid" };
  }

  try {
    const adminClient = createAdminClient();

    // Verify page exists, is published, and not disabled by admin
    const { data: page, error: pageError } = await adminClient
      .from("pages")
      .select("id, status, admin_disabled")
      .eq("id", parsed.data)
      .maybeSingle();

    if (pageError || !page) {
      return {
        success: false,
        error: "Halaman tidak ditemukan",
      };
    }

    if (page.status !== "published" || page.admin_disabled) {
      return {
        success: false,
        error: "Halaman belum dipublikasikan atau sedang dinonaktifkan",
      };
    }

    const { error: insertError } = await adminClient
      .from("analytics_events")
      .insert({
        page_id: page.id,
        link_id: null,
        event_type: "page_view",
      });

    if (insertError) {
      console.error("Gagal mencatat event page_view:", insertError.message);
      return { success: false, error: "Gagal menyimpan event analytics" };
    }

    return { success: true };
  } catch (err) {
    console.error("Exception saat mencatat event page_view:", err);
    return { success: false, error: "Terjadi kesalahan internal analytics" };
  }
}
