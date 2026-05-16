/**
 * Metadata helpers — builds Next.js Metadata objects for SEO-critical pages.
 *
 * Requirements: 9.13, 10.13, 21.1, 21.5, 21.6, 21.7
 */

import type { Metadata } from 'next'

const SITE_URL = 'https://downxtown.com'
const SITE_NAME = 'DownXtown'
const API_BASE = 'https://api.downxtown.com'

// ---------------------------------------------------------------------------
// Store metadata
// ---------------------------------------------------------------------------

export interface StoreMetadataInput {
  storeName: string
  storeUsername: string
  description?: string
  /** imageId for the store logo */
  logoImageId?: string
  /** imageId for the store banner */
  bannerImageId?: string
  averageRating?: number
  city?: string
}

/**
 * Builds a Next.js `Metadata` object for a Store Profile page.
 *
 * Includes:
 *  - title / description
 *  - Open Graph tags (og:title, og:description, og:image, og:url, og:type)
 *  - Twitter card tags
 *  - Canonical URL
 *  - robots: index, follow
 *
 * Requirements: 9.13, 21.1, 21.5, 21.6, 21.7
 */
export function buildStoreMetadata(input: StoreMetadataInput): Metadata {
  const {
    storeName,
    storeUsername,
    description,
    logoImageId,
    bannerImageId,
    averageRating,
    city,
  } = input

  const pageUrl = `${SITE_URL}/store/${storeUsername}`
  const title = `${storeName} (@${storeUsername}) — ${SITE_NAME}`
  const metaDescription =
    description ??
    (city
      ? `Shop at ${storeName} on DownXtown. Based in ${city}.${averageRating ? ` Rated ${averageRating.toFixed(1)} ★` : ''}`
      : `Shop at ${storeName} on DownXtown.${averageRating ? ` Rated ${averageRating.toFixed(1)} ★` : ''}`)

  // Prefer banner for OG image, fall back to logo
  const ogImageId = bannerImageId ?? logoImageId
  const ogImage = ogImageId
    ? `${API_BASE}/get-banner-image/${ogImageId}`
    : undefined

  return {
    title,
    description: metaDescription,
    alternates: {
      canonical: pageUrl,
    },
    robots: {
      index: true,
      follow: true,
    },
    openGraph: {
      type: 'website',
      url: pageUrl,
      siteName: SITE_NAME,
      title,
      description: metaDescription,
      ...(ogImage ? { images: [{ url: ogImage, alt: `${storeName} banner` }] } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: metaDescription,
      ...(ogImage ? { images: [ogImage] } : {}),
    },
  }
}

// ---------------------------------------------------------------------------
// Product metadata
// ---------------------------------------------------------------------------

export interface ProductMetadataInput {
  productId: string
  productName: string
  description?: string
  /** imageId for the main product image */
  mainImageId?: string
  sellingPrice?: number
  mrp?: number
  storeName?: string
  storeUsername?: string
}

/**
 * Builds a Next.js `Metadata` object for a Product Page.
 *
 * Requirements: 10.13, 21.1, 21.5, 21.6, 21.7
 */
export function buildProductMetadata(input: ProductMetadataInput): Metadata {
  const {
    productId,
    productName,
    description,
    mainImageId,
    sellingPrice,
    mrp,
    storeName,
    storeUsername,
  } = input

  const pageUrl = `${SITE_URL}/product/${productId}`
  const title = storeName
    ? `${productName} — ${storeName} | ${SITE_NAME}`
    : `${productName} | ${SITE_NAME}`

  const priceText =
    sellingPrice !== undefined
      ? ` ₹${Math.round(sellingPrice / 100)}${mrp && mrp > sellingPrice ? ` (MRP ₹${Math.round(mrp / 100)})` : ''}.`
      : ''

  const metaDescription =
    description ??
    `Buy ${productName}${storeName ? ` from ${storeName}` : ''} on DownXtown.${priceText}`

  const ogImage = mainImageId
    ? `${API_BASE}/get-detail-image/${mainImageId}`
    : undefined

  return {
    title,
    description: metaDescription,
    alternates: {
      canonical: pageUrl,
    },
    robots: {
      index: true,
      follow: true,
    },
    openGraph: {
      type: 'website',
      url: pageUrl,
      siteName: SITE_NAME,
      title,
      description: metaDescription,
      ...(ogImage ? { images: [{ url: ogImage, alt: productName }] } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: metaDescription,
      ...(ogImage ? { images: [ogImage] } : {}),
    },
  }
}
