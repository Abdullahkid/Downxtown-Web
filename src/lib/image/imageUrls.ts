/**
 * Pure image URL utilities — server-safe (no 'use client').
 * Can be imported in both Server Components and Client Components.
 *
 * Requirements: 6.1, 6.7
 */

import type { ImageEndpoint } from '@/types/product'

const BASE_URL = 'https://api.downxtown.com'

export const ENDPOINT_MAP: Record<ImageEndpoint, string> = {
  preview:    '/get-preview-image',
  detail:     '/get-detail-image',
  fullscreen: '/get-fullscreen-image',
  banner:     '/get-banner-image',
  display:    '/get-display-image',
  original:   '/get-original-image',
}

/**
 * Builds a full image URL for the given endpoint and imageId.
 * Safe to use in Server Components.
 */
export function buildImageUrl(endpoint: ImageEndpoint, imageId: string): string {
  return `${BASE_URL}${ENDPOINT_MAP[endpoint]}/${imageId}`
}

/**
 * Resolves a mainImageUrl field — handles both raw imageIds and full external URLs.
 * Safe to use in Server Components.
 */
export function resolveImageUrl(
  imageIdOrUrl: string,
  endpoint: ImageEndpoint = 'preview'
): string {
  if (imageIdOrUrl.startsWith('http://') || imageIdOrUrl.startsWith('https://')) {
    return imageIdOrUrl
  }
  return buildImageUrl(endpoint, imageIdOrUrl)
}

/**
 * Extracts the imageId from a full image URL.
 * Safe to use in Server Components.
 */
export function parseImageId(url: string): string | null {
  try {
    const { pathname } = new URL(url)
    const segments = pathname.split('/').filter(Boolean)
    const last = segments[segments.length - 1]
    return last != null ? decodeURIComponent(last) : null
  } catch {
    return null
  }
}
