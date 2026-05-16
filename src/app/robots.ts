/**
 * robots.ts — Next.js MetadataRoute.Robots handler.
 *
 * Allows all public routes and disallows private/authenticated routes.
 *
 * Requirements: 21.4
 */

import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: ['/', '/store/', '/product/'],
      disallow: ['/checkout', '/orders', '/profile', '/chat', '/auth'],
    },
    sitemap: 'https://downxtown.com/sitemap.xml',
  }
}
