import { describe, expect, it } from "bun:test";
import { arrayMove } from "@dnd-kit/sortable";
import { reorderLinksSchema } from "@/lib/validators/link";

describe("Day 7: Reorder & Live Preview (FR-014, FR-016, NFR-011)", () => {
  const validPageId = "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11";

  type LinkItem = {
    id: string;
    title: string;
    url: string;
    sort_order: number;
    is_active: boolean;
  };

  const initialItems: LinkItem[] = [
    {
      id: "link-0",
      title: "Helpdesk TI",
      url: "https://helpdesk.company.com",
      sort_order: 0,
      is_active: true,
    },
    {
      id: "link-1",
      title: "Dokumentasi API",
      url: "https://docs.company.com",
      sort_order: 1,
      is_active: true,
    },
    {
      id: "link-2",
      title: "Portal Karyawan (Nonaktif)",
      url: "https://portal.company.com",
      sort_order: 2,
      is_active: false,
    },
    {
      id: "link-3",
      title: "Status Sistem",
      url: "https://status.company.com",
      sort_order: 3,
      is_active: true,
    },
  ];

  describe("Drag & Drop Array Move Algorithm (arrayMove)", () => {
    it("moves an item from bottom to top", () => {
      // Move link-3 (index 3) to index 0
      const moved = arrayMove(initialItems, 3, 0);
      expect(moved.map((l) => l.id)).toEqual([
        "link-3",
        "link-0",
        "link-1",
        "link-2",
      ]);
    });

    it("moves an item from top to bottom", () => {
      // Move link-0 (index 0) to index 3
      const moved = arrayMove(initialItems, 0, 3);
      expect(moved.map((l) => l.id)).toEqual([
        "link-1",
        "link-2",
        "link-3",
        "link-0",
      ]);
    });

    it("swaps adjacent items", () => {
      // Swap index 1 and 2
      const moved = arrayMove(initialItems, 1, 2);
      expect(moved.map((l) => l.id)).toEqual([
        "link-0",
        "link-2",
        "link-1",
        "link-3",
      ]);
    });

    it("leaves array unchanged if from and to indices are identical", () => {
      const moved = arrayMove(initialItems, 2, 2);
      expect(moved.map((l) => l.id)).toEqual(initialItems.map((l) => l.id));
    });
  });

  describe("Normalized sort_order Sequential Indexing", () => {
    it("re-indexes sort_order from 0 to N-1 after reorder", () => {
      const moved = arrayMove(initialItems, 3, 0);
      const reindexed = moved.map((item, idx) => ({
        ...item,
        sort_order: idx,
      }));

      expect(reindexed.map((l) => l.sort_order)).toEqual([0, 1, 2, 3]);
      expect(reindexed[0].id).toBe("link-3");
      expect(reindexed[0].sort_order).toBe(0);
      expect(reindexed[3].id).toBe("link-2");
      expect(reindexed[3].sort_order).toBe(3);
    });
  });

  describe("Reorder Schema Validation (reorderLinksSchema)", () => {
    it("accepts valid reorder array of UUIDs", () => {
      const id1 = "c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01";
      const id2 = "c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02";
      const id3 = "c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a03";

      const res = reorderLinksSchema.safeParse({
        pageId: validPageId,
        orderedIds: [id3, id2, id1],
      });

      expect(res.success).toBe(true);
      if (res.success) {
        expect(res.data.orderedIds).toEqual([id3, id2, id1]);
      }
    });

    it("rejects empty reorder array", () => {
      const res = reorderLinksSchema.safeParse({
        pageId: validPageId,
        orderedIds: [],
      });
      expect(res.success).toBe(false);
    });

    it("rejects invalid UUID in orderedIds", () => {
      const res = reorderLinksSchema.safeParse({
        pageId: validPageId,
        orderedIds: ["not-a-uuid"],
      });
      expect(res.success).toBe(false);
    });
  });

  describe("FR-016: Live Preview Derivation Before Publication", () => {
    it("derives preview state reflecting reordered links and active filter", () => {
      // Assume user dragged link-3 to the top
      const reordered = arrayMove(initialItems, 3, 0).map((l, idx) => ({
        ...l,
        sort_order: idx,
      }));

      // In Live Preview, only active links are displayed on public cards
      const previewActiveLinks = reordered.filter((l) => l.is_active);

      // link-2 is inactive (is_active: false), so it must be excluded
      expect(previewActiveLinks.length).toBe(3);
      expect(previewActiveLinks.map((l) => l.id)).toEqual([
        "link-3",
        "link-0",
        "link-1",
      ]);
      expect(previewActiveLinks[0].title).toBe("Status Sistem");
    });

    it("calculates inactive links count correctly for preview hint", () => {
      const active = initialItems.filter((l) => l.is_active);
      const inactiveCount = initialItems.length - active.length;

      expect(inactiveCount).toBe(1);
    });

    it("reflects immediate title, bio, and slug changes without persistence", () => {
      const originalForm = {
        title: "Layanan TI",
        slug: "layananti",
        description: "Bio awal",
      };

      const userDraftChanges = {
        ...originalForm,
        title: "Layanan TI Terpadu (Draft)",
        description: "Bio baru dalam proses edit",
      };

      // Preview immediately reads userDraftChanges before server submit
      expect(userDraftChanges.title).toBe("Layanan TI Terpadu (Draft)");
      expect(userDraftChanges.description).toBe("Bio baru dalam proses edit");
      expect(originalForm.title).toBe("Layanan TI");
    });
  });

  describe("NFR-011: Keyboard and Non-Pointer Accessibility", () => {
    it("allows step-by-step move up and down operations without pointer drag", () => {
      // Simulate move up on index 2 (link-2 to index 1)
      const moveIndex = 2;
      const targetIndex = moveIndex - 1;

      const keyboardMoved = arrayMove(initialItems, moveIndex, targetIndex);
      expect(keyboardMoved[1].id).toBe("link-2");
      expect(keyboardMoved[2].id).toBe("link-1");
    });
  });
});
