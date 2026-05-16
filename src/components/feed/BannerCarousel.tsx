'use client'

/**
 * BannerCarousel — auto-scrolling featured banner carousel.
 *
 * Features:
 *  - Auto-scrolls every 4 seconds (Req 7.5)
 *  - Tap navigates by targetType: store → /store/{id}, product → /product/{id},
 *    subcategory → /search?subcategory={id}, URL → external link
 *  - Dot indicators show current slide
 *  - Pauses auto-scroll on hover / touch
 *  - Cleans up interval on unmount
 *
 * Requirements: 7.5
 */

import React, { useRef, useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { ImageLoader } from '@/components/shared'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type BannerTargetType = 'store' | 'product' | 'subcategory' | 'url'

export interface Banner {
  id: string
  /** imageId for the banner image */
  imageId: string
  title?: string
  targetType: BannerTargetType
  /** The target identifier: storeUsername, productId, subcategoryId, or full URL */
  targetId: string
}

interface BannerCarouselProps {
  banners: Banner[]
  /** Auto-scroll interval in ms. Defaults to 4000. */
  intervalMs?: number
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function BannerCarousel({ banners, intervalMs = 4000 }: BannerCarouselProps) {
  const router = useRouter()
  const [activeIndex, setActiveIndex] = useState(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const isPausedRef = useRef(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // -------------------------------------------------------------------------
  // Auto-scroll logic (Req 7.5)
  // -------------------------------------------------------------------------
  const startAutoScroll = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    if (banners.length <= 1) return

    intervalRef.current = setInterval(() => {
      if (!isPausedRef.current) {
        setActiveIndex((prev) => (prev + 1) % banners.length)
      }
    }, intervalMs)
  }, [banners.length, intervalMs])

  useEffect(() => {
    startAutoScroll()
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [startAutoScroll])

  // Scroll the container to the active slide
  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    const slideWidth = container.offsetWidth
    container.scrollTo({ left: slideWidth * activeIndex, behavior: 'smooth' })
  }, [activeIndex])

  // -------------------------------------------------------------------------
  // Pause on hover / touch
  // -------------------------------------------------------------------------
  const handleMouseEnter = useCallback(() => {
    isPausedRef.current = true
  }, [])

  const handleMouseLeave = useCallback(() => {
    isPausedRef.current = false
  }, [])

  const handleTouchStart = useCallback(() => {
    isPausedRef.current = true
  }, [])

  const handleTouchEnd = useCallback(() => {
    isPausedRef.current = false
  }, [])

  // -------------------------------------------------------------------------
  // Tap navigation (Req 7.5)
  // -------------------------------------------------------------------------
  const handleBannerTap = useCallback(
    (banner: Banner) => {
      switch (banner.targetType) {
        case 'store':
          router.push(`/store/${banner.targetId}`)
          break
        case 'product':
          router.push(`/product/${banner.targetId}`)
          break
        case 'subcategory':
          router.push(`/search?subcategory=${encodeURIComponent(banner.targetId)}`)
          break
        case 'url':
          // External URL — open in new tab safely
          window.open(banner.targetId, '_blank', 'noopener,noreferrer')
          break
      }
    },
    [router],
  )

  // -------------------------------------------------------------------------
  // Dot navigation
  // -------------------------------------------------------------------------
  const handleDotClick = useCallback(
    (index: number) => {
      setActiveIndex(index)
      // Restart auto-scroll timer after manual navigation
      startAutoScroll()
    },
    [startAutoScroll],
  )

  if (banners.length === 0) return null

  return (
    <div
      className="relative w-full"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      role="region"
      aria-label="Featured banners"
      aria-roledescription="carousel"
    >
      {/* Slides container */}
      <div
        ref={containerRef}
        className={[
          'flex overflow-x-hidden',
          'rounded-2xl',
          // Prevent scroll snapping from interfering with programmatic scroll
          'scroll-smooth',
        ].join(' ')}
        aria-live="polite"
      >
        {banners.map((banner, index) => (
          <button
            key={banner.id}
            type="button"
            aria-label={banner.title ?? `Banner ${index + 1}`}
            aria-current={index === activeIndex ? 'true' : undefined}
            className={[
              'flex-shrink-0 w-full relative',
              'aspect-[16/7] overflow-hidden rounded-2xl',
              'focus-visible:outline focus-visible:outline-2',
              'focus-visible:outline-offset-2 focus-visible:outline-blue-600',
            ].join(' ')}
            onClick={() => handleBannerTap(banner)}
          >
            <ImageLoader
              imageId={banner.imageId}
              endpoint="banner"
              alt={banner.title ?? `Featured banner ${index + 1}`}
              fill
              priority={index === 0}
              imageContext="banner"
              sizes="(max-width: 768px) 100vw, (max-width: 1280px) 80vw, 1200px"
            />
          </button>
        ))}
      </div>

      {/* Dot indicators */}
      {banners.length > 1 && (
        <div
          className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex gap-1.5"
          role="tablist"
          aria-label="Banner navigation"
        >
          {banners.map((_, index) => (
            <button
              key={index}
              type="button"
              role="tab"
              aria-selected={index === activeIndex}
              aria-label={`Go to banner ${index + 1}`}
              onClick={() => handleDotClick(index)}
              className={[
                'rounded-full transition-all duration-300',
                'focus-visible:outline focus-visible:outline-2',
                'focus-visible:outline-offset-2 focus-visible:outline-white',
                index === activeIndex
                  ? 'w-5 h-2 bg-white'
                  : 'w-2 h-2 bg-white/50 hover:bg-white/75',
              ].join(' ')}
            />
          ))}
        </div>
      )}
    </div>
  )
}
