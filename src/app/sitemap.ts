/**
 * Dynamic sitemap — fetches all published store usernames and active product IDs
 * from the backend and returns a Next.js MetadataRoute.Sitemap array.
 *
 * Store pages get priority 0.9 (highest after homepage) because they are the
 * primary SEO target — we want Google to index and rank them like profile pages.
 *
 * Revalidated every 24 hours via ISR.
 *
 * Requirements: 21.2, 21.3
 */

import type { MetadataRoute } from 'next'

export const revalidate = 3600 // 1 hour — was 24h, reduced to revalidate store/product pages sooner

const SITE_URL = 'https://downxtown.com'
const API_BASE = 'https://api.downxtown.com'

interface SitemapStoresResponse {
  usernames: string[]
}

interface SitemapProductsResponse {
  ids: string[]
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [storesRes, productsRes] = await Promise.allSettled([
    fetch(`${API_BASE}/sitemap/stores`, { next: { revalidate } }),
    fetch(`${API_BASE}/sitemap/products`, { next: { revalidate } }),
  ])

  const storeUsernames: string[] =
    storesRes.status === 'fulfilled' && storesRes.value.ok
      ? ((await storesRes.value.json()) as SitemapStoresResponse).usernames ?? []
      : []

  const productIds: string[] =
    productsRes.status === 'fulfilled' && productsRes.value.ok
      ? ((await productsRes.value.json()) as SitemapProductsResponse).ids ?? []
      : []

  const now = new Date()

  // Static pages
  const staticEntries: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/search`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.6,
    },
    {
      url: `${SITE_URL}/welcome`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ]

  // Store profile pages — highest priority after homepage.
  // These are the pages we want Google to surface like Instagram profiles.
  const storeEntries: MetadataRoute.Sitemap = storeUsernames.map((username) => ({
    url: `${SITE_URL}/store/${username}`,
    lastModified: now,
    changeFrequency: 'daily' as const,
    priority: 0.9,
  }))

  // Product pages
  const productEntries: MetadataRoute.Sitemap = productIds.map((id) => ({
    url: `${SITE_URL}/product/${id}`,
    lastModified: now,
    changeFrequency: 'daily' as const,
    priority: 0.7,
  }))

  return [...staticEntries, ...storeEntries, ...productEntries]
}
