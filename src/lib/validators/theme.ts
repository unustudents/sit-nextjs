import { z } from "zod";
import type { ThemeConfig } from "@/types/database.types";

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

export const DEFAULT_THEME: ThemeConfig = {
  version: 1,
  template: "minimal",
  colors: {
    background: "#0A0E17",
    text: "#FFFFFF",
    button: "#2563EB",
    buttonText: "#FFFFFF",
  },
  font: "sans",
  buttonRadius: "lg",
  backgroundStyle: "gradient",
  animation: "subtle",
};

export const THEME_PRESETS: {
  id: string;
  name: string;
  description: string;
  config: ThemeConfig;
}[] = [
  {
    id: "minimalDark",
    name: "Midnight Slate",
    description: "Tampilan gelap modern dengan kontras tinggi dan aksen biru profesional.",
    config: {
      version: 1,
      template: "minimal",
      colors: {
        background: "#0A0E17",
        text: "#FFFFFF",
        button: "#2563EB",
        buttonText: "#FFFFFF",
      },
      font: "sans",
      buttonRadius: "lg",
      backgroundStyle: "gradient",
      animation: "subtle",
    },
  },
  {
    id: "cleanLight",
    name: "Clean Light",
    description: "Tampilan terang minimalis bernuansa editorial korporat.",
    config: {
      version: 1,
      template: "minimal",
      colors: {
        background: "#F8FAFC",
        text: "#0F172A",
        button: "#0F172A",
        buttonText: "#FFFFFF",
      },
      font: "sans",
      buttonRadius: "lg",
      backgroundStyle: "solid",
      animation: "subtle",
    },
  },
  {
    id: "radiantGlass",
    name: "Radiant Glass",
    description: "Efek glassmorphism transparan dengan aksen aurora indigo dan tombol pill.",
    config: {
      version: 1,
      template: "glass",
      colors: {
        background: "#0F172A",
        text: "#F8FAFC",
        button: "#6366F1",
        buttonText: "#FFFFFF",
      },
      font: "sans",
      buttonRadius: "full",
      backgroundStyle: "mesh",
      animation: "subtle",
    },
  },
  {
    id: "neoTerminal",
    name: "Neo Terminal",
    description: "Nuansa developer & hacker terminal bernuansa hijau monokrom.",
    config: {
      version: 1,
      template: "bold",
      colors: {
        background: "#121212",
        text: "#E2E8F0",
        button: "#10B981",
        buttonText: "#000000",
      },
      font: "mono",
      buttonRadius: "sm",
      backgroundStyle: "solid",
      animation: "subtle",
    },
  },
  {
    id: "sunsetGlow",
    name: "Sunset Crimson",
    description: "Aksen gradasi mewah bernuansa crimson dan tipografi serif anggun.",
    config: {
      version: 1,
      template: "glass",
      colors: {
        background: "#180D26",
        text: "#FAF5FF",
        button: "#F43F5E",
        buttonText: "#FFFFFF",
      },
      font: "serif",
      buttonRadius: "full",
      backgroundStyle: "gradient",
      animation: "subtle",
    },
  },
];

export const socialLinkSchema = z.object({
  label: z.string().trim().min(1).max(50),
  url: z.url("URL sosial media tidak valid"),
  icon: z.string().trim().max(50),
});

export type ThemeConfigInput = z.infer<typeof themeConfigSchema>;
export type SocialLinkInput = z.infer<typeof socialLinkSchema>;
