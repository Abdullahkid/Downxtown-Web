/**
 * Collections sitemap — /sitemaps/collections
 * One URL per store collection page (/store/{username}/collection/{categoryId}).
 */

import { SITE_URL, fetchCollections } from '@/lib/sitemap/sitemapUtils'

export const revalidate = 3600

export async function GET() {
  const collections = await fetchCollections()
  const now = new Date().toISOString()

  const entries = collections.map(
    ({ storeUsername, categoryId }) =>
      `  <url>\n    <loc>${SITE_URL}/store/${storeUsername}/collection/${categoryId}</loc>\n    <lastmod>${now}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>`,
  )

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
