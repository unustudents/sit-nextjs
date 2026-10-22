"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth/require-user";
import { z } from "zod";
import {
  createPageSchema,
  type CreatePageInput,
  updatePageSchema,
  type UpdatePageInput,
} from "@/lib/validators/page";

export type CreatePageState = {
  error?: string;
  fieldErrors?: Partial<Record<keyof CreatePageInput, string[]>>;
};

export async function createPageAction(
  _previousState: CreatePageState | null,
  formData: FormData,
): Promise<CreatePageState> {
  const parsed = createPageSchema.safeParse({
    slug: formData.get("slug"),
    title: formData.get("title"),
    description: formData.get("description") || undefined,
  });

  if (!parsed.success) {
    return {
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const { userId, supabase } = await requireUser();
  const { data, error } = await supabase
    .from("pages")
    .insert({
      owner_id: userId,
      slug: parsed.data.slug,
      title: parsed.data.title,
      description: parsed.data.description ?? "",
    })
    .select("id")
    .single();

  if (error || !data) {
    if (error?.code === "23505") {
      return { error: "Slug tersebut sudah digunakan. Pilih slug lain." };
    }

    return {
      error: "Halaman belum dapat dibuat. Silakan coba lagi.",
    };
  }

  revalidatePath("/dashboard");
  redirect(`/dashboard?created=${data.id}`);
}

export type UpdatePageState = {
  error?: string;
  success?: string;
  fieldErrors?: Partial<Record<keyof UpdatePageInput, string[]>>;
};

export async function updatePageAction(
  _previousState: UpdatePageState | null,
  formData: FormData,
): Promise<UpdatePageState> {
  const rawSocialLinks = formData.get("social_links");
  let parsedSocialLinks: unknown = undefined;
  if (typeof rawSocialLinks === "string" && rawSocialLinks.trim().length > 0) {
    try {
      parsedSocialLinks = JSON.parse(rawSocialLinks);
    } catch {
      return {
        error: "Format data tautan sosial tidak valid.",
      };
    }
  } else if (rawSocialLinks === "") {
    parsedSocialLinks = [];
  }

  const rawAvatarPath = formData.get("avatar_path");
  const avatarPath =
    rawAvatarPath === ""
      ? null
      : rawAvatarPath !== null
        ? String(rawAvatarPath)
        : undefined;

  const parsed = updatePageSchema.safeParse({
    id: formData.get("id"),
    slug: formData.get("slug"),
    title: formData.get("title"),
    description: formData.get("description") || undefined,
    status: formData.get("status"),
    avatar_path: avatarPath,
    social_links: parsedSocialLinks,
  });

  if (!parsed.success) {
    return {
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const { userId, supabase } = await requireUser();

  const updatePayload: {
    slug: string;
    title: string;
    description: string;
    status: "draft" | "published" | "archived";
    avatar_path?: string | null;
    social_links?: NonNullable<UpdatePageInput["social_links"]>;
    published_at?: string;
  } = {
    slug: parsed.data.slug,
    title: parsed.data.title,
    description: parsed.data.description ?? "",
    status: parsed.data.status,
  };

  if (parsed.data.avatar_path !== undefined) {
    updatePayload.avatar_path = parsed.data.avatar_path;
  }

  if (parsed.data.social_links !== undefined) {
    updatePayload.social_links = parsed.data.social_links;
  }

  if (parsed.data.status === "published") {
    updatePayload.published_at = new Date().toISOString();
  }

  const { data, error } = await supabase
    .from("pages")
    .update(updatePayload)
    .eq("id", parsed.data.id)
    .eq("owner_id", userId)
    .select("id, slug")
    .single();

  if (error || !data) {
    if (error?.code === "23505") {
      return { error: "Slug tersebut sudah digunakan oleh halaman lain." };
    }

    return {
      error: "Pengaturan halaman belum dapat disimpan. Silakan coba lagi.",
    };
  }

  revalidatePath("/dashboard");
  revalidatePath(`/dashboard/pages/${parsed.data.id}/edit`);
  revalidatePath(`/${parsed.data.slug}`);

  return {
    success: "Pengaturan halaman berhasil diperbarui.",
  };
}

export async function deletePageAction(formData: FormData): Promise<void> {
  const rawId = formData.get("pageId");
  const parsed = z.uuid().safeParse(rawId);

  if (!parsed.success) {
    throw new Error("ID halaman tidak valid");
  }

  const { userId, supabase } = await requireUser();

  const { error } = await supabase
    .from("pages")
    .delete()
    .eq("id", parsed.data)
    .eq("owner_id", userId);

  if (error) {
    throw new Error("Gagal menghapus halaman");
  }

  revalidatePath("/dashboard");
  redirect("/dashboard?deleted=true");
}
