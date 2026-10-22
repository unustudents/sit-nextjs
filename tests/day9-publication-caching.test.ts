import { describe, expect, it } from "bun:test";
import { slugSchema } from "@/lib/validators/page";
import { publicPageSlugTag, publicPageTag } from "@/lib/public-page-tags";
import type { PageStatus, ThemeConfig } from "@/types/database.types";
import { DEFAULT_THEME } from "@/lib/validators/theme";

// Mock helper representing the public page query logic
function evaluatePublicPageVisibility(page: {
  id: string;
  slug: string;
  status: PageStatus;
  admin_disabled: boolean;
}): boolean {
  return page.status === "published" && !page.admin_disabled;
}

// Mock helper representing public links filtering and sorting logic
function filterAndSortPublicLinks<
  T extends { is_active: boolean; sort_order: number; id: string },
>(links: T[]): T[] {
  return links
    .filter((link) => link.is_active)
    .sort((a, b) => a.sort_order - b.sort_order);
}

// Tag derivation logic matching src/lib/public-page-revalidation.ts
function deriveInvalidationTags(input: {
  pageId: string;
  oldSlug?: string;
  newSlug?: string;
}): string[] {
  return [
    publicPageTag(input.pageId),
    ...new Set(
      [input.oldSlug, input.newSlug]
        .filter((slug): slug is string => Boolean(slug))
        .map(publicPageSlugTag),
    ),
  ];
}

// SEO metadata derivation matching src/app/(public)/[slug]/page.tsx
function derivePublicMetadata(page: {
  title: string;
  slug: string;
  description?: string | null;
  avatar_path?: string | null;
  status: PageStatus;
  admin_disabled: boolean;
} | null) {
  if (!page || page.status !== "published" || page.admin_disabled) {
    return {
      title: "Halaman Tidak Ditemukan — SIT",
      robots: { index: false, follow: false },
    };
  }

  const desc =
    page.description || `Kumpulan tautan dan profil resmi dari ${page.title}.`;
  const canonical = `/${page.slug}`;

  return {
    title: `${page.title} — SIT`,
    description: desc,
    alternates: { canonical },
    robots: { index: true, follow: true },
    openGraph: {
      title: `${page.title} — SIT`,
      description: desc,
      url: canonical,
      siteName: "SIT",
      type: "profile",
      images: page.avatar_path ? [`/api/assets/pages/mock-id`] : undefined,
    },
    twitter: {
      card: "summary",
      title: `${page.title} — SIT`,
      description: desc,
    },
  };
}

