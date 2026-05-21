/**
 * robots.ts — Next.js MetadataRoute.Robots handler.
 *
 * Explicitly allows Googlebot and all crawlers to index store and product
 * pages. Disallows auth-gated and private routes.
 *
 * Requirements: 21.4
 */

import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: 'Googlebot',
        allow: ['/', '/store/', '/product/', '/search', '/category/', '/welcome'],
        disallow: ['/checkout', '/orders', '/profile', '/chat', '/auth'],
      },
      {
        userAgent: '*',
        allow: ['/', '/store/', '/product/', '/search', '/category/', '/welcome'],
        disallow: ['/checkout', '/orders', '/profile', '/chat', '/auth'],
      },
    ],
    sitemap: 'https://downxtown.com/sitemap.xml',
  }
}
