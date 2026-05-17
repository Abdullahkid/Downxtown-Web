'use client'

/**
 * Image Loader — custom Next.js loader and ImageLoader React component.
 * Pure URL utilities are in imageUrls.ts (server-safe).
 *
 * Requirements: 6.1, 6.2, 6.3, 6.4, 6.6, 6.7, 6.8, 22.5
 */

import React, { useState, useCallback } from 'react'
import NextImage, { ImageLoaderProps } from 'next/image'
import type { ImageEndpoint } from '@/types/product'
import {
  buildImageUrl,
  resolveImageUrl,
  ENDPOINT_MAP,
} from './imageUrls'

// Re-export for backwards compatibility with existing imports
export { buildImageUrl, resolveImageUrl, parseImageId, ENDPOINT_MAP } from './imageUrls'

// ---------------------------------------------------------------------------
// Custom Next.js loader (for api.downxtown.com images only)
// ---------------------------------------------------------------------------

/**
 * Custom loader for images served from api.downxtown.com.
 * The server handles all sizing/optimization, so we ignore Next.js's width hint
 * but must include it in the signature to satisfy the interface.
 */
function downxtownLoader({ src, width }: ImageLoaderProps): string {
  // width is intentionally unused — the server endpoint handles sizing
  void width
  return src
}

/** Returns true if the URL is an external image (not from our API) */
function isExternalUrl(url: string): boolean {
  return (url.startsWith('http://') || url.startsWith('https://')) &&
    !url.startsWith('https://api.downxtown.com')
}

// ---------------------------------------------------------------------------
// Shimmer placeholder
// ---------------------------------------------------------------------------

/**
 * Generates a base64-encoded SVG shimmer placeholder.
 * Used as the `blurDataURL` for Next.js <Image> while the real image loads.
 *
 * Req 6.4 — shimmer placeholder while loading.
 */
