/**
 * Metadata helpers — builds Next.js Metadata objects for SEO-critical pages.
 *
 * Requirements: 9.13, 10.13, 21.1, 21.5, 21.6, 21.7
 */

import type { Metadata } from 'next'

const SITE_URL = 'https://downxtown.com'
const SITE_NAME = 'Downxtown'
const API_BASE = 'https://api.downxtown.com'

// OG banner dimensions — used by Google and social crawlers for rich previews.
// These match the recommended 1200×630 aspect ratio for link previews.
const OG_IMAGE_WIDTH = 1200
const OG_IMAGE_HEIGHT = 630

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
 * Uses og:type = "profile" (the correct Open Graph type for profile pages,
 * same as what Instagram uses) with profile:username for entity disambiguation.
 * Includes explicit OG image dimensions so Google renders the rich preview.
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
      ? `Shop at ${storeName} on Downxtown. Based in ${city}.${averageRating ? ` Rated ${averageRating.toFixed(1)} ★` : ''}`
      : `Shop at ${storeName} on Downxtown.${averageRating ? ` Rated ${averageRating.toFixed(1)} ★` : ''}`)

  // Prefer banner for OG image (wider aspect ratio), fall back to logo
  const ogImageId = bannerImageId ?? logoImageId
  const ogImageUrl = ogImageId
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
    // og:type = "profile" tells Google/Facebook this is a profile page,
    // which triggers the richer entity card appearance in search results.
    openGraph: {
      type: 'profile',
      url: pageUrl,
      siteName: SITE_NAME,
      title,
      description: metaDescription,
      // profile:username is the Open Graph field that links the page to a
      // named entity — equivalent to what Instagram sets on every profile.
      username: storeUsername,
      ...(ogImageUrl
        ? {
            images: [
              {
                url: ogImageUrl,
                width: OG_IMAGE_WIDTH,
                height: OG_IMAGE_HEIGHT,
                alt: `${storeName} — Downxtown store`,
              },
            ],
          }
        : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: metaDescription,
      ...(ogImageUrl ? { images: [ogImageUrl] } : {}),
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
  } = input

  const pageUrl = `${SITE_URL}/product/${productId}`
  const title = storeName
    ? `${productName} — ${storeName} | ${SITE_NAME}`
    : `${productName} | ${SITE_NAME}`

  const priceText =
    sellingPrice !== undefined
      ? ` ₹${sellingPrice}${mrp && mrp > sellingPrice ? ` (MRP ₹${mrp})` : ''}.`
      : ''

  const metaDescription =
    description ??
    `Buy ${productName}${storeName ? ` from ${storeName}` : ''} on Downxtown.${priceText}`

  const ogImageUrl = mainImageId
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
      ...(ogImageUrl
        ? {
            images: [
              {
                url: ogImageUrl,
                width: OG_IMAGE_WIDTH,
                height: OG_IMAGE_HEIGHT,
                alt: productName,
              },
            ],
          }
        : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: metaDescription,
      ...(ogImageUrl ? { images: [ogImageUrl] } : {}),
    },
  }
}
