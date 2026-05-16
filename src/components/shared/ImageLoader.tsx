'use client'

/**
 * ImageLoader — thin re-export of the ImageLoader component from lib/image/imageLoader.
 *
 * The full implementation (shimmer placeholder, 2-retry branded fallback,
 * lazy loading, connection-quality downgrade) lives in:
 *   @/lib/image/imageLoader
 *
 * Requirements: 6.3, 6.4, 6.8, 23.1
 */

export { ImageLoader } from '@/lib/image/imageLoader'
export type { ImageLoaderProps2 as ImageLoaderProps } from '@/lib/image/imageLoader'
