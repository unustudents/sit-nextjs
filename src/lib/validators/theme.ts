import { z } from "zod";

const hexColorRegex = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

export const themeConfigSchema = z.object({
  version: z.literal(1),
  template: z.enum(["minimal", "glass", "bold"]),
  colors: z.object({
    background: z
      .string()
      .regex(hexColorRegex, "Format warna background harus hex (#ffffff)"),
    text: z
      .string()
      .regex(hexColorRegex, "Format warna text harus hex (#111827)"),
    button: z
      .string()
      .regex(hexColorRegex, "Format warna button harus hex (#111827)"),
    buttonText: z
      .string()
      .regex(hexColorRegex, "Format warna buttonText harus hex (#ffffff)"),
  }),
  font: z.enum(["sans", "serif", "mono"]),
  buttonRadius: z.enum(["sm", "md", "lg", "full"]),
  backgroundStyle: z.enum(["solid", "gradient", "mesh"]),
  animation: z.enum(["off", "subtle"]),
});

export const DEFAULT_THEME: z.infer<typeof themeConfigSchema> = {
  version: 1,
  template: "minimal",
  colors: {
    background: "#ffffff",
    text: "#111827",
    button: "#111827",
    buttonText: "#ffffff",
  },
  font: "sans",
  buttonRadius: "lg",
  backgroundStyle: "solid",
  animation: "subtle",
};

export const socialLinkSchema = z.object({
  label: z.string().trim().min(1).max(50),
  url: z.url("URL sosial media tidak valid"),
  icon: z.string().trim().max(50),
});

export type ThemeConfigInput = z.infer<typeof themeConfigSchema>;
export type SocialLinkInput = z.infer<typeof socialLinkSchema>;
