import "server-only";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireUser } from "@/lib/auth/require-user";
import {
  buildDailyTrends,
  calculateLinkRankings,
  computeAnalyticsSummary,
  type AnalyticsSummary,
  type DailyTrendPoint,
  type LinkRankingItem,
} from "./analytics-aggregate";

export type AnalyticsResult = {
  success: boolean;
  error?: string;
};

export type PageAnalyticsData = {
  page: {
    id: string;
    title: string;
    slug: string;
    status: string;
    admin_disabled: boolean;
  };
  summary: AnalyticsSummary;
  dailyTrends: DailyTrendPoint[];
  linkRankings: LinkRankingItem[];
  timeframeDays: 7 | 30;
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

/**
 * Fetches analytics metrics for a specific page owned by the authenticated user (FR-025, FR-026).
 * Enforces strict authorization: users cannot inspect analytics of pages they do not own.
 */
export async function getPageAnalytics(
  pageId: string,
  timeframeDays: 7 | 30 = 7,
): Promise<
  { success: true; data: PageAnalyticsData } | { success: false; error: string }
> {
  const parsedId = z.uuid().safeParse(pageId);
  if (!parsedId.success) {
    return { success: false, error: "ID halaman tidak valid" };
  }

  const { userId, profile } = await requireUser();
  const adminClient = createAdminClient();

  const { data: page, error: pageError } = await adminClient
    .from("pages")
    .select("id, owner_id, title, slug, status, admin_disabled")
    .eq("id", parsedId.data)
    .maybeSingle();

  if (pageError || !page) {
    return { success: false, error: "Halaman tidak ditemukan" };
  }

  const isOwner = page.owner_id === userId;
  const isAdmin = profile.role === "admin";
  if (!isOwner && !isAdmin) {
    return { success: false, error: "Akses ditolak" };
  }

  const startDate = new Date(
    Date.now() - timeframeDays * 24 * 60 * 60 * 1000,
  ).toISOString();

  const [
    { data: events, error: eventsError },
    { data: links, error: linksError },
  ] = await Promise.all([
    adminClient
      .from("analytics_events")
      .select("id, page_id, link_id, event_type, created_at")
      .eq("page_id", page.id)
      .gte("created_at", startDate),
    adminClient
      .from("links")
      .select("id, title, url, sort_order")
      .eq("page_id", page.id)
      .order("sort_order", { ascending: true }),
  ]);

  if (eventsError) {
    console.error("Gagal mengambil analytics_events:", eventsError.message);
    return { success: false, error: "Gagal memuat data event analitik" };
  }

  const rawEvents = events ?? [];
  const rawLinks = links ?? [];

  const viewsCount = rawEvents.filter(
    (e) => e.event_type === "page_view",
  ).length;
  const clicksCount = rawEvents.filter(
    (e) => e.event_type === "link_click",
  ).length;

  const dailyTrends = buildDailyTrends(rawEvents, timeframeDays);
  const linkRankings = calculateLinkRankings(rawLinks, rawEvents);
  const summary = computeAnalyticsSummary(
    viewsCount,
    clicksCount,
    linkRankings,
  );

  return {
    success: true,
    data: {
      page: {
        id: page.id,
        title: page.title,
        slug: page.slug,
        status: page.status,
        admin_disabled: page.admin_disabled,
      },
      summary,
      dailyTrends,
      linkRankings,
      timeframeDays,
    },
  };
}

/**
 * Returns total lifetime views and clicks for a collection of page IDs.
 * Used for high-level cards on the primary dashboard.
 */
export async function getPagesAnalyticsSummary(
  pageIds: string[],
): Promise<Record<string, { views: number; clicks: number }>> {
  if (pageIds.length === 0) {
    return {};
  }

  const result: Record<string, { views: number; clicks: number }> = {};
  for (const id of pageIds) {
    result[id] = { views: 0, clicks: 0 };
  }

  try {
    const adminClient = createAdminClient();
    const { data: events, error } = await adminClient
      .from("analytics_events")
      .select("page_id, event_type")
      .in("page_id", pageIds);

    if (error || !events) {
      return result;
    }

    for (const event of events) {
      const current = result[event.page_id] ?? { views: 0, clicks: 0 };
      if (event.event_type === "page_view") {
        current.views += 1;
      } else if (event.event_type === "link_click") {
        current.clicks += 1;
      }
      result[event.page_id] = current;
    }

    return result;
  } catch {
    return result;
  }
}
