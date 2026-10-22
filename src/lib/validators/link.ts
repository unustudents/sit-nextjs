import { z } from "zod";

export const urlSchema = z
  .string()
  .trim()
  .max(2048, "URL maksimal 2048 karakter")
  .refine(
    (val) => {
      try {
        const parsed = new URL(val);
        return parsed.protocol === "http:" || parsed.protocol === "https:";
      } catch {
        return false;
      }
    },
    {
      message: "URL harus valid dan diawali dengan http:// atau https://",
    },
  );

export const createLinkSchema = z.object({
  pageId: z.uuid("ID halaman tidak valid"),
  title: z
    .string()
    .trim()
    .min(1, "Judul tautan wajib diisi")
    .max(120, "Judul maksimal 120 karakter"),
  url: urlSchema,
  icon: z.string().trim().max(50).nullable().optional(),
});

export const updateLinkSchema = z.object({
  id: z.uuid("ID tautan tidak valid"),
  pageId: z.uuid("ID halaman tidak valid"),
  title: z
    .string()
    .trim()
    .min(1, "Judul tautan wajib diisi")
    .max(120, "Judul maksimal 120 karakter"),
  url: urlSchema,
  icon: z.string().trim().max(50).nullable().optional(),
  isActive: z.boolean().optional(),
});

export const toggleLinkSchema = z.object({
  id: z.uuid("ID tautan tidak valid"),
  pageId: z.uuid("ID halaman tidak valid"),
  isActive: z.boolean(),
});

export const deleteLinkSchema = z.object({
  id: z.uuid("ID tautan tidak valid"),
  pageId: z.uuid("ID halaman tidak valid"),
});

export const reorderLinksSchema = z.object({
  pageId: z.uuid("ID halaman tidak valid"),
  orderedIds: z.array(z.uuid("ID tautan tidak valid")).min(1),
});

export type CreateLinkInput = z.infer<typeof createLinkSchema>;
export type UpdateLinkInput = z.infer<typeof updateLinkSchema>;
export type ToggleLinkInput = z.infer<typeof toggleLinkSchema>;
export type DeleteLinkInput = z.infer<typeof deleteLinkSchema>;
export type ReorderLinksInput = z.infer<typeof reorderLinksSchema>;
