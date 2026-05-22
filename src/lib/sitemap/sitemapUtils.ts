/**
 * Shared utilities for the split sitemap system.
 * All sitemap sub-routes import from here.
 */

export const SITE_URL = 'https://downxtown.com'
export const API_BASE = 'https://api.downxtown.com'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface SitemapProductEntry {
  id: string
  slug: string
}

export interface SitemapStoreEntry {
  username: string
}

export interface SitemapCollectionEntry {
  storeUsername: string
  categoryId: string
}

// ---------------------------------------------------------------------------
// Fetch with timeout — prevents sitemap builds hanging on slow endpoints
// ---------------------------------------------------------------------------

export async function fetchWithTimeout(
  url: string,
  timeoutMs = 15000,
): Promise<Response | null> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const res = await fetch(url, {
      next: { revalidate: 3600 },
      signal: controller.signal,
    })
    clearTimeout(timer)
    return res
  } catch {
    clearTimeout(timer)
    return null
  }
}

// ---------------------------------------------------------------------------
// Data fetchers
// ---------------------------------------------------------------------------

export async function fetchStoreUsernames(): Promise<string[]> {
  const res = await fetchWithTimeout(`${API_BASE}/sitemap/stores`)
  if (!res?.ok) return []
  const json = await res.json() as { usernames?: string[] }
  return json.usernames ?? []
}

export async function fetchStoreProducts(
  storeUsername: string,
): Promise<SitemapProductEntry[]> {
  const res = await fetchWithTimeout(
    `${API_BASE}/sitemap/store-products/${storeUsername}`,
  )
  if (!res?.ok) return []
  const json = await res.json() as { products?: SitemapProductEntry[] }
  return json.products ?? []
}

export async function fetchCollections(): Promise<SitemapCollectionEntry[]> {
  const res = await fetchWithTimeout(`${API_BASE}/sitemap/store-collections`)
  if (!res?.ok) return []
  const json = await res.json() as { collections?: SitemapCollectionEntry[] }
  return json.collections ?? []
}

// ---------------------------------------------------------------------------
// URL builder — consistent with the product page's truncateSlug logic
// ---------------------------------------------------------------------------

export function buildProductSitemapUrl(id: string, slug: string): string {
  return slug
    ? `${SITE_URL}/product/${slug}-${id}`
    : `${SITE_URL}/product/${id}`
}
