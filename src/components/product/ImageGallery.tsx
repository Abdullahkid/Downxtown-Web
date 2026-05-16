'use client'

/**
 * ImageGallery — swipeable horizontal image gallery for the Product Page.
 *
 * - Sourced from the selected variant's imageGroupId → ImageGroup.images
 * - CSS scroll-snap for swipe behaviour (no external library needed)
 * - Thumbnail strip below the main image
 * - Updates automatically when `imageGroup` prop changes (variant switch)
 *
 * Requirements: 10.1, 10.2
 */

import React, { useRef, useState, useEffect, useCallback } from 'react'
import { ImageLoader } from '@/components/shared/ImageLoader'
import type { ImageGroup } from '@/types/product'

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface ImageGalleryProps {
  /** The ImageGroup for the currently selected variant. */
  imageGroup: ImageGroup | null
  /** Product name — used for alt text. */
  productName: string
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * Renders a full-width swipeable gallery with a thumbnail strip.
 *
 * Accessibility:
 *  - role="region" + aria-label on the gallery container
 *  - Each slide has a descriptive aria-label
 *  - Thumbnail buttons have aria-label and aria-pressed
 *  - Keyboard: left/right arrow keys navigate slides
 */
export function ImageGallery({ imageGroup, productName }: ImageGalleryProps) {
  const images = imageGroup?.images ?? []
  const [activeIndex, setActiveIndex] = useState(0)
  const scrollRef = useRef<HTMLDivElement>(null)

  // Reset to first image when the imageGroup changes (variant switch)
  useEffect(() => {
    setActiveIndex(0)
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ left: 0, behavior: 'instant' })
    }
  }, [imageGroup?.id])

  // Scroll the main gallery to the given index
  const scrollToIndex = useCallback((index: number) => {
    const container = scrollRef.current
    if (!container) return
    const slideWidth = container.offsetWidth
    container.scrollTo({ left: slideWidth * index, behavior: 'smooth' })
    setActiveIndex(index)
  }, [])

  // Sync activeIndex when the user swipes manually
  const handleScroll = useCallback(() => {
    const container = scrollRef.current
    if (!container) return
    const slideWidth = container.offsetWidth
    if (slideWidth === 0) return
    const newIndex = Math.round(container.scrollLeft / slideWidth)
    setActiveIndex(newIndex)
  }, [])

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault()
        scrollToIndex(Math.max(0, activeIndex - 1))
      } else if (e.key === 'ArrowRight') {
        e.preventDefault()
        scrollToIndex(Math.min(images.length - 1, activeIndex + 1))
      }
    },
    [activeIndex, images.length, scrollToIndex],
  )

  if (images.length === 0) {
    return (
      <div
        className="w-full aspect-square bg-gray-100 flex items-center justify-center rounded-xl"
        role="img"
        aria-label={`${productName} — no images available`}
      >
        <span className="text-gray-400 text-sm">No images</span>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {/* ------------------------------------------------------------------ */}
      {/* Main swipeable gallery                                              */}
      {/* ------------------------------------------------------------------ */}
      <div
        role="region"
        aria-label={`${productName} image gallery`}
        aria-roledescription="carousel"
        onKeyDown={handleKeyDown}
        tabIndex={0}
        className="relative w-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-xl"
      >
        {/* Slide container */}
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className={[
            'flex overflow-x-auto snap-x snap-mandatory',
            'scrollbar-hide rounded-xl',
            /* Prevent layout shift by reserving aspect ratio */
            'aspect-square',
          ].join(' ')}
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          aria-live="polite"
          aria-atomic="true"
        >
          {images.map((imageId, idx) => (
            <div
              key={imageId}
              className="flex-none w-full snap-center"
              role="group"
              aria-roledescription="slide"
              aria-label={`Image ${idx + 1} of ${images.length}`}
              aria-hidden={idx !== activeIndex}
            >
              <ImageLoader
                imageId={imageId}
                endpoint="detail"
                alt={`${productName} — image ${idx + 1}`}
                fill
                className="w-full h-full"
                priority={idx === 0}
                imageContext="product"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
          ))}
        </div>

        {/* Slide counter badge */}
        {images.length > 1 && (
          <div
            className="absolute bottom-3 right-3 bg-black/50 text-white text-xs font-medium px-2 py-0.5 rounded-full pointer-events-none"
            aria-hidden="true"
          >
            {activeIndex + 1} / {images.length}
          </div>
        )}
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Thumbnail strip                                                     */}
      {/* ------------------------------------------------------------------ */}
      {images.length > 1 && (
        <div
          className="flex gap-2 overflow-x-auto pb-1"
          role="tablist"
          aria-label="Image thumbnails"
          style={{ scrollbarWidth: 'none' }}
        >
          {images.map((imageId, idx) => (
            <button
              key={imageId}
              type="button"
              role="tab"
              aria-selected={idx === activeIndex}
              aria-label={`View image ${idx + 1}`}
              onClick={() => scrollToIndex(idx)}
              className={[
                'flex-none w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors',
                'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500',
                idx === activeIndex
                  ? 'border-blue-600'
                  : 'border-transparent hover:border-gray-300',
              ].join(' ')}
            >
              <ImageLoader
                imageId={imageId}
                endpoint="preview"
                alt={`${productName} thumbnail ${idx + 1}`}
                width={64}
                height={64}
                imageContext="product"
                sizes="64px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
