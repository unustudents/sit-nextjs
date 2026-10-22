"use server";

import { revalidatePath } from "next/cache";
import { flattenError } from "zod";
import { requireUser } from "@/lib/auth/require-user";
import { revalidatePublicPageFromAction } from "@/lib/public-page-revalidation";
import {
  createLinkSchema,
  updateLinkSchema,
  toggleLinkSchema,
  deleteLinkSchema,
  reorderLinksSchema,
  type CreateLinkInput,
  type UpdateLinkInput,
} from "@/lib/validators/link";
import type { Database } from "@/types/database.types";

export type LinkRow = Database["public"]["Tables"]["links"]["Row"];

export type CreateLinkState = {
  error?: string;
  success?: string;
  fieldErrors?: Partial<Record<keyof CreateLinkInput, string[]>>;
  link?: LinkRow;
};

export type UpdateLinkState = {
  error?: string;
  success?: string;
  fieldErrors?: Partial<Record<keyof UpdateLinkInput, string[]>>;
};

async function verifyPageOwnership(
  supabase: Awaited<ReturnType<typeof requireUser>>["supabase"],
  userId: string,
  pageId: string,
) {
  const { data: page, error } = await supabase
    .from("pages")
    .select("id, slug, owner_id, admin_disabled")
    .eq("id", pageId)
    .single();

  if (error || !page) {
    return { error: "Halaman tidak ditemukan atau Anda tidak memiliki akses." };
  }

  // Check if owner or admin
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .single();

  const isAdmin = profile?.role === "admin";
  if (page.owner_id !== userId && !isAdmin) {
    return { error: "Anda tidak berhak mengubah tautan pada halaman ini." };
  }

  if (page.admin_disabled && !isAdmin) {
    return {
      error:
        "Halaman ini telah dinonaktifkan oleh administrator. Tautan tidak dapat diubah.",
    };
  }

  return { page };
}

export async function createLinkAction(
  _previousState: CreateLinkState | null,
  formData: FormData,
): Promise<CreateLinkState> {
  const rawIcon = formData.get("icon");
  const icon =
    typeof rawIcon === "string" && rawIcon.trim().length > 0
      ? rawIcon.trim()
      : null;

  const parsed = createLinkSchema.safeParse({
    pageId: formData.get("pageId"),
    title: formData.get("title"),
    url: formData.get("url"),
    icon,
  });

  if (!parsed.success) {
    return {
      fieldErrors: flattenError(parsed.error).fieldErrors,
    };
  }

  const { userId, supabase } = await requireUser();
  const pageCheck = await verifyPageOwnership(
    supabase,
    userId,
    parsed.data.pageId,
  );

  if (pageCheck.error || !pageCheck.page) {
    return { error: pageCheck.error };
  }

  // Calculate next sort_order
  const { data: lastLink } = await supabase
    .from("links")
    .select("sort_order")
    .eq("page_id", parsed.data.pageId)
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  const nextSortOrder = (lastLink?.sort_order ?? -1) + 1;

  const { data: inserted, error: insertError } = await supabase
    .from("links")
    .insert({
      page_id: parsed.data.pageId,
      title: parsed.data.title,
      url: parsed.data.url,
      icon: parsed.data.icon ?? null,
      sort_order: nextSortOrder,
      is_active: true,
    })
    .select()
    .single();

  if (insertError || !inserted) {
    return {
      error: "Gagal menyimpan tautan baru. Silakan coba kembali.",
    };
  }

  revalidatePublicPageFromAction({
    pageId: pageCheck.page.id,
    newSlug: pageCheck.page.slug,
  });
  revalidatePath(`/dashboard/pages/${pageCheck.page.id}/edit`);

  return {
    success: "Tautan baru berhasil ditambahkan.",
    link: inserted,
  };
}

