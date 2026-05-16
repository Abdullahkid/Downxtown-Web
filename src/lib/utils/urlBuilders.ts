/**
 * URL builders and formatters for the DownXtown Web Buyer App.
 *
 * Requirements: 10.14, 9.13, 21.5
 */

// ---------------------------------------------------------------------------
// Product URL helpers
// ---------------------------------------------------------------------------

/**
 * Builds the canonical product page URL.
 *
 * @param productId - The server-side product identifier.
 * @returns A path string of the form `/product/{productId}`.
 *
 * Requirements: 10.14
 */
export function buildProductUrl(productId: string): string {
  return `/product/${productId}`
}

/**
 * Extracts the productId from a product URL.
 *
 * Accepts both relative paths (`/product/{productId}`) and full URLs
 * (`https://example.com/product/{productId}`).
 *
 * @param url - A relative path or absolute URL containing a product segment.
 * @returns The productId string, or `null` if the URL does not match the
 *          expected pattern.
 *
 * Requirements: 10.14
 */
export function parseProductId(url: string): string | null {
  // Normalise: strip query string and fragment, then extract the pathname.
  let pathname: string
  try {
    // If it is a full URL, the URL constructor will parse it correctly.
    const parsed = new URL(url, 'https://placeholder.invalid')
    pathname = parsed.pathname
  } catch {
    pathname = url
  }

  // Match /product/{productId} — productId is everything after the last slash.
  const match = pathname.match(/\/product\/([^/?#]+)/)
  if (!match) return null

  const productId = match[1]
  return productId.length > 0 ? productId : null
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
 * Formats a price expressed in paise (1/100 of an Indian Rupee) to a
 * human-readable INR string using the Indian numbering system.
 *
 * @example
 * formatPrice(129900) // "₹1,299"
 * formatPrice(0)      // "₹0"
 *
 * @param paise - The price in paise (integer, non-negative).
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
