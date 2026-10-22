"use client";

import { useEffect, useRef } from "react";

type PageViewTrackerProps = {
  pageId: string;
};

/**
 * Lightweight client component to trigger a page_view analytics event (FR-023).
 * Operates non-blockingly and fault-tolerantly (NFR-015).
 */
export function PageViewTracker({ pageId }: PageViewTrackerProps) {
  const hasTrackedRef = useRef(false);

  useEffect(() => {
    if (hasTrackedRef.current || !pageId) return;
    hasTrackedRef.current = true;

    try {
      void fetch(`/api/view/${pageId}`, {
        method: "POST",
        keepalive: true,
        headers: {
          "Content-Type": "application/json",
        },
      }).catch(() => {
        // Silently swallow network / beacon errors per NFR-015
      });
    } catch {
      // Swallowed
    }
  }, [pageId]);

  return null;
}
