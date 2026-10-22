import { z } from "zod";
import { isReservedSlug } from "@/lib/reserved-slugs";
import { themeConfigSchema } from "@/lib/validators/theme";

export const slugSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(3, "Slug minimal 3 karakter")
  .max(40, "Slug maksimal 40 karakter")
  .regex(
    /^[a-z0-9](?:[a-z0-9-]{1,38}[a-z0-9])$/,
    "Slug hanya boleh terdiri dari huruf kecil, angka, dan tanda hubung (-), diawali dan diakhiri dengan huruf/angka",
  )
  .refine((slug) => !isReservedSlug(slug), {
    message: "Slug ini dilindungi oleh sistem dan tidak dapat digunakan",
  });

export const createPageSchema = z.object({
  slug: slugSchema,
  title: z
    .string()
    .trim()
    .min(1, "Judul halaman wajib diisi")
    .max(120, "Judul maksimal 120 karakter"),
  description: z
    .string()
    .trim()
    .max(500, "Deskripsi maksimal 500 karakter")
    .optional(),
});

export const socialLinkSchema = z.object({
  label: z
    .string()
    .trim()
    .min(1, "Nama platform wajib diisi")
    .max(50, "Nama platform maksimal 50 karakter"),
  url: z
    .string()
    .trim()
    .min(1, "URL tautan sosial wajib diisi")
    .max(2048, "URL maksimal 2048 karakter")
    .refine(
      (val) => {
        try {
          const parsed = new URL(val);
          return ["http:", "https:", "mailto:", "tel:"].includes(
            parsed.protocol,
          );
        } catch {
          return false;
        }
      },
      {
        message:
          "URL harus diawali dengan http://, https://, mailto:, atau tel:",
      },
    ),
  icon: z
    .string()
    .trim()
    .min(1, "Ikon wajib ditentukan")
    .max(50, "Nama ikon maksimal 50 karakter"),
});

export const updatePageSchema = z.object({
  id: z.uuid("ID halaman tidak valid"),
  slug: slugSchema,
  title: z
    .string()
    .trim()
    .min(1, "Judul halaman wajib diisi")
    .max(120, "Judul maksimal 120 karakter"),
  description: z
    .string()
    .trim()
    .max(500, "Deskripsi maksimal 500 karakter")
    .optional(),
  status: z.enum(["draft", "published", "archived"], {
    message: "Status halaman tidak valid",
  }),
  avatar_path: z.string().trim().nullable().optional(),
  social_links: z
    .array(socialLinkSchema)
    .max(20, "Maksimal 20 tautan sosial yang dapat ditambahkan")
    .optional(),
  theme_config: themeConfigSchema.optional(),
});

export type CreatePageInput = z.infer<typeof createPageSchema>;
export type UpdatePageInput = z.infer<typeof updatePageSchema>;
export type SocialLinkInput = z.infer<typeof socialLinkSchema>;
