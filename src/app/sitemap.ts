/**
 * Dynamic sitemap — fetches all published store usernames and active product IDs
 * from the backend and returns a Next.js MetadataRoute.Sitemap array.
 *
 * Store pages get priority 0.9 (highest after homepage) because they are the
 * primary SEO target — we want Google to index and rank them like profile pages.
 *
 * Product URLs use the SEO-friendly slug format: /product/{slug}-{id}
 * where slug = shopifyHandle (Shopify products) or title-derived slug (direct uploads).
 *
 * Revalidated every hour via ISR.
 *
 * Requirements: 21.2, 21.3
 */

import type { MetadataRoute } from 'next'
import { ALL_TAXONOMY_PATHS } from '@/lib/taxonomy/taxonomyMap'

export const revalidate = 3600 // 1 hour

const SITE_URL = 'https://downxtown.com'
const API_BASE = 'https://api.downxtown.com'

interface SitemapStoresResponse {
  usernames: string[]
}

// New response shape — backend returns { id, slug } pairs
interface SitemapProductEntry {
  id: string
  slug: string
}
interface SitemapProductsResponse {
  products: SitemapProductEntry[]
}

interface SitemapCollectionEntry {
  storeUsername: string
  categoryId: string
}
interface SitemapCollectionsResponse {
  collections: SitemapCollectionEntry[]
}

/**
 * Fetch with a timeout so a slow/unavailable backend endpoint doesn't
 * hang the sitemap build for 60s. Returns null on timeout or error.
 */
async function fetchWithTimeout(url: string, timeoutMs = 25000): Promise<Response | null> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const res = await fetch(url, {
      next: { revalidate },
      signal: controller.signal,
    })
    clearTimeout(timer)
    return res
  } catch {
    clearTimeout(timer)
    return null
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [storesRes, productsRes, collectionsRes] = await Promise.all([
    fetchWithTimeout(`${API_BASE}/sitemap/stores`),
    fetchWithTimeout(`${API_BASE}/sitemap/products`),
    fetchWithTimeout(`${API_BASE}/sitemap/store-collections`),
  ])

  const storeUsernames: string[] =
    storesRes?.ok
      ? ((await storesRes.json()) as SitemapStoresResponse).usernames ?? []
      : []

  const rawProductsJson: unknown = productsRes?.ok ? await productsRes.json() : null

  // Backward compat: handle both old format { ids: string[] } and new format { products: [{id, slug}] }
  let sitemapProducts: SitemapProductEntry[] = []
  if (rawProductsJson && typeof rawProductsJson === 'object') {
    const json = rawProductsJson as Record<string, unknown>
    if (Array.isArray(json.products)) {
      // New format — slug URLs
      sitemapProducts = json.products as SitemapProductEntry[]
    } else if (Array.isArray(json.ids)) {
      // Old format — bare-ID URLs (sigma-ktor not yet deployed with new endpoint)
      // Use bare ID as slug so the URL is /product/{id} (no double-id issue)
      sitemapProducts = (json.ids as string[]).map((id) => ({ id, slug: '' }))
    }
  }

  const sitemapCollections: SitemapCollectionEntry[] =
    collectionsRes?.ok
      ? ((await collectionsRes.json()) as SitemapCollectionsResponse).collections ?? []
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
    // Category landing pages — high priority, these are the organic traffic
    // entry points for category-level queries ("D2C fashion brands India" etc.)
    {
      url: `${SITE_URL}/category/fashion`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/category/footwear`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/category/electronics`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/category/cosmetics`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/category/accessories`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.9,
    },
  ]

  // Store profile pages — highest priority after homepage.
  const storeEntries: MetadataRoute.Sitemap = storeUsernames.map((username) => ({
    url: `${SITE_URL}/store/${username}`,
    lastModified: now,
    changeFrequency: 'daily' as const,
    priority: 0.9,
  }))

  // Product pages — slug format when available, bare-ID fallback
  const productEntries: MetadataRoute.Sitemap = sitemapProducts.map(({ id, slug }) => ({
    url: slug ? `${SITE_URL}/product/${slug}-${id}` : `${SITE_URL}/product/${id}`,
    lastModified: now,
    changeFrequency: 'daily' as const,
    priority: 0.7,
  }))

  // Store collection pages — individual collections within a store
  // "Women Jackets Bonkers Corner", "Men Sneakers XYZ Brand" etc.
  const collectionEntries: MetadataRoute.Sitemap = sitemapCollections.map(
    ({ storeUsername, categoryId }) => ({
      url: `${SITE_URL}/store/${storeUsername}/collection/${categoryId}`,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }),
  )

  // Taxonomy product pages — all 96 nodes from master_taxonomy.json
  // These are static routes that never change unless the taxonomy is updated.
  // Leaf nodes (exact category) get higher priority than intermediate nodes.
  const taxonomyEntries: MetadataRoute.Sitemap = ALL_TAXONOMY_PATHS.map((path) => ({
    url: `${SITE_URL}/category/${path}`,
    lastModified: now,
    changeFrequency: 'weekly' as const,
    // Leaf nodes (3+ path segments) are more specific → higher priority
    priority: path.split('/').length >= 3 ? 0.85 : 0.75,
  }))

  return [...staticEntries, ...storeEntries, ...productEntries, ...collectionEntries, ...taxonomyEntries]
}