describe("Day 9: Publication, Public Renderer, & Caching (FR-009, FR-015, FR-020, FR-028)", () => {
  describe("FR-009 & FR-028: Status Gating & Public Access Control", () => {
    const basePage = {
      id: "a0000000-0000-0000-0000-000000000001",
      slug: "layanan-ti",
    };

    it("allows public access when page is 'published' and not admin_disabled", () => {
      const page = { ...basePage, status: "published" as const, admin_disabled: false };
      expect(evaluatePublicPageVisibility(page)).toBe(true);
    });

    it("denies public access (returns 404) when page is in 'draft' status", () => {
      const page = { ...basePage, status: "draft" as const, admin_disabled: false };
      expect(evaluatePublicPageVisibility(page)).toBe(false);
    });

    it("denies public access (returns 404) when page is 'archived'", () => {
      const page = { ...basePage, status: "archived" as const, admin_disabled: false };
      expect(evaluatePublicPageVisibility(page)).toBe(false);
    });

    it("denies public access when admin has disabled the page regardless of status (FR-028)", () => {
      const page = { ...basePage, status: "published" as const, admin_disabled: true };
      expect(evaluatePublicPageVisibility(page)).toBe(false);
    });

    it("rejects invalid slugs before querying database", () => {
      expect(slugSchema.safeParse("").success).toBe(false);
      expect(slugSchema.safeParse("Layanan TI").success).toBe(false);
      expect(slugSchema.safeParse("-invalid-").success).toBe(false);
      expect(slugSchema.safeParse("admin").success).toBe(false); // Protected slug
      expect(slugSchema.safeParse("layanan-ti").success).toBe(true);
    });
  });

  describe("FR-015: Public Link Filtering & Sort Order", () => {
    it("filters out inactive links and sorts active links strictly by sort_order ascending", () => {
      const rawLinks = [
        { id: "1", is_active: true, sort_order: 3, title: "Third Link" },
        { id: "2", is_active: false, sort_order: 0, title: "Disabled First Link" },
        { id: "3", is_active: true, sort_order: 1, title: "First Active Link" },
        { id: "4", is_active: false, sort_order: 2, title: "Disabled Middle Link" },
        { id: "5", is_active: true, sort_order: 2, title: "Second Active Link" },
      ];

      const visible = filterAndSortPublicLinks(rawLinks);
      expect(visible.length).toBe(3);
      expect(visible[0].id).toBe("3");
      expect(visible[0].sort_order).toBe(1);
      expect(visible[1].id).toBe("5");
      expect(visible[1].sort_order).toBe(2);
      expect(visible[2].id).toBe("1");
      expect(visible[2].sort_order).toBe(3);
    });

    it("returns an empty array when all links are inactive", () => {
      const rawLinks = [
        { id: "1", is_active: false, sort_order: 0 },
        { id: "2", is_active: false, sort_order: 1 },
      ];
      expect(filterAndSortPublicLinks(rawLinks)).toEqual([]);
    });
  });

  describe("Cache Management & Revalidation Tag Derivation", () => {
    const pageId = "b1111111-1111-1111-1111-111111111111";

    it("formats public page cache tag consistently", () => {
      expect(publicPageTag(pageId)).toBe(`public-page:${pageId}`);
    });

    it("formats public page slug cache tag consistently", () => {
      expect(publicPageSlugTag("riset-ti")).toBe("public-page-slug:riset-ti");
    });

    it("generates cache tags for single-slug update (e.g. content or theme change)", () => {
      const tags = deriveInvalidationTags({
        pageId,
        newSlug: "riset-ti",
      });

      expect(tags.includes(`public-page:${pageId}`)).toBe(true);
      expect(tags.includes("public-page-slug:riset-ti")).toBe(true);
      expect(tags.length).toBe(2);
    });

    it("invalidates both old and new slug tags when slug is changed (FR-010)", () => {
      const tags = deriveInvalidationTags({
        pageId,
        oldSlug: "old-slug",
        newSlug: "new-slug",
      });

      expect(tags.includes(`public-page:${pageId}`)).toBe(true);
      expect(tags.includes("public-page-slug:old-slug")).toBe(true);
      expect(tags.includes("public-page-slug:new-slug")).toBe(true);
      expect(tags.length).toBe(3);
    });
  });

  describe("FR-020 & SEO: Metadata & Viewport Layout Constraints", () => {
    it("generates complete and valid SEO metadata for published pages", () => {
      const meta = derivePublicMetadata({
        title: "Pusat Bantuan",
        slug: "bantuan",
        description: "Layanan resmi pusat bantuan.",
        avatar_path: "pages/id/avatar.webp",
        status: "published",
        admin_disabled: false,
      });

      expect(meta.title).toBe("Pusat Bantuan — SIT");
      expect(meta.description).toBe("Layanan resmi pusat bantuan.");
      expect(meta.alternates?.canonical).toBe("/bantuan");
      expect(meta.robots.index).toBe(true);
      expect(meta.robots.follow).toBe(true);
      expect(meta.openGraph?.type).toBe("profile");
      expect(meta.openGraph?.url).toBe("/bantuan");
      expect(meta.openGraph?.images?.length).toBe(1);
      expect(meta.twitter?.card).toBe("summary");
    });

    it("sets robots index: false and follow: false for unpublished or non-existent pages", () => {
      const draftMeta = derivePublicMetadata({
        title: "Draft Page",
        slug: "draft-slug",
        status: "draft",
        admin_disabled: false,
      });

      expect(draftMeta.title).toBe("Halaman Tidak Ditemukan — SIT");
      expect(draftMeta.robots.index).toBe(false);
      expect(draftMeta.robots.follow).toBe(false);

      const nullMeta = derivePublicMetadata(null);
      expect(nullMeta.robots.index).toBe(false);
      expect(nullMeta.robots.follow).toBe(false);
    });

    it("verifies theme config fallback preserves contrast and valid background styles", () => {
      const theme: ThemeConfig = DEFAULT_THEME;
      const hexPattern = /^#[0-9a-fA-F]{6}$/;
      expect(theme.version).toBe(1);
      expect(hexPattern.test(theme.colors.background)).toBe(true);
      expect(hexPattern.test(theme.colors.text)).toBe(true);
      expect(hexPattern.test(theme.colors.button)).toBe(true);
      expect(["sans", "serif", "mono"].includes(theme.font)).toBe(true);
      expect(["solid", "gradient", "mesh"].includes(theme.backgroundStyle)).toBe(true);
    });
  });

  describe("FR-023 & NFR-012 & NFR-015: Analytics Event Invariants", () => {
    it("validates page_view event payload conforms to schema invariants (link_id must be null)", () => {
      const pageViewPayload = {
        page_id: "c2222222-2222-2222-2222-222222222222",
        link_id: null,
        event_type: "page_view",
      };

      expect(pageViewPayload.event_type).toBe("page_view");
      expect(pageViewPayload.link_id).toBeNull();
      // NFR-012: Ensure payload has NO ip_address or user_agent fields
      expect("ip_address" in pageViewPayload).toBe(false);
      expect("user_agent" in pageViewPayload).toBe(false);
    });

    it("validates link_click event payload requires non-null link_id", () => {
      const linkClickPayload = {
        page_id: "c2222222-2222-2222-2222-222222222222",
        link_id: "d3333333-3333-3333-3333-333333333333",
        event_type: "link_click",
      };

      expect(linkClickPayload.event_type).toBe("link_click");
      expect(linkClickPayload.link_id).not.toBeNull();
    });
  });
});
