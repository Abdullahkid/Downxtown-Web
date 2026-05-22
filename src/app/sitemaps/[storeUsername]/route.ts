/**
 * Per-store product sitemap — /sitemaps/{storeUsername}
 *
 * Returns every published product for one store.
 * e.g. /sitemaps/bonkerscorner → all Bonkers Corner product URLs
 *
 * Each request queries only one store's products via the businessId index —
 * fast regardless of total catalogue size. A 300-product store returns in
 * well under a second. The 72 stores create 72 separate, focussed sitemaps.
 *
 * Google treats each sitemap as a thematic group, which reinforces the
 * entity relationship between the store and its products.
 */

import type { NextRequest } from 'next/server'
import {
  SITE_URL,
  fetchStoreProducts,
  buildProductSitemapUrl,
  fetchStoreUsernames,
} from '@/lib/sitemap/sitemapUtils'

export const revalidate = 3600

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ storeUsername: string }> },
) {
  const { storeUsername } = await params

  // Validate — return 404 for unknown store usernames
  const allUsernames = await fetchStoreUsernames()
  if (!allUsernames.includes(storeUsername)) {
    return new Response('Not found', { status: 404 })
  }

  const products = await fetchStoreProducts(storeUsername)
  const now = new Date().toISOString()

  const entries = products.map(({ id, slug }) => {
    const url = buildProductSitemapUrl(id, slug)
    return `  <url>\n    <loc>${url}</loc>\n    <lastmod>${now}</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>0.7</priority>\n  </url>`
  })

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.join('\n')}
</urlset>`

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
    },
  })
}
