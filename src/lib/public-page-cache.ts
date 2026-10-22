import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import type {
  PageStatus,
  SocialLink,
  ThemeConfig,
} from "@/types/database.types";

export type PublicPage = {
  id: string;
  slug: string;
  title: string;
  description: string;
  avatar_path: string | null;
  social_links: SocialLink[];
  theme_config?: ThemeConfig | null;
  status: PageStatus;
};

export type PublicLink = {
  id: string;
  title: string;
  url: string;
  icon: string | null;
  sort_order: number;
};

import { publicPageSlugTag, publicPageTag } from "@/lib/public-page-tags";
export { publicPageSlugTag, publicPageTag };

export async function getPublicPage(slug: string): Promise<PublicPage | null> {
  "use cache";

  cacheTag(publicPageSlugTag(slug));

  const adminClient = createAdminClient();
  const { data: page, error } = await adminClient
    .from("pages")
    .select(
      "id, slug, title, description, avatar_path, social_links, theme_config, status",
    )
    .eq("slug", slug)
    .eq("status", "published")
    .eq("admin_disabled", false)
    .maybeSingle();

  if (error) {
    throw new Error("Gagal memuat halaman publik");
  }

  if (!page) {
    cacheLife("minutes");
    return null;
  }

  cacheTag(publicPageTag(page.id));
  cacheLife("hours");

  return page;
}

export async function getPublicLinks(pageId: string): Promise<PublicLink[]> {
  "use cache";

  cacheTag(publicPageTag(pageId));
  cacheLife("hours");

  const adminClient = createAdminClient();
  const { data: links, error } = await adminClient
    .from("links")
    .select("id, title, url, icon, sort_order")
    .eq("page_id", pageId)
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (error) {
    throw new Error("Gagal memuat tautan halaman publik");
  }

  return links;
}
