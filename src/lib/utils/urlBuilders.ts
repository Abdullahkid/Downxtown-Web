/**
 * URL builders and formatters for the Downxtown Web Buyer App.
 *
 * Requirements: 10.14, 9.13, 21.5
 */

// ---------------------------------------------------------------------------
// Product URL helpers
// ---------------------------------------------------------------------------

/**
 * Builds the canonical SEO-friendly product page URL.
 *
 * When a slugBase is provided (shopifyHandle for Shopify products, or a
 * title-derived slug for direct uploads), the URL becomes:
 *   /product/{slugBase}-{productId}
 *   e.g. /product/rockstar-stitch-oversized-t-shirt-695d5897429a7676c733204c
 *
 * The full slugBase is used as-is — no truncation — so the URL exactly matches
 * what the backend sitemap builder emits and what the page component serves.
 * This prevents canonical tag mismatches that cause Google Search Console to
 * report "Alternate page with proper canonical tag".
 *
 * When no slugBase is provided (legacy fallback), the URL is:
 *   /product/{productId}
 *
 * The ObjectId is always embedded as a suffix so the page component can
 * extract it with a simple `slug.slice(-24)` — no new backend endpoint needed.
 *
 * @param productId  - The 24-char MongoDB ObjectId hex string.
 * @param slugBase   - Optional human-readable slug prefix (shopifyHandle or title slug).
 * @returns A path string.
 *
 * Requirements: 10.14
 */
export function buildProductUrl(productId: string, slugBase?: string | null): string {
  if (slugBase?.trim()) {
    return `/product/${slugBase.trim()}-${productId}`
  }
  return `/product/${productId}`
}

/**
 * Extracts the productId from a product URL.
 *
 * Handles both URL formats:
 *  - SEO slug format: `/product/{slug}-{24-hex-objectId}`  → returns the 24-char ObjectId
 *  - Legacy format:   `/product/{productId}`               → returns the full segment
 *
 * Accepts both relative paths and full URLs.
 *
 * @param url - A relative path or absolute URL containing a product segment.
 * @returns The productId (24-char ObjectId) string, or `null` if no match.
 *
 * Requirements: 10.14
 */
export function parseProductId(url: string): string | null {
  // Normalise: strip query string and fragment, then extract the pathname.
  let pathname: string
  try {
    const parsed = new URL(url, 'https://placeholder.invalid')
    pathname = parsed.pathname
  } catch {
    pathname = url
  }

  // Match /product/{slug} — slug is everything after the last /product/ segment.
  const match = pathname.match(/\/product\/([^/?#]+)/)
  if (!match) return null

  const segment = match[1]
  if (!segment) return null

  // If the segment ends with a 24-char lowercase hex ObjectId (slug-{id} format),
  // extract just the ObjectId. Otherwise return the whole segment (legacy format).
  const objectIdPattern = /[a-f0-9]{24}$/
  const objectIdMatch = segment.match(objectIdPattern)
  if (objectIdMatch) {
    return objectIdMatch[0]
  }

  // Legacy: the whole segment is the productId
  return segment.length > 0 ? segment : null
}

// ---------------------------------------------------------------------------
// Store URL helpers
// ---------------------------------------------------------------------------

/**
 * Builds the canonical store profile URL.
 *
 * @param storeUsername - The store's unique username (e.g. `"myshop"`).
 * @returns A path string of the form `/store/{storeUsername}`.
 *
 * Requirements: 9.13
 */
export function buildStoreUrl(storeUsername: string): string {
  return `/store/${storeUsername}`
}

// ---------------------------------------------------------------------------
// Price formatter
// ---------------------------------------------------------------------------

/**
 * Formats a price in Indian Rupees to a human-readable INR string
 * using the Indian numbering system.
 *
 * @example
 * formatPrice(1299)   // "₹1,299"
 * formatPrice(0)      // "₹0"
 *
 * @param rupees - The price in rupees (integer, non-negative). Backend sends prices in rupees directly.
 * @returns A formatted string such as `"₹1,299"`.
 *
 * Requirements: 21.5
 */
export function formatPrice(rupees: number): string {
  // Backend sends prices in rupees directly (not paise)
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(rupees)
}

// ---------------------------------------------------------------------------
// Date formatter
// ---------------------------------------------------------------------------

/**
 * Formats a Unix millisecond timestamp to a human-readable date string
 * using the Indian locale.
 *
 * @example
 * formatDate(1700000000000) // e.g. "14 Nov 2023"
 *
 * @param timestamp - Unix timestamp in milliseconds.
 * @returns A locale-formatted date string.
 *
 * Requirements: 21.5
 */
export function formatDate(timestamp: number): string {
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(timestamp))
}
