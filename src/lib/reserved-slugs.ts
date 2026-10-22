export const RESERVED_SLUGS = [
  'admin',
  'api',
  'auth',
  'dashboard',
  'login',
  'logout',
  'settings',
  'signup',
  'register',
  'favicon',
  'robots',
  'sitemap',
  '_next',
  'public',
  'static',
  'manifest',
  'opengraph-image',
  'icon',
  'apple-icon',
  'not-found',
  'health',
] as const

export type ReservedSlug = (typeof RESERVED_SLUGS)[number]

export function isReservedSlug(slug: string): boolean {
  return (RESERVED_SLUGS as readonly string[]).includes(slug.toLowerCase().trim())
}
