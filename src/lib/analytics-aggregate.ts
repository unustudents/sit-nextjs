export type DailyTrendPoint = {
  date: string;
  label: string;
  views: number;
  clicks: number;
};

export type LinkRankingItem = {
  linkId: string;
  title: string;
  url: string;
  clicks: number;
  percentage: number;
};

export type AnalyticsSummary = {
  totalViews: number;
  totalClicks: number;
  ctr: number;
  topLinkTitle: string | null;
  topLinkClicks: number;
};

/**
 * Calculates click-through rate as a percentage rounded to one decimal place.
 */
export function calculateCtr(views: number, clicks: number): number {
  if (views <= 0) return 0;
  return Number(((clicks / views) * 100).toFixed(1));
}

/**
 * Aggregates raw analytics events into a continuous daily sequence of data points.
 * Guarantees zero-filled entries for days without traffic.
 */
export function buildDailyTrends(
  events: Array<{ created_at: string; event_type: string }>,
  days: 7 | 30,
  referenceDate = new Date(),
): DailyTrendPoint[] {
  const result: DailyTrendPoint[] = [];
  const map = new Map<string, { views: number; clicks: number }>();

  for (const event of events) {
    const dateStr = new Date(event.created_at).toISOString().slice(0, 10);
    const existing = map.get(dateStr) ?? { views: 0, clicks: 0 };

    if (event.event_type === "page_view") {
      existing.views += 1;
    } else if (event.event_type === "link_click") {
      existing.clicks += 1;
    }

    map.set(dateStr, existing);
  }

  // Generate consecutive dates backwards from referenceDate
  const monthFormatter = new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
  });

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(referenceDate);
    d.setUTCDate(d.getUTCDate() - i);
    const dateKey = d.toISOString().slice(0, 10);
    const entry = map.get(dateKey) ?? { views: 0, clicks: 0 };

    result.push({
      date: dateKey,
      label: monthFormatter.format(d),
      views: entry.views,
      clicks: entry.clicks,
    });
  }

  return result;
}

/**
 * Calculates per-link click counts and share percentages.
 * Preserves all active and configured links, sorted by click count descending.
 */
export function calculateLinkRankings(
  links: Array<{ id: string; title: string; url: string }>,
  events: Array<{ link_id: string | null; event_type: string }>,
): LinkRankingItem[] {
  const clickCounts = new Map<string, number>();
  let totalLinkClicks = 0;

  for (const event of events) {
    if (event.event_type === "link_click" && event.link_id) {
      totalLinkClicks += 1;
      clickCounts.set(event.link_id, (clickCounts.get(event.link_id) ?? 0) + 1);
    }
  }

  const items: LinkRankingItem[] = links.map((link) => {
    const clicks = clickCounts.get(link.id) ?? 0;
    const percentage =
      totalLinkClicks > 0
        ? Number(((clicks / totalLinkClicks) * 100).toFixed(1))
        : 0;

    return {
      linkId: link.id,
      title: link.title,
      url: link.url,
      clicks,
      percentage,
    };
  });

  return items.sort((a, b) => b.clicks - a.clicks);
}

/**
 * Computes high-level summary metrics from aggregated views and clicks.
 */
export function computeAnalyticsSummary(
  views: number,
  clicks: number,
  rankings: LinkRankingItem[],
): AnalyticsSummary {
  const topLink =
    rankings.length > 0 && rankings[0].clicks > 0 ? rankings[0] : null;

  return {
    totalViews: views,
    totalClicks: clicks,
    ctr: calculateCtr(views, clicks),
    topLinkTitle: topLink ? topLink.title : null,
    topLinkClicks: topLink ? topLink.clicks : 0,
  };
}
