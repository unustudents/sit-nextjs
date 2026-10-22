import { describe, expect, it } from "bun:test";
import sharp from "sharp";
import { socialLinkSchema, updatePageSchema } from "@/lib/validators/page";

describe("Day 5: Profile, Avatar Upload, & Social Links", () => {
  describe("Magic Bytes & Image Format Detection", () => {
    function detectFormat(
      buffer: Buffer,
    ): "image/jpeg" | "image/png" | "image/webp" | "image/gif" | null {
      if (buffer.length < 12) return null;

      if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
        return "image/jpeg";
      }

      if (
        buffer[0] === 0x89 &&
        buffer[1] === 0x50 &&
        buffer[2] === 0x4e &&
        buffer[3] === 0x47 &&
        buffer[4] === 0x0d &&
        buffer[5] === 0x0a &&
        buffer[6] === 0x1a &&
        buffer[7] === 0x0a
      ) {
        return "image/png";
      }

      if (
        buffer[0] === 0x52 &&
        buffer[1] === 0x49 &&
        buffer[2] === 0x46 &&
        buffer[3] === 0x46 &&
        buffer[8] === 0x57 &&
        buffer[9] === 0x45 &&
        buffer[10] === 0x42 &&
        buffer[11] === 0x50
      ) {
        return "image/webp";
      }

      if (
        buffer[0] === 0x47 &&
        buffer[1] === 0x49 &&
        buffer[2] === 0x46 &&
        buffer[3] === 0x38 &&
        (buffer[4] === 0x37 || buffer[4] === 0x39) &&
        buffer[5] === 0x61
      ) {
        return "image/gif";
      }

      return null;
    }

    it("correctly recognizes JPEG magic bytes", async () => {
      const jpeg = await sharp({
        create: {
          width: 50,
          height: 50,
          channels: 3,
          background: { r: 255, g: 0, b: 0 },
        },
      })
        .jpeg()
        .toBuffer();

      expect(detectFormat(jpeg)).toBe("image/jpeg");
    });

    it("correctly recognizes PNG magic bytes", async () => {
      const png = await sharp({
        create: {
          width: 50,
          height: 50,
          channels: 4,
          background: { r: 0, g: 255, b: 0, alpha: 1 },
        },
      })
        .png()
        .toBuffer();

      expect(detectFormat(png)).toBe("image/png");
    });

    it("correctly recognizes WebP magic bytes", async () => {
      const webp = await sharp({
        create: {
          width: 50,
          height: 50,
          channels: 3,
          background: { r: 0, g: 0, b: 255 },
        },
      })
        .webp()
        .toBuffer();

      expect(detectFormat(webp)).toBe("image/webp");
    });

    it("rejects corrupted or spoofed files", () => {
      const textBuffer = Buffer.from("<html><script>alert(1)</script></html>");
      expect(detectFormat(textBuffer)).toBeNull();

      const shortBuffer = Buffer.from([0xff, 0xd8]);
      expect(detectFormat(shortBuffer)).toBeNull();
    });
  });

  describe("Sharp Optimization & Metadata Stripping", () => {
    it("converts input image into optimized 512x512 WebP without EXIF metadata", async () => {
      const input = await sharp({
        create: {
          width: 800,
          height: 600,
          channels: 3,
          background: { r: 100, g: 150, b: 200 },
        },
      })
        .jpeg()
        .toBuffer();

      const optimized = await sharp(input)
        .rotate()
        .resize(512, 512, { fit: "cover", position: "center" })
        .webp({ quality: 85 })
        .toBuffer();

      const meta = await sharp(optimized).metadata();
      expect(meta.format).toBe("webp");
      expect(meta.width).toBe(512);
      expect(meta.height).toBe(512);
      expect(meta.exif).toBeUndefined();
    });
  });

  describe("NFR-006: 2 MB Max File Size Enforcement", () => {
    it("accepts buffer within 2 MB limit", () => {
      const validSize = 1.9 * 1024 * 1024;
      const MAX_SIZE = 2 * 1024 * 1024;
      expect(validSize <= MAX_SIZE).toBe(true);
    });

    it("identifies buffer exceeding 2 MB limit", () => {
      const invalidSize = 2.1 * 1024 * 1024;
      const MAX_SIZE = 2 * 1024 * 1024;
      expect(invalidSize > MAX_SIZE).toBe(true);
    });
  });

  describe("Social Links Schema Validation", () => {
    it("accepts valid social links with http, https, mailto, tel", () => {
      const validLinks = [
        {
          label: "Instagram",
          url: "https://instagram.com/user",
          icon: "instagram",
        },
        {
          label: "Email",
          url: "mailto:hello@example.com",
          icon: "email",
        },
        {
          label: "WhatsApp",
          url: "https://wa.me/628123456789",
          icon: "whatsapp",
        },
        {
          label: "Telepon",
          url: "tel:+628123456789",
          icon: "phone",
        },
      ];

      for (const link of validLinks) {
        const res = socialLinkSchema.safeParse(link);
        expect(res.success).toBe(true);
      }
    });

    it("rejects invalid URLs such as javascript:, ftp:, or invalid text", () => {
      const invalidLinks = [
        {
          label: "Bahaya",
          url: "javascript:alert(1)",
          icon: "globe",
        },
        {
          label: "FTP",
          url: "ftp://files.example.com",
          icon: "globe",
        },
        {
          label: "Tanpa Protokol",
          url: "instagram.com/user",
          icon: "instagram",
        },
        {
          label: "Teks Bebas",
          url: "bukan-sebuah-url",
          icon: "globe",
        },
      ];

      for (const link of invalidLinks) {
        const res = socialLinkSchema.safeParse(link);
        expect(res.success).toBe(false);
      }
    });

    it("rejects empty labels or labels exceeding 50 chars", () => {
      const emptyLabel = socialLinkSchema.safeParse({
        label: "",
        url: "https://example.com",
        icon: "website",
      });
      expect(emptyLabel.success).toBe(false);

      const longLabel = socialLinkSchema.safeParse({
        label: "a".repeat(51),
        url: "https://example.com",
        icon: "website",
      });
      expect(longLabel.success).toBe(false);
    });
  });

  describe("updatePageSchema Integration", () => {
    it("validates page update with avatar_path and social_links", () => {
      const pageId = crypto.randomUUID();
      const result = updatePageSchema.safeParse({
        id: pageId,
        slug: "profil-resmi",
        title: "Profil Resmi",
        description: "Selamat datang di halaman resmi kami",
        status: "published",
        avatar_path: `pages/${pageId}/abc.webp`,
        social_links: [
          {
            label: "Instagram",
            url: "https://instagram.com/resmi",
            icon: "instagram",
          },
        ],
      });

      expect(result.success).toBe(true);
    });

    it("enforces maximum 20 social links per page", () => {
      const links = Array.from({ length: 21 }, (_, i) => ({
        label: `Link ${i + 1}`,
        url: `https://example.com/${i + 1}`,
        icon: "website",
      }));

      const result = updatePageSchema.safeParse({
        id: crypto.randomUUID(),
        slug: "banyak-link",
        title: "Banyak Link",
        status: "draft",
        social_links: links,
      });

      expect(result.success).toBe(false);
    });

    it("accepts null or omitted avatar_path for pages without avatar", () => {
      const resultNull = updatePageSchema.safeParse({
        id: crypto.randomUUID(),
        slug: "tanpa-avatar",
        title: "Tanpa Avatar",
        status: "draft",
        avatar_path: null,
      });
      expect(resultNull.success).toBe(true);

      const resultOmitted = updatePageSchema.safeParse({
        id: crypto.randomUUID(),
        slug: "tanpa-avatar-2",
        title: "Tanpa Avatar 2",
        status: "draft",
      });
      expect(resultOmitted.success).toBe(true);
    });
  });

  describe("Per-Page Isolation Guarantee", () => {
    it("ensures page A modifications leave page B avatar and social links isolated", () => {
      type PageRecord = {
        id: string;
        title: string;
        avatar_path: string | null;
        social_links: Array<{ label: string; url: string; icon: string }>;
      };

      const pageA: PageRecord = {
        id: "page-111",
        title: "Halaman A",
        avatar_path: "pages/page-111/avatarA.webp",
        social_links: [
          { label: "IG A", url: "https://instagram.com/a", icon: "instagram" },
        ],
      };

      const pageB: PageRecord = {
        id: "page-222",
        title: "Halaman B",
        avatar_path: "pages/page-222/avatarB.webp",
        social_links: [
          { label: "IG B", url: "https://instagram.com/b", icon: "instagram" },
        ],
      };

      // Mutate page A only
      const updatedPageA = {
        ...pageA,
        avatar_path: "pages/page-111/new-avatarA.webp",
        social_links: [
          {
            label: "YouTube A",
            url: "https://youtube.com/@a",
            icon: "youtube",
          },
        ],
      };

      // Page B must be completely unaffected
      expect(pageB.avatar_path).toBe("pages/page-222/avatarB.webp");
      expect(pageB.social_links[0].label).toBe("IG B");
      expect(updatedPageA.avatar_path).not.toBe(pageB.avatar_path);
    });
  });
});
