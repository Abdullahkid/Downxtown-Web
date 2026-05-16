'use client'

/**
 * MiniProductCard — compact product card used inside FeedStoreCard's
 * horizontal scroll row.
 *
 * Features:
 *  - Product image via ImageLoader (detail endpoint)
 *  - Product name, selling price, discount percentage
 *  - Tap navigates to /product/{id}
 *  - Long-press (500ms) shows a full-screen image overlay; release dismisses it
 *
 * Requirements: 7.8, 7.9
 */

import React, { useRef, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { X } from 'lucide-react'
import { ImageLoader } from '@/components/shared'
import type { MiniProduct } from '@/types/product'

interface MiniProductCardProps {
  product: MiniProduct
}

export function MiniProductCard({ product }: MiniProductCardProps) {
  const router = useRouter()
  const [overlayVisible, setOverlayVisible] = useState(false)
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const didLongPress = useRef(false)

  // -------------------------------------------------------------------------
  // Discount calculation
  // -------------------------------------------------------------------------
  const discountPct =
    product.mrp > 0
      ? Math.round(((product.mrp - product.sellingPrice) / product.mrp) * 100)
      : 0

  // -------------------------------------------------------------------------
  // Long-press handlers via Pointer Events (works for both mouse and touch)
  // Using onPointerDown / onPointerUp per Req 7.9 spec
  // -------------------------------------------------------------------------
  const handlePointerDown = useCallback(() => {
    didLongPress.current = false
    longPressTimer.current = setTimeout(() => {
      didLongPress.current = true
      setOverlayVisible(true)
    }, 500)
  }, [])

  const handlePointerUp = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current)
      longPressTimer.current = null
    }
    // Overlay stays open until user explicitly dismisses it (Req 7.9)
  }, [])

  const handlePointerLeave = useCallback(() => {
    // Cancel long-press if pointer leaves the element (e.g. scroll on touch)
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current)
      longPressTimer.current = null
    }
  }, [])

  // -------------------------------------------------------------------------
  // Tap handler — navigate to product page (Req 7.8)
  // -------------------------------------------------------------------------
  const handleClick = useCallback(() => {
    if (didLongPress.current) {
      // Long-press already handled; don't navigate
      didLongPress.current = false
      return
    }
    router.push(`/product/${product.id}`)
  }, [router, product.id])

  const dismissOverlay = useCallback(() => {
    setOverlayVisible(false)
  }, [])

  return (
    <>
      {/* Card */}
      <button
        type="button"
        aria-label={`View ${product.name}`}
        className={[
          'flex-shrink-0 w-32 rounded-xl overflow-hidden',
          'bg-white border border-gray-100 shadow-sm',
          'text-left focus-visible:outline focus-visible:outline-2',
          'focus-visible:outline-offset-2 focus-visible:outline-blue-600',
          'active:scale-95 transition-transform select-none',
        ].join(' ')}
        onClick={handleClick}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerLeave}
      >
        {/* Product image */}
        <div className="relative w-full h-32 bg-gray-100">
          <ImageLoader
            imageId={product.mainImageUrl}
            endpoint="detail"
            alt={product.name}
            fill
            imageContext="product"
            sizes="128px"
          />
          {/* Discount badge */}
          {discountPct > 0 && (
            <span
              className={[
                'absolute top-1.5 left-1.5',
                'bg-green-500 text-white text-[10px] font-bold',
                'px-1.5 py-0.5 rounded-full leading-none',
              ].join(' ')}
              aria-label={`${discountPct}% off`}
            >
              {discountPct}% off
            </span>
          )}
        </div>

        {/* Info */}
        <div className="p-2 space-y-0.5">
          <p className="text-xs font-medium text-gray-800 line-clamp-2 leading-tight">
            {product.name}
          </p>
          <div className="flex items-baseline gap-1 flex-wrap">
            <span className="text-sm font-bold text-gray-900">
              ₹{product.sellingPrice.toLocaleString('en-IN')}
            </span>
            {product.mrp > product.sellingPrice && (
              <span className="text-[10px] text-gray-400 line-through">
                ₹{product.mrp.toLocaleString('en-IN')}
              </span>
            )}
          </div>
        </div>
      </button>

      {/* Full-screen image overlay (Req 7.9) */}
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
          {/* Dismiss button */}
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

          {/* Full-screen image */}
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

          {/* Product name */}
          <p className="mt-4 px-6 text-center text-white text-base font-semibold">
            {product.name}
          </p>
          <p className="mt-1 text-white/60 text-sm">Tap anywhere to close</p>
        </div>
      )}
    </>
  )
}
