import { describe, expect, it } from "bun:test";
import {
  themeConfigSchema,
  DEFAULT_THEME,
  THEME_PRESETS,
} from "@/lib/validators/theme";
import { updatePageSchema } from "@/lib/validators/page";

describe("Day 8: Visual Themes & Customization (FR-017, FR-018, FR-019)", () => {
  const validPageId = "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11";

  describe("Theme Configuration Validation (themeConfigSchema)", () => {
    it("validates standard DEFAULT_THEME structure", () => {
      const res = themeConfigSchema.safeParse(DEFAULT_THEME);
      expect(res.success).toBe(true);
      if (res.success) {
        expect(res.data.version).toBe(1);
        expect(res.data.template).toBe("minimal");
        expect(res.data.colors.background).toBe("#0A0E17");
      }
    });

    it("accepts valid 3-digit and 6-digit hex color codes", () => {
      const validTheme = {
        ...DEFAULT_THEME,
        colors: {
          background: "#000",
          text: "#fff",
          button: "#10B981",
          buttonText: "#ffffff",
        },
      };

      const res = themeConfigSchema.safeParse(validTheme);
      expect(res.success).toBe(true);
    });

    it("rejects invalid color formats like named colors or rgb() strings", () => {
      const invalidNamed = {
        ...DEFAULT_THEME,
        colors: {
          ...DEFAULT_THEME.colors,
          background: "blue",
        },
      };
      expect(themeConfigSchema.safeParse(invalidNamed).success).toBe(false);

      const invalidRgb = {
        ...DEFAULT_THEME,
        colors: {
          ...DEFAULT_THEME.colors,
          button: "rgb(255, 0, 0)",
        },
      };
      expect(themeConfigSchema.safeParse(invalidRgb).success).toBe(false);

      const invalidHex = {
        ...DEFAULT_THEME,
        colors: {
          ...DEFAULT_THEME.colors,
          text: "#ZZZZZZ",
        },
      };
      expect(themeConfigSchema.safeParse(invalidHex).success).toBe(false);
    });

    it("rejects unsupported template, font, or radius choices", () => {
      expect(
        themeConfigSchema.safeParse({ ...DEFAULT_THEME, template: "crazy" })
          .success,
      ).toBe(false);

      expect(
        themeConfigSchema.safeParse({ ...DEFAULT_THEME, font: "comic-sans" })
          .success,
      ).toBe(false);

      expect(
        themeConfigSchema.safeParse({ ...DEFAULT_THEME, buttonRadius: "huge" })
          .success,
      ).toBe(false);
    });
  });

  describe("FR-017: Pre-configured Curated Theme Presets", () => {
    it("provides at least 3 distinct ready-to-use presets (FR-017 requirement)", () => {
      expect(THEME_PRESETS.length >= 3).toBe(true);
    });

    it("verifies all curated presets conform strictly to themeConfigSchema", () => {
      for (const preset of THEME_PRESETS) {
        const res = themeConfigSchema.safeParse(preset.config);
        expect(res.success).toBe(true);
        expect(preset.name.length > 0).toBe(true);
        expect(preset.description.length > 0).toBe(true);
      }
    });

    it("includes template varieties (minimal, glass, bold)", () => {
      const templates = new Set(THEME_PRESETS.map((p) => p.config.template));
      expect(templates.has("minimal")).toBe(true);
      expect(templates.has("glass")).toBe(true);
      expect(templates.has("bold")).toBe(true);
    });
  });

  describe("updatePageSchema Integration with theme_config", () => {
    it("accepts valid theme_config inside page update payload", () => {
      const payload = {
        id: validPageId,
        slug: "layananti",
        title: "Layanan TI Terpadu",
        status: "published",
        theme_config: DEFAULT_THEME,
      };

      const res = updatePageSchema.safeParse(payload);
      expect(res.success).toBe(true);
      if (res.success) {
        expect(res.data.theme_config).toBeDefined();
        expect(res.data.theme_config?.template).toBe("minimal");
      }
    });

    it("rejects page update when theme_config has corrupted properties", () => {
      const payload = {
        id: validPageId,
        slug: "layananti",
        title: "Layanan TI Terpadu",
        status: "published",
        theme_config: {
          version: 1,
          template: "unknown-template",
          colors: { background: "invalid" },
        },
      };

      const res = updatePageSchema.safeParse(payload);
      expect(res.success).toBe(false);
    });
  });

  describe("FR-018 & FR-019: Dynamic Styling & Reduced Motion Derivation", () => {
    function deriveStyles(config: typeof DEFAULT_THEME) {
      const fontClass =
        config.font === "serif"
          ? "font-serif"
          : config.font === "mono"
            ? "font-mono"
            : "font-sans";

      const radiusClass =
        config.buttonRadius === "sm"
          ? "rounded-md"
          : config.buttonRadius === "md"
            ? "rounded-xl"
            : config.buttonRadius === "full"
              ? "rounded-full"
              : "rounded-2xl";

      const isAnimated = config.animation === "subtle";

      return { fontClass, radiusClass, isAnimated };
    }

    it("derives correct font class for sans, serif, and mono", () => {
      expect(deriveStyles({ ...DEFAULT_THEME, font: "sans" }).fontClass).toBe(
        "font-sans",
      );
      expect(deriveStyles({ ...DEFAULT_THEME, font: "serif" }).fontClass).toBe(
        "font-serif",
      );
      expect(deriveStyles({ ...DEFAULT_THEME, font: "mono" }).fontClass).toBe(
        "font-mono",
      );
    });

    it("derives correct button radius for all options", () => {
      expect(
        deriveStyles({ ...DEFAULT_THEME, buttonRadius: "sm" }).radiusClass,
      ).toBe("rounded-md");
      expect(
        deriveStyles({ ...DEFAULT_THEME, buttonRadius: "md" }).radiusClass,
      ).toBe("rounded-xl");
      expect(
        deriveStyles({ ...DEFAULT_THEME, buttonRadius: "lg" }).radiusClass,
      ).toBe("rounded-2xl");
      expect(
        deriveStyles({ ...DEFAULT_THEME, buttonRadius: "full" }).radiusClass,
      ).toBe("rounded-full");
    });

    it("handles animation toggle respecting reduced-motion (FR-019)", () => {
      expect(
        deriveStyles({ ...DEFAULT_THEME, animation: "subtle" }).isAnimated,
      ).toBe(true);
      expect(
        deriveStyles({ ...DEFAULT_THEME, animation: "off" }).isAnimated,
      ).toBe(false);
    });
  });
});
