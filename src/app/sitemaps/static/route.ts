/**
 * Static pages sitemap — /sitemaps/static
 * Homepage, search, welcome.
 */

import { SITE_URL } from '@/lib/sitemap/sitemapUtils'

export const revalidate = 86400 // 24 hours — static pages rarely change

function urlEntry(loc: string, changefreq: string, priority: string): string {
  const now = new Date().toISOString()
  return `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${now}</lastmod>\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>\n  </url>`
}

export async function GET() {
  const entries = [
    urlEntry(SITE_URL, 'daily', '1.0'),
    urlEntry(`${SITE_URL}/search`, 'weekly', '0.6'),
    urlEntry(`${SITE_URL}/welcome`, 'monthly', '0.5'),
  ]

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.join('\n')}
</urlset>`

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=86400',
    },
  })
}
