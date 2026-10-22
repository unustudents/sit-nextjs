/**
 * Resolves the canonical base URL for the application.
 * Prioritizes configured environment variables before falling back to local defaults.
 */
export function getSiteBaseUrl(): string {
  const envUrl =
    process.env.SITE_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined);

  if (envUrl) {
    return envUrl.replace(/\/+$/, "");
  }

  return "http://localhost:3000";
}

/**
 * Returns the fully qualified public URL for a given page slug.
 */
export function getPublicPageUrl(slug: string): string {
  const base = getSiteBaseUrl();
  const cleanSlug = slug.replace(/^\/+/, "");
  return `${base}/${cleanSlug}`;
}