export async function updateLinkAction(
  _previousState: UpdateLinkState | null,
  formData: FormData,
): Promise<UpdateLinkState> {
  const rawIcon = formData.get("icon");
  const icon =
    typeof rawIcon === "string" && rawIcon.trim().length > 0
      ? rawIcon.trim()
      : null;

  const rawIsActive = formData.get("isActive");
  const isActive =
    rawIsActive !== null ? rawIsActive === "true" || rawIsActive === "1" : true;

  const parsed = updateLinkSchema.safeParse({
    id: formData.get("id"),
    pageId: formData.get("pageId"),
    title: formData.get("title"),
    url: formData.get("url"),
    icon,
    isActive,
  });

  if (!parsed.success) {
    return {
      fieldErrors: flattenError(parsed.error).fieldErrors,
    };
  }

  const { userId, supabase } = await requireUser();
  const pageCheck = await verifyPageOwnership(
    supabase,
    userId,
    parsed.data.pageId,
  );

  if (pageCheck.error || !pageCheck.page) {
    return { error: pageCheck.error };
  }

  const { error: updateError } = await supabase
    .from("links")
    .update({
      title: parsed.data.title,
      url: parsed.data.url,
      icon: parsed.data.icon ?? null,
      is_active: parsed.data.isActive ?? true,
    })
    .eq("id", parsed.data.id)
    .eq("page_id", parsed.data.pageId);

  if (updateError) {
    return {
      error: "Gagal memperbarui tautan. Silakan coba kembali.",
    };
  }

  revalidatePublicPageFromAction({
    pageId: pageCheck.page.id,
    newSlug: pageCheck.page.slug,
  });
  revalidatePath(`/dashboard/pages/${pageCheck.page.id}/edit`);

  return {
    success: "Tautan berhasil diperbarui.",
  };
}

export async function toggleLinkActiveAction(input: {
  id: string;
  pageId: string;
  isActive: boolean;
}): Promise<{ success?: boolean; error?: string }> {
  const parsed = toggleLinkSchema.safeParse(input);
  if (!parsed.success) {
    return { error: "Data permintaan tidak valid." };
  }

  const { userId, supabase } = await requireUser();
  const pageCheck = await verifyPageOwnership(
    supabase,
    userId,
    parsed.data.pageId,
  );

  if (pageCheck.error || !pageCheck.page) {
    return { error: pageCheck.error };
  }

  const { error } = await supabase
    .from("links")
    .update({ is_active: parsed.data.isActive })
    .eq("id", parsed.data.id)
    .eq("page_id", parsed.data.pageId);

  if (error) {
    return { error: "Gagal mengubah status aktif tautan." };
  }

  revalidatePublicPageFromAction({
    pageId: pageCheck.page.id,
    newSlug: pageCheck.page.slug,
  });
  revalidatePath(`/dashboard/pages/${pageCheck.page.id}/edit`);

  return { success: true };
}

export async function deleteLinkAction(input: {
  id: string;
  pageId: string;
}): Promise<{ success?: boolean; error?: string }> {
  const parsed = deleteLinkSchema.safeParse(input);
  if (!parsed.success) {
    return { error: "Data permintaan tidak valid." };
  }

  const { userId, supabase } = await requireUser();
  const pageCheck = await verifyPageOwnership(
    supabase,
    userId,
    parsed.data.pageId,
  );

  if (pageCheck.error || !pageCheck.page) {
    return { error: pageCheck.error };
  }

  const { error } = await supabase
    .from("links")
    .delete()
    .eq("id", parsed.data.id)
    .eq("page_id", parsed.data.pageId);

  if (error) {
    return { error: "Gagal menghapus tautan." };
  }

  revalidatePublicPageFromAction({
    pageId: pageCheck.page.id,
    newSlug: pageCheck.page.slug,
  });
  revalidatePath(`/dashboard/pages/${pageCheck.page.id}/edit`);

  return { success: true };
}

export async function reorderLinksAction(input: {
  pageId: string;
  orderedIds: string[];
}): Promise<{ success?: boolean; error?: string }> {
  const parsed = reorderLinksSchema.safeParse(input);
  if (!parsed.success) {
    return { error: "Data pengurutan tidak valid." };
  }

  const { userId, supabase } = await requireUser();
  const pageCheck = await verifyPageOwnership(
    supabase,
    userId,
    parsed.data.pageId,
  );

  if (pageCheck.error || !pageCheck.page) {
    return { error: pageCheck.error };
  }

  // Update order for each link
  const updates = parsed.data.orderedIds.map((id, index) =>
    supabase
      .from("links")
      .update({ sort_order: index })
      .eq("id", id)
      .eq("page_id", parsed.data.pageId),
  );

  await Promise.all(updates);

  revalidatePublicPageFromAction({
    pageId: pageCheck.page.id,
    newSlug: pageCheck.page.slug,
  });
  revalidatePath(`/dashboard/pages/${pageCheck.page.id}/edit`);

  return { success: true };
}
