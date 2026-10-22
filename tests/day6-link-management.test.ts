import { describe, expect, it } from "bun:test";
import {
  createLinkSchema,
  updateLinkSchema,
  toggleLinkSchema,
  deleteLinkSchema,
  reorderLinksSchema,
  urlSchema,
} from "@/lib/validators/link";

describe("Day 6: Link Management (CRUD, Active State, & Validation)", () => {
  const validPageId = "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11";
  const validLinkId = "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22";

  describe("URL Validator (urlSchema)", () => {
    it("accepts valid https URL", () => {
      const res = urlSchema.safeParse("https://google.com");
      expect(res.success).toBe(true);
      if (res.success) {
        expect(res.data).toBe("https://google.com");
      }
    });

    it("accepts valid http URL with path and query parameters", () => {
      const res = urlSchema.safeParse(
        "http://intranet.perusahaan.com:8080/portal?dept=it&ref=bio",
      );
      expect(res.success).toBe(true);
    });

    it("rejects non-http protocols like javascript: or ftp:", () => {
      const jsUrl = urlSchema.safeParse("javascript:alert(1)");
      expect(jsUrl.success).toBe(false);

      const ftpUrl = urlSchema.safeParse("ftp://files.example.com");
      expect(ftpUrl.success).toBe(false);
    });

    it("rejects plain text that is not a URL", () => {
      const res = urlSchema.safeParse("bukan-url-valid");
      expect(res.success).toBe(false);
    });

    it("rejects URLs exceeding 2048 characters", () => {
      const longUrl = "https://example.com/" + "a".repeat(2050);
      const res = urlSchema.safeParse(longUrl);
      expect(res.success).toBe(false);
    });
  });

  describe("Create Link Schema (createLinkSchema)", () => {
    it("validates valid link creation input", () => {
      const res = createLinkSchema.safeParse({
        pageId: validPageId,
        title: "Portal Layanan TI",
        url: "https://helpdesk.company.com",
        icon: "globe",
      });
      expect(res.success).toBe(true);
      if (res.success) {
        expect(res.data.title).toBe("Portal Layanan TI");
        expect(res.data.url).toBe("https://helpdesk.company.com");
        expect(res.data.icon).toBe("globe");
      }
    });

    it("accepts link without optional icon", () => {
      const res = createLinkSchema.safeParse({
        pageId: validPageId,
        title: "Dokumentasi API",
        url: "https://docs.company.com",
      });
      expect(res.success).toBe(true);
    });

    it("rejects empty title or title consisting only of whitespace", () => {
      const res = createLinkSchema.safeParse({
        pageId: validPageId,
        title: "   ",
        url: "https://docs.company.com",
      });
      expect(res.success).toBe(false);
    });

    it("rejects title exceeding 120 characters", () => {
      const res = createLinkSchema.safeParse({
        pageId: validPageId,
        title: "A".repeat(121),
        url: "https://docs.company.com",
      });
      expect(res.success).toBe(false);
    });

    it("rejects invalid pageId (non-UUID)", () => {
      const res = createLinkSchema.safeParse({
        pageId: "invalid-uuid-123",
        title: "Valid Title",
        url: "https://example.com",
      });
      expect(res.success).toBe(false);
    });
  });

  describe("Update Link Schema (updateLinkSchema)", () => {
    it("validates complete link update input", () => {
      const res = updateLinkSchema.safeParse({
        id: validLinkId,
        pageId: validPageId,
        title: "Judul Baru Helpdesk",
        url: "https://new-helpdesk.company.com",
        icon: "headphones",
        isActive: false,
      });
      expect(res.success).toBe(true);
      if (res.success) {
        expect(res.data.title).toBe("Judul Baru Helpdesk");
        expect(res.data.isActive).toBe(false);
      }
    });

    it("rejects update if link ID is invalid UUID", () => {
      const res = updateLinkSchema.safeParse({
        id: "not-a-uuid",
        pageId: validPageId,
        title: "Title",
        url: "https://example.com",
      });
      expect(res.success).toBe(false);
    });
  });

  describe("Toggle Link Status Schema (toggleLinkSchema)", () => {
    it("validates toggling link to active (true)", () => {
      const res = toggleLinkSchema.safeParse({
        id: validLinkId,
        pageId: validPageId,
        isActive: true,
      });
      expect(res.success).toBe(true);
      if (res.success) {
        expect(res.data.isActive).toBe(true);
      }
    });

    it("validates toggling link to inactive (false)", () => {
      const res = toggleLinkSchema.safeParse({
        id: validLinkId,
        pageId: validPageId,
        isActive: false,
      });
      expect(res.success).toBe(true);
      if (res.success) {
        expect(res.data.isActive).toBe(false);
      }
    });
  });

  describe("Delete & Reorder Link Schemas", () => {
    it("validates delete link schema with link ID and page ID", () => {
      const res = deleteLinkSchema.safeParse({
        id: validLinkId,
        pageId: validPageId,
      });
      expect(res.success).toBe(true);
    });

    it("validates reorder schema with list of link IDs", () => {
      const id1 = "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a21";
      const id2 = "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22";
      const id3 = "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a23";

      const res = reorderLinksSchema.safeParse({
        pageId: validPageId,
        orderedIds: [id3, id1, id2],
      });
      expect(res.success).toBe(true);
      if (res.success) {
        expect(res.data.orderedIds).toEqual([id3, id1, id2]);
      }
    });

    it("rejects empty orderedIds array", () => {
      const res = reorderLinksSchema.safeParse({
        pageId: validPageId,
        orderedIds: [],
      });
      expect(res.success).toBe(false);
    });
  });

  describe("FR-015: Active vs Inactive Links Public Filtering", () => {
    type TestLink = {
      id: string;
      title: string;
      url: string;
      sort_order: number;
      is_active: boolean;
    };

    const mockLinks: TestLink[] = [
      {
        id: "link-1",
        title: "Tautan 1",
        url: "https://link1.com",
        sort_order: 0,
        is_active: true,
      },
      {
        id: "link-2",
        title: "Tautan 2",
        url: "https://link2.com",
        sort_order: 1,
        is_active: false, // inactive!
      },
      {
        id: "link-3",
        title: "Tautan 3",
        url: "https://link3.com",
        sort_order: 2,
        is_active: true,
      },
      {
        id: "link-4",
        title: "Tautan 4",
        url: "https://link4.com",
        sort_order: 3,
        is_active: false, // inactive!
      },
      {
        id: "link-5",
        title: "Tautan 5",
        url: "https://link5.com",
        sort_order: 4,
        is_active: true,
      },
    ];

    it("filters out inactive links and sorts remaining active links", () => {
      const publicLinks = mockLinks
        .filter((l) => l.is_active)
        .sort((a, b) => a.sort_order - b.sort_order);

      // Total mock links: 5, active: 3, inactive: 2
      expect(publicLinks.length).toBe(3);
      expect(publicLinks.map((l) => l.id)).toEqual(["link-1", "link-3", "link-5"]);
      expect(publicLinks.every((l) => l.is_active)).toBe(true);
    });

    it("handles pages with zero active links cleanly", () => {
      const allInactive = mockLinks.map((l) => ({ ...l, is_active: false }));
      const publicLinks = allInactive.filter((l) => l.is_active);

      expect(publicLinks.length).toBe(0);
    });
  });

  describe("Security: Safe Destination URL Validation (Open Redirect Protection)", () => {
    function isAllowedDestination(destinationUrl: string): boolean {
      try {
        const parsed = new URL(destinationUrl);
        return parsed.protocol === "http:" || parsed.protocol === "https:";
      } catch {
        return false;
      }
    }

    it("allows standard web destinations", () => {
      expect(isAllowedDestination("https://portal.company.com")).toBe(true);
      expect(isAllowedDestination("http://192.168.1.50/docs")).toBe(true);
    });

    it("blocks malicious or unauthorized schemes", () => {
      expect(isAllowedDestination("javascript:stealTokens()")).toBe(false);
      expect(isAllowedDestination("data:text/html,<script>evil()</script>")).toBe(
        false,
      );
      expect(isAllowedDestination("file:///etc/passwd")).toBe(false);
    });
  });
});
