/**
 * Sitemap Index — /sitemap.xml
 *
 * Lists every sub-sitemap so Google discovers the full site structure
 * without a single massive sitemap file:
 *
 *   /sitemaps/static       — homepage, search, welcome
 *   /sitemaps/stores       — all store profile pages
 *   /sitemaps/categories   — master + taxonomy category pages
 *   /sitemaps/collections  — store collection pages
 *   /sitemaps/{username}   — one per store, all its product pages
 *
 * Each sub-sitemap is fast because it only queries one thing.
 */

import { SITE_URL, API_BASE, fetchWithTimeout } from '@/lib/sitemap/sitemapUtils'

export const revalidate = 3600 // 1 hour

function sitemapEntry(url: string, lastmod: string): string {
  return `  <sitemap>\n    <loc>${url}</loc>\n    <lastmod>${lastmod}</lastmod>\n  </sitemap>`
}

export async function GET() {
  const now = new Date().toISOString()

  // Fetch store usernames to build per-store sitemap entries
  const res = await fetchWithTimeout(`${API_BASE}/sitemap/stores`)
  const storeUsernames: string[] = res?.ok
    ? ((await res.json()) as { usernames?: string[] }).usernames ?? []
    : []

  const staticSitemaps = [
    sitemapEntry(`${SITE_URL}/sitemaps/static`, now),
    sitemapEntry(`${SITE_URL}/sitemaps/stores`, now),
    sitemapEntry(`${SITE_URL}/sitemaps/categories`, now),
    sitemapEntry(`${SITE_URL}/sitemaps/collections`, now),
  ]

  const storeSitemaps = storeUsernames.map((username) =>
    sitemapEntry(`${SITE_URL}/sitemaps/${username}`, now),
  )

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${[...staticSitemaps, ...storeSitemaps].join('\n')}
</sitemapindex>`

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
    },
  })
}
