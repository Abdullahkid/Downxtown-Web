/**
 * Categories sitemap — /sitemaps/categories
 * 5 master category pages + 96 taxonomy pages.
 * All URLs are static (derived from taxonomyMap.ts) — no backend call needed.
 */

import { SITE_URL } from '@/lib/sitemap/sitemapUtils'
import { ALL_TAXONOMY_PATHS } from '@/lib/taxonomy/taxonomyMap'

export const revalidate = 86400 // taxonomy changes rarely

const MASTER_CATEGORIES = ['fashion', 'footwear', 'electronics', 'cosmetics', 'accessories']

export async function GET() {
  const now = new Date().toISOString()

  const masterEntries = MASTER_CATEGORIES.map(
    (slug) =>
      `  <url>\n    <loc>${SITE_URL}/category/${slug}</loc>\n    <lastmod>${now}</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>0.9</priority>\n  </url>`,
  )

  const taxonomyEntries = ALL_TAXONOMY_PATHS.map((path) => {
    const depth = path.split('/').length
    const priority = depth >= 3 ? '0.85' : '0.75'
    return `  <url>\n    <loc>${SITE_URL}/category/${path}</loc>\n    <lastmod>${now}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>${priority}</priority>\n  </url>`
  })

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${[...masterEntries, ...taxonomyEntries].join('\n')}
</urlset>`

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=86400',
    },
  })
}
