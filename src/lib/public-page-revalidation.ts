import "server-only";
import { revalidatePath, revalidateTag, updateTag } from "next/cache";
import {
  publicPageSlugTag,
  publicPageTag,
} from "@/lib/public-page-cache";

type PublicPageInvalidationInput = {
  pageId: string;
  oldSlug?: string;
  newSlug?: string;
};

function getPublicPageTags({
  pageId,
  oldSlug,
  newSlug,
}: PublicPageInvalidationInput) {
  return [
    publicPageTag(pageId),
    ...new Set(
      [oldSlug, newSlug]
        .filter((slug): slug is string => Boolean(slug))
        .map(publicPageSlugTag),
    ),
  ];
}

function revalidatePublicPagePaths({
  oldSlug,
  newSlug,
}: PublicPageInvalidationInput) {
  for (const slug of new Set([oldSlug, newSlug])) {
    if (slug) {
      revalidatePath(`/${slug}`);
    }
  }
}

export function revalidatePublicPageFromAction(
  input: PublicPageInvalidationInput,
) {
  for (const tag of getPublicPageTags(input)) {
    updateTag(tag);
  }

  revalidatePublicPagePaths(input);
}

export function revalidatePublicPageFromRouteHandler(
  input: PublicPageInvalidationInput,
) {
  for (const tag of getPublicPageTags(input)) {
    revalidateTag(tag, { expire: 0 });
  }

  revalidatePublicPagePaths(input);
}
