/**
 * Dynamic sitemap — fetches all published store usernames and active product IDs
 * from the backend and returns a Next.js MetadataRoute.Sitemap array.
 *
 * Revalidated every 24 hours via ISR.
 *
 * Requirements: 21.2, 21.3
 */

import type { MetadataRoute } from 'next'

export const revalidate = 86400 // 24 hours

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

  const storeEntries: MetadataRoute.Sitemap = storeUsernames.map((username) => ({
    url: `${SITE_URL}/store/${username}`,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: 0.8,
  }))

  const productEntries: MetadataRoute.Sitemap = productIds.map((id) => ({
    url: `${SITE_URL}/product/${id}`,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: 0.7,
  }))

  return [...storeEntries, ...productEntries]
}