function shimmerBase64(width: number, height: number): string {
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"   stop-color="#e5e7eb" stop-opacity="1"/>
          <stop offset="50%"  stop-color="#f3f4f6" stop-opacity="1"/>
          <stop offset="100%" stop-color="#e5e7eb" stop-opacity="1"/>
          <animateTransform
            attributeName="gradientTransform"
            type="translate"
            from="-1 0" to="1 0"
            dur="1.2s"
            repeatCount="indefinite"
          />
        </linearGradient>
      </defs>
      <rect width="${width}" height="${height}" fill="url(#g)"/>
    </svg>`
  const encoded = Buffer.from(svg.trim()).toString('base64')
  return `data:image/svg+xml;base64,${encoded}`
}

// ---------------------------------------------------------------------------
// Connection-quality detection
// ---------------------------------------------------------------------------

/**
 * Returns true when the browser reports a 2G or slow-2G connection.
 * Req 6.6 — downgrade to preview quality on poor connections.
 */
function isSlowConnection(): boolean {
  if (typeof navigator === 'undefined') return false
  // navigator.connection is a non-standard API; cast via unknown for safety
  const conn = (navigator as unknown as { connection?: { effectiveType?: string } }).connection
  const type = conn?.effectiveType
  return type === '2g' || type === 'slow-2g'
}

// ---------------------------------------------------------------------------
// Branded fallback
// ---------------------------------------------------------------------------

/** Context-appropriate fallback icon rendered after 2 failed load attempts. */
type ImageContext = 'product' | 'store' | 'banner' | 'generic'

function FallbackPlaceholder({
  context,
  className,
}: {
  context: ImageContext
  className?: string
}): React.ReactElement {
  const label =
    context === 'product' ? 'Product image unavailable'
    : context === 'store'   ? 'Store logo unavailable'
    : context === 'banner'  ? 'Banner unavailable'
    :                         'Image unavailable'

  return (
    <div
      role="img"
      aria-label={label}
      className={[
        'flex flex-col items-center justify-center gap-1',
        'bg-gray-100 text-gray-400 select-none',
        className ?? '',
      ].join(' ')}
    >
      {/* Simple branded SVG icon */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-8 h-8 opacity-40"
        aria-hidden="true"
      >
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <polyline points="21 15 16 10 5 21" />
      </svg>
      <span className="text-xs font-medium opacity-60">Downxtown</span>
    </div>
  )
}

// ---------------------------------------------------------------------------
// ImageLoader component
// ---------------------------------------------------------------------------

export interface ImageLoaderProps2 {
  /** Raw imageId (not a full URL). */
  imageId: string
  /** Which server endpoint to use. */
  endpoint: ImageEndpoint
  /** Accessible alt text. Req 23.1 */
  alt: string
  /** Additional Tailwind / CSS classes applied to the wrapper div. */
  className?: string
  /**
   * Disables lazy loading for LCP images (e.g. hero images above the fold).
   * Req 6.3 — lazy loading via Intersection Observer (Next.js handles this).
   */
  priority?: boolean
  /**
   * Hint for the fallback icon context.
   * Defaults to 'generic'.
   */
  imageContext?: ImageContext
  /** Width in pixels (required by Next.js Image for layout). */
  width?: number
  /** Height in pixels (required by Next.js Image for layout). */
  height?: number
  /** fill mode — use when the parent container controls dimensions. */
  fill?: boolean
  /** sizes attribute for responsive images. Req 22.5 */
  sizes?: string
  /** CSS object-fit value. Defaults to 'cover'. Use 'contain' for logos/profile pics (like ContentScale.Fit in Compose). */
  objectFit?: 'cover' | 'contain' | 'fill' | 'scale-down' | 'none'
}

/**
 * ImageLoader — wraps Next.js <Image> with:
 *  - Custom loader pointing to api.downxtown.com
 *  - Shimmer CSS animation placeholder while loading  (Req 6.4)
 *  - Connection-quality downgrade: detail → preview on 2G/slow-2G  (Req 6.6)
 *  - Branded fallback div after 2 failed load attempts  (Req 6.8)
 *  - Lazy loading by default via Next.js Intersection Observer  (Req 6.3)
 *  - Responsive srcset/sizes support  (Req 22.5)
 *  - Descriptive alt text forwarded to <img>  (Req 23.1)
 */
export function ImageLoader({
  imageId,
  endpoint,
  alt,
  className,
  priority = false,
  imageContext = 'generic',
  width,
  height,
  fill = false,
  sizes,
  objectFit = 'cover',
}: ImageLoaderProps2): React.ReactElement {
  const [retryCount, setRetryCount] = useState(0)
  const [failed, setFailed] = useState(false)

  // Resolve the src — handles both raw imageIds and full external URLs
  const effectiveEndpoint: ImageEndpoint =
    endpoint === 'detail' && isSlowConnection() ? 'preview' : endpoint

  const src = resolveImageUrl(imageId, effectiveEndpoint)

  const handleError = useCallback(() => {
    if (retryCount < 2) {
      // Force a re-render to retry (Next.js Image will re-attempt on key change)
      setRetryCount((c) => c + 1)
    } else {
      // Req 6.8 — show branded fallback after 2 retries
      setFailed(true)
    }
  }, [retryCount])

  if (failed) {
    return (
      <FallbackPlaceholder
        context={imageContext}
        className={className}
      />
    )
  }

  const shimmer = shimmerBase64(width ?? 400, height ?? 400)
  const isExternal = isExternalUrl(src)

  // key must be passed directly to JSX, not inside a spread object
  const retryKey = retryCount

  const commonProps = {
    src,
    alt,
    placeholder: 'blur' as const,
    blurDataURL: shimmer,
    priority,
    onError: handleError,
    sizes: sizes ?? '(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw',
    ...(isExternal
      ? { unoptimized: true }
      : { loader: downxtownLoader }),
  }

  if (fill) {
    return (
      <div className={['relative overflow-hidden w-full h-full', className ?? ''].join(' ')}>
        <NextImage
          key={retryKey}
          {...commonProps}
          fill
          style={{ objectFit }}
        />
      </div>
    )
  }

  return (
    <NextImage
      key={retryKey}
      {...commonProps}
      width={width ?? 400}
      height={height ?? 400}
      className={className}
      style={{ objectFit }}
    />
  )
}
