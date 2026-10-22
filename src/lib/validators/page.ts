import { z } from "zod";
import { isReservedSlug } from "@/lib/reserved-slugs";

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
});

export type CreatePageInput = z.infer<typeof createPageSchema>;
export type UpdatePageInput = z.infer<typeof updatePageSchema>;
