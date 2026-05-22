/**
 * Stores sitemap — /sitemaps/stores
 * One URL per store profile page.
 */

import { SITE_URL, fetchStoreUsernames } from '@/lib/sitemap/sitemapUtils'

export const revalidate = 3600

export async function GET() {
  const usernames = await fetchStoreUsernames()
  const now = new Date().toISOString()

  const entries = usernames.map(
    (username) =>
      `  <url>\n    <loc>${SITE_URL}/store/${username}</loc>\n    <lastmod>${now}</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>0.9</priority>\n  </url>`,
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
