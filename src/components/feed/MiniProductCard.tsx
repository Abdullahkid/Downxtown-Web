'use client'

/**
 * MiniProductCard - compact product card used inside FeedStoreCard's
 * horizontal scroll row.
 *
 * Uses <Link> instead of <button onClick={router.push}> so Next.js
 * prefetches the destination page when the card enters the viewport.
 * This makes navigation feel instant — the page is already in cache
 * before the user taps.
 *
 * Long-press still works: pointerDown starts a timer, pointerUp cancels it.
 * If a long-press fires, we call preventDefault() on the Link's click event
 * to block navigation and show the image overlay instead.
 */

import React, { useRef, useState, useCallback } from 'react'
import { X } from 'lucide-react'
import { ImageLoader } from '@/components/shared'
import { InstantLink } from '@/components/shared/InstantLink'
import { buildProductUrl } from '@/lib/utils/urlBuilders'
import type { MiniProduct } from '@/types/product'

interface MiniProductCardProps {
  product: MiniProduct
}

const INR_SYMBOL = '\u20B9'

export function MiniProductCard({ product }: MiniProductCardProps) {
  const [overlayVisible, setOverlayVisible] = useState(false)
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const didLongPress = useRef(false)

  const discountPct =
    product.mrp > 0
      ? Math.round(((product.mrp - product.sellingPrice) / product.mrp) * 100)
      : 0

  const handlePointerDown = useCallback(() => {
    didLongPress.current = false
    longPressTimer.current = setTimeout(() => {
      didLongPress.current = true
      setOverlayVisible(true)
    }, 500)
  }, [])

  const clearLongPressTimer = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current)
      longPressTimer.current = null
    }
  }, [])

  // If a long-press fired, block the Link navigation
  const handleClick = useCallback((e: React.MouseEvent) => {
    if (didLongPress.current) {
      e.preventDefault()
      didLongPress.current = false
    }
  }, [])

  const dismissOverlay = useCallback(() => {
    setOverlayVisible(false)
  }, [])

  return (
    <>
      <InstantLink
        href={buildProductUrl(product.id, product.shopifyHandle)}
        aria-label={`View ${product.name}`}
        className={[
          // Responsive width: ~45vw on mobile so 2 cards fit with a peek of the 3rd,
          // fixed 176px on md+ where the card is inside a wider container
          'flex-shrink-0 w-[45vw] md:w-[176px] rounded-[12px] overflow-hidden',
          'bg-surface border border-border',
          'text-left focus-visible:outline focus-visible:outline-2',
          'focus-visible:outline-offset-2 focus-visible:outline-brand',
          'hover:scale-[1.03] transition-transform select-none block',
        ].join(' ')}
        onClick={handleClick}
        onPointerDown={handlePointerDown}
        onPointerUp={clearLongPressTimer}
        onPointerLeave={clearLongPressTimer}
      >
        <div className="relative w-full h-[calc(45vw*1.1)] md:h-[190px] bg-bg-4 product-color-1 flex items-center justify-center overflow-hidden">
          <ImageLoader
            imageId={product.mainImageUrl}
            endpoint="detail"
            alt={product.name}
            fill
            imageContext="product"
            sizes="(max-width: 768px) 45vw, 176px"
          />
          {discountPct > 0 && (
            <span
              className={[
                'absolute top-1.5 right-1.5',
                'bg-black/60 backdrop-blur-[4px] text-[#4ade80] text-[10px] font-semibold tracking-wide',
                'px-[7px] py-[2px] rounded-[5px] leading-none',
              ].join(' ')}
              aria-label={`${discountPct}% off`}
            >
              {discountPct}% OFF
            </span>
          )}
        </div>

        <div className="pt-2.5 px-3 pb-3">
          <div className="flex items-baseline gap-[6px] flex-wrap">
            <span className="text-[15px] font-semibold text-text-1">
              {INR_SYMBOL}{product.sellingPrice.toLocaleString('en-IN')}
            </span>
            {product.mrp > product.sellingPrice && (
              <span className="text-[11px] text-text-3 line-through">
                {INR_SYMBOL}{product.mrp.toLocaleString('en-IN')}
              </span>
            )}
          </div>
          <p className="text-[12px] text-text-2 mt-1 leading-snug line-clamp-2 min-h-[2.6em]">
            {product.name}
          </p>
        </div>
      </InstantLink>

      {overlayVisible && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={product.name}
          className={[
            'fixed inset-0 z-50 flex flex-col items-center justify-center',
            'bg-black/90 backdrop-blur-sm',
          ].join(' ')}
          onClick={dismissOverlay}
        >
          <button
            type="button"
            aria-label="Close image preview"
            className={[
              'absolute top-4 right-4 z-10',
              'flex items-center justify-center',
              'w-11 h-11 rounded-full bg-white/20 text-white',
              'hover:bg-white/30 transition-colors',
            ].join(' ')}
            onClick={dismissOverlay}
          >
            <X size={20} aria-hidden="true" />
          </button>

          <div
            className="relative w-full max-w-sm aspect-square mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <ImageLoader
              imageId={product.mainImageUrl}
              endpoint="fullscreen"
              alt={product.name}
              fill
              priority
              imageContext="product"
              sizes="(max-width: 640px) 100vw, 640px"
            />
          </div>

          <p className="mt-4 px-6 text-center text-white text-base font-semibold">
            {product.name}
          </p>
          <p className="mt-1 text-white/60 text-sm">Tap anywhere to close</p>
        </div>
      )}
    </>
  )
}
