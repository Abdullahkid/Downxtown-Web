'use client'

/**
 * ProductPageClient — interactive shell for the Product Page.
 *
 * Handles:
 *  - Variant selection state (drives gallery, price, inventory)
 *  - Quantity selector
 *  - "Buy Now" navigation
 *  - "Save to Wishlist" with optimistic uiStore update
 *  - Video player (reelStatus === 'READY')
 *  - Related Products horizontal scroll
 *  - product_click analytics event on mount
 *  - "Message Seller" button for authenticated buyers (Req 3.3, 3.4, 3.5, 3.6, 3.7, 3.8)
 *
 * Requirements: 10.1–10.14, 25.3, 29.2–29.3, 30.1–30.5, 3.3–3.8
 */

import React, { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Heart,
  ShoppingBag,
  Star,
  Truck,
  RotateCcw,
  Banknote,
  ChevronRight,
  Volume2,
  VolumeX,
  Play,
  Pause,
  Maximize,
  MessageCircle,
  Loader2,
} from 'lucide-react'
import type { Product, ProductVariant, MiniProduct } from '@/types/product'
import { ImageGallery } from '@/components/product/ImageGallery'
import { VariantSelector } from '@/components/product/VariantSelector'
import { ProductReview } from '@/components/product/ProductReview'
import { ImageLoader } from '@/components/shared/ImageLoader'
import { ShimmerCard } from '@/components/shared/ShimmerCard'
import { api } from '@/lib/api/apiClient'
import { useUiStore } from '@/store/uiStore'
import { useAuthStore } from '@/store/authStore'
import { buildStoreUrl, buildProductUrl, formatPrice } from '@/lib/utils/urlBuilders'
import { buildImageUrl } from '@/lib/image/imageUrls'
import { logProductClick } from '@/lib/analytics/analyticsProvider'

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface ProductPageClientProps {
  product: Product
  productId: string
  relatedProducts: MiniProduct[]
}

// ---------------------------------------------------------------------------
// Discount percentage helper
// ---------------------------------------------------------------------------

function discountPercent(sellingPrice: number, mrp: number): number {
  if (mrp === 0) return 0
  return Math.round(((mrp - sellingPrice) / mrp) * 100)
}

// ---------------------------------------------------------------------------
// Video Player
// Requirements: 30.1–30.5
// ---------------------------------------------------------------------------

interface VideoPlayerProps {
  videoId: string
  thumbnailId: string
  productName: string
}

function VideoPlayer({ videoId, thumbnailId, productName }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [playing, setPlaying] = useState(false)
  const [muted, setMuted] = useState(true)
  const [isMobile, setIsMobile] = useState(false)

  // Detect mobile on mount
  useEffect(() => {
    setIsMobile(window.matchMedia('(max-width: 767px)').matches)
  }, [])

  const videoSrc = buildImageUrl('original', videoId)
  const posterSrc = buildImageUrl('detail', thumbnailId)

  const togglePlay = useCallback(() => {
    const video = videoRef.current
    if (!video) return
    if (video.paused) {
      video.play().catch(() => {/* autoplay blocked */})
      setPlaying(true)
    } else {
      video.pause()
      setPlaying(false)
    }
  }, [])

  const toggleMute = useCallback(() => {
    const video = videoRef.current
    if (!video) return
    video.muted = !video.muted
    setMuted(video.muted)
  }, [])

  const handleFullscreen = useCallback(() => {
    const video = videoRef.current
    if (!video) return
    if (video.requestFullscreen) {
      video.requestFullscreen()
    }
  }, [])

  // Autoplay muted on desktop (Req 30.2)
  useEffect(() => {
    if (!isMobile && videoRef.current) {
      videoRef.current.play().then(() => setPlaying(true)).catch(() => {/* blocked */})
    }
  }, [isMobile])

  return (
    <section aria-label="Product video" className="relative w-full rounded-xl overflow-hidden bg-black aspect-video">
      <video
        ref={videoRef}
        src={videoSrc}
        poster={posterSrc}
        // Req 30.2 — autoplay muted on desktop; tap-to-play on mobile
        autoPlay={!isMobile}
        muted={muted}
        playsInline
        loop
        preload="metadata"
        aria-label={`${productName} product video`}
        className="w-full h-full object-contain"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
      />

      {/* Tap-to-play overlay on mobile (Req 30.2) */}
      {isMobile && !playing && (
        <button
          type="button"
          aria-label="Play video"
          onClick={togglePlay}
          className="absolute inset-0 flex items-center justify-center bg-black/30"
        >
          <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center">
            <Play size={28} className="text-gray-900 ml-1" aria-hidden="true" />
          </div>
        </button>
      )}

      {/* Controls bar — Req 30.4 */}
      <div className="absolute bottom-0 left-0 right-0 flex items-center gap-2 px-3 py-2 bg-gradient-to-t from-black/60 to-transparent">
        {/* Play/Pause */}
        <button
          type="button"
          aria-label={playing ? 'Pause video' : 'Play video'}
          onClick={togglePlay}
          className="text-white hover:text-gray-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white rounded"
        >
          {playing ? (
            <Pause size={20} aria-hidden="true" />
          ) : (
            <Play size={20} aria-hidden="true" />
          )}
        </button>

        {/* Mute/Unmute */}
        <button
          type="button"
          aria-label={muted ? 'Unmute video' : 'Mute video'}
          onClick={toggleMute}
          className="text-white hover:text-gray-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white rounded"
        >
          {muted ? (
            <VolumeX size={20} aria-hidden="true" />
          ) : (
            <Volume2 size={20} aria-hidden="true" />
          )}
        </button>

        <div className="flex-1" />

        {/* Fullscreen */}
        <button
          type="button"
          aria-label="Enter fullscreen"
          onClick={handleFullscreen}
          className="text-white hover:text-gray-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white rounded"
        >
          <Maximize size={20} aria-hidden="true" />
        </button>
      </div>
    </section>
  )
}

// ---------------------------------------------------------------------------
// MiniProductCard — for Related Products section
// Requirements: 10.12
// ---------------------------------------------------------------------------

function MiniProductCard({ product }: { product: MiniProduct }) {
  const discount = discountPercent(product.sellingPrice, product.mrp)

  return (
    <Link
      href={buildProductUrl(product.id, product.shopifyHandle)}
      className={[
        'flex-none w-40 flex flex-col gap-1.5 rounded-xl overflow-hidden',
        'border border-gray-100 bg-white hover:shadow-md transition-shadow',
        'focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500',
      ].join(' ')}
      aria-label={`${product.name} — ${formatPrice(product.sellingPrice)}`}
    >
      {/* Product image */}
      <div className="relative w-full aspect-square bg-gray-50">
        <ImageLoader
          imageId={product.mainImageUrl}
          endpoint="preview"
          alt={product.name}
          fill
          imageContext="product"
          sizes="160px"
        />
        {discount > 0 && (
          <span
            className="absolute top-1.5 left-1.5 bg-green-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded"
            aria-label={`${discount}% off`}
          >
            {discount}% OFF
          </span>
        )}
      </div>

      {/* Info */}
      <div className="px-2 pb-2 flex flex-col gap-0.5">
        <p className="text-xs font-medium text-gray-900 line-clamp-2 leading-tight">
          {product.name}
        </p>
        <div className="flex items-center gap-1">
          <span className="text-sm font-bold text-gray-900">
            {formatPrice(product.sellingPrice)}
          </span>
          {product.mrp > product.sellingPrice && (
            <span className="text-xs text-gray-400 line-through">
              {formatPrice(product.mrp)}
            </span>
          )}
        </div>
        {product.averageRating > 0 && (
          <div className="flex items-center gap-0.5">
            <Star size={10} className="text-amber-400 fill-amber-400" aria-hidden="true" />
            <span className="text-[10px] text-gray-500">{product.averageRating.toFixed(1)}</span>
          </div>
        )}
      </div>
    </Link>
  )
}

// ---------------------------------------------------------------------------
// Main client component
// ---------------------------------------------------------------------------

export function ProductPageClient({
  product,
  productId,
  relatedProducts,
}: ProductPageClientProps) {
  const router = useRouter()
  const { wishlistCount, setWishlistCount, addToast } = useUiStore()
  const authStatus = useAuthStore((s) => s.status)

  // -------------------------------------------------------------------------
  // Variant state
  // -------------------------------------------------------------------------

  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    product.variants[0] ?? null,
  )
  const [quantity, setQuantity] = useState(1)
  const [wishlistAdded, setWishlistAdded] = useState(false)
  const [wishlistLoading, setWishlistLoading] = useState(false)
  const [messagingLoading, setMessagingLoading] = useState(false)

  // Derive the active ImageGroup from the selected variant
  const activeImageGroup =
    product.imageGroups.find((g) => g.id === selectedVariant?.imageGroupId) ??
    product.imageGroups[0] ??
    null

  // Reset quantity when variant changes
  useEffect(() => {
    setQuantity(1)
  }, [selectedVariant?.id])

  // -------------------------------------------------------------------------
  // Analytics — log product_click on mount (Req 25.3)
  // -------------------------------------------------------------------------

  useEffect(() => {
    logProductClick({
      product_id: productId,
      store_id: product.businessId,
      category: product.mainCategory,
    })
  }, [productId, product.businessId, product.mainCategory])

  // -------------------------------------------------------------------------
  // Derived values
  // -------------------------------------------------------------------------

  const sellingPrice = selectedVariant?.sellingPrice ?? 0
  const mrp = selectedVariant?.mrp ?? 0
  const inventory = selectedVariant?.inventory ?? 0
  const isOutOfStock = selectedVariant ? selectedVariant.status !== 'AVAILABLE' : false
  const discount = discountPercent(sellingPrice, mrp)
  const maxQty = Math.min(inventory, 10)

  // -------------------------------------------------------------------------
  // Handlers
  // -------------------------------------------------------------------------

  const handleVariantChange = useCallback((variant: ProductVariant) => {
    setSelectedVariant(variant)
  }, [])

  const handleBuyNow = useCallback(() => {
    if (!selectedVariant || isOutOfStock) return

    const isAdminManaged = product.managedBy === 'ADMIN'

    if (isAdminManaged) {
      // Admin/Shopify store — open external cart URL, bypass in-app checkout
      // Mirrors Android: "$websiteUrl/cart/$variantId:1" → fallback to product page
      const websiteUrl = product.storeWebsiteUrl
      const cartUrl =
        websiteUrl && selectedVariant.id
          ? `${websiteUrl}/cart/${selectedVariant.id}:1`
          : websiteUrl && product.shopifyHandle
          ? `${websiteUrl}/products/${product.shopifyHandle}`
          : null

      if (cartUrl) {
        window.open(cartUrl, '_blank', 'noopener,noreferrer')
      }
      return
    }

    // Regular seller — in-app checkout
    router.push(
      `/checkout?productId=${productId}&variantId=${selectedVariant.id}&quantity=${quantity}`,
    )
  }, [router, productId, product, selectedVariant, quantity, isOutOfStock])

  const handleWishlist = useCallback(async () => {
    if (wishlistLoading || wishlistAdded) return
    // Optimistic update (Req 29.3)
    setWishlistAdded(true)
    setWishlistCount(wishlistCount + 1)
    setWishlistLoading(true)
    try {
      await api.post(`/buyer/wishlist/${productId}`)
      addToast({ id: Date.now().toString(), message: 'Saved to wishlist', type: 'success' })
    } catch {
      // Rollback on failure
      setWishlistAdded(false)
      setWishlistCount(Math.max(0, wishlistCount))
      addToast({ id: Date.now().toString(), message: 'Failed to save to wishlist', type: 'error' })
    } finally {
      setWishlistLoading(false)
    }
  }, [wishlistLoading, wishlistAdded, wishlistCount, setWishlistCount, addToast, productId])

  /**
   * Message Seller — calls POST /chat/create with the seller's businessId.
   * Requirements: 3.3, 3.4, 3.5, 3.6, 3.7, 3.8
   */
  const handleMessageSeller = useCallback(async () => {
    if (messagingLoading) return
    setMessagingLoading(true)
    try {
      const { chatRoomId } = await api.post<{ chatRoomId: string }>('/chat/create', {
        targetUserId: product.businessId,
        targetUserType: 'BUSINESS',
      })
      router.push(`/chat/${chatRoomId}`)
    } catch {
      addToast({
        id: Date.now().toString(),
        message: 'Failed to start conversation. Please try again.',
        type: 'error',
      })
    } finally {
      setMessagingLoading(false)
    }
  }, [messagingLoading, product.businessId, addToast, router])

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------

  const hasVideo =
    product.reelStatus === 'READY' &&
    product.productReelVideoId != null &&
    product.productReelThumbnailId != null

  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-5xl mx-auto px-4 py-4 md:py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* ---------------------------------------------------------------- */}
          {/* Left column — media                                              */}
          {/* ---------------------------------------------------------------- */}
          <div className="flex flex-col gap-4 lg:w-1/2 lg:sticky lg:top-4 lg:self-start">
            {/* Video player — Req 30.1 */}
            {hasVideo && (
              <VideoPlayer
                videoId={product.productReelVideoId!}
                thumbnailId={product.productReelThumbnailId!}
                productName={product.name}
              />
            )}

            {/* Image gallery — Req 10.1, 10.2 */}
            <ImageGallery
              imageGroup={activeImageGroup}
              productName={product.name}
            />
          </div>

          {/* ---------------------------------------------------------------- */}
          {/* Right column — product info                                      */}
          {/* ---------------------------------------------------------------- */}
          <div className="flex flex-col gap-5 lg:w-1/2">
            {/* Title + wishlist */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex flex-col gap-1">
                {product.brandName && (
                  <p className="text-xs font-medium text-blue-600 uppercase tracking-wide">
                    {product.brandName}
                  </p>
                )}
                <h1 className="text-xl font-bold text-gray-900 leading-snug">
                  {product.name}
                </h1>
              </div>

              {/* Save to Wishlist — Req 29.2, 29.3 */}
              <button
                type="button"
                aria-label={wishlistAdded ? 'Saved to wishlist' : 'Save to wishlist'}
                aria-pressed={wishlistAdded}
                onClick={handleWishlist}
                disabled={wishlistLoading}
                className={[
                  'flex-none w-11 h-11 flex items-center justify-center rounded-full border transition-colors',
                  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500',
                  wishlistAdded
                    ? 'border-red-200 bg-red-50 text-red-500'
                    : 'border-gray-200 bg-white text-gray-400 hover:text-red-400 hover:border-red-200',
                  wishlistLoading ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer',
                ].join(' ')}
              >
                <Heart
                  size={20}
                  aria-hidden="true"
                  className={wishlistAdded ? 'fill-red-500' : ''}
                />
              </button>
            </div>

            {/* Price — Req 10.3 */}
            <div className="flex items-baseline gap-2 flex-wrap">
              <span className="text-2xl font-bold text-gray-900">
                {formatPrice(sellingPrice)}
              </span>
              {mrp > sellingPrice && (
                <>
                  <span className="text-base text-gray-400 line-through">
                    {formatPrice(mrp)}
                  </span>
                  <span className="text-sm font-semibold text-green-600">
                    {discount}% off
                  </span>
                </>
              )}
            </div>

            {/* Average rating */}
            {product.averageRating > 0 && (
              <div className="flex items-center gap-1.5">
                <div
                  className="flex items-center gap-1 px-2 py-0.5 bg-green-600 rounded text-white text-sm font-medium"
                  role="img"
                  aria-label={`Rated ${product.averageRating.toFixed(1)} out of 5`}
                >
                  <span>{product.averageRating.toFixed(1)}</span>
                  <Star size={12} className="fill-white" aria-hidden="true" />
                </div>
              </div>
            )}

            {/* Variant selector — Req 10.4, 10.5, 10.6 */}
            {product.variants.length > 1 && (
              <VariantSelector
                variants={product.variants}
                selectedVariant={selectedVariant}
                onVariantChange={handleVariantChange}
              />
            )}

            {/* Quantity selector — Req 10.7 */}
            {!isOutOfStock && (
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="quantity-select"
                  className="text-sm font-medium text-gray-700"
                >
                  Quantity
                </label>
                <select
                  id="quantity-select"
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className={[
                    'w-28 min-h-[44px] px-3 py-2 rounded-lg border border-gray-300',
                    'text-sm text-gray-800 bg-white',
                    'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
                  ].join(' ')}
                  aria-label="Select quantity"
                >
                  {Array.from({ length: maxQty }, (_, i) => i + 1).map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Buy Now button — Req 10.6, 10.9 */}
            <button
              type="button"
              onClick={handleBuyNow}
              disabled={isOutOfStock || !selectedVariant}
              aria-disabled={isOutOfStock}
              className={[
                'w-full min-h-[52px] flex items-center justify-center gap-2',
                'rounded-xl text-base font-semibold transition-colors',
                'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500',
                isOutOfStock || !selectedVariant
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800',
              ].join(' ')}
            >
              <ShoppingBag size={20} aria-hidden="true" />
              {isOutOfStock ? 'Out of Stock' : 'Buy Now'}
            </button>

            {/* Message Seller button — Req 3.3, 3.4, 3.5, 3.6, 3.7, 3.8 */}
            {authStatus === 'authenticated' && (
              <button
                type="button"
                onClick={handleMessageSeller}
                disabled={messagingLoading}
                aria-label="Message seller"
                className={[
                  'w-full min-h-[52px] flex items-center justify-center gap-2',
                  'rounded-xl text-base font-semibold transition-colors',
                  'border border-gray-300 bg-white text-gray-800',
                  'hover:bg-gray-50 active:bg-gray-100',
                  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-400',
                  messagingLoading ? 'opacity-60 cursor-not-allowed' : '',
                ].join(' ')}
              >
                {messagingLoading ? (
                  <Loader2 size={20} aria-hidden="true" className="animate-spin" />
                ) : (
                  <MessageCircle size={20} aria-hidden="true" />
                )}
                Message Seller
              </button>
            )}

            {/* Shipping & policies — Req 10.8 */}
            <div className="flex flex-col gap-2 p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <Truck size={16} className="text-blue-600 flex-none" aria-hidden="true" />
                <span>
                  {product.shippingCost === 0
                    ? 'Free delivery'
                    : `Delivery: ${formatPrice(product.shippingCost)}`}
                  {' '}· Est. {product.estimatedDeliveryDays} days
                </span>
              </div>
              {product.isCodAllowed && (
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <Banknote size={16} className="text-green-600 flex-none" aria-hidden="true" />
                  <span>Cash on Delivery available</span>
                </div>
              )}
              {product.isReturnable && (
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <RotateCcw size={16} className="text-orange-500 flex-none" aria-hidden="true" />
                  <span>{product.returnWindowDays}-day return policy</span>
                </div>
              )}
            </div>

            {/* Store info card — Req 10.10 */}
            <Link
              href={buildStoreUrl(product.storeUsername ?? product.businessId)}
              className={[
                'flex items-center gap-3 p-3 rounded-xl border border-gray-200',
                'hover:bg-gray-50 transition-colors',
                'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500',
              ].join(' ')}
              aria-label={`Visit ${product.brandName || 'store'} on Downxtown`}
            >
              <div className="w-10 h-10 rounded-full bg-gray-100 overflow-hidden flex-none">
                <ShimmerCard width={40} height={40} className="rounded-full" />
              </div>
              <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {product.brandName || 'Visit Store'}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {product.storeUsername
                    ? `@${product.storeUsername} · See all products`
                    : 'See all products'}
                </p>
              </div>
              <ChevronRight size={16} className="text-gray-400 flex-none" aria-hidden="true" />
            </Link>
          </div>
        </div>

        {/* ------------------------------------------------------------------ */}
        {/* Key features + description — Req 10.8                              */}
        {/* ------------------------------------------------------------------ */}
        {(product.keyFeatures.length > 0 || product.description) && (
          <section
            aria-labelledby="product-details-heading"
            className="mt-8 flex flex-col gap-4"
          >
            <h2 id="product-details-heading" className="text-base font-semibold text-gray-900">
              Product Details
            </h2>

            {product.keyFeatures.length > 0 && (
              <div className="flex flex-col gap-2">
                <h3 className="text-sm font-medium text-gray-700">Key Features</h3>
                <ul className="flex flex-col gap-1.5 pl-4">
                  {product.keyFeatures.map((feature, idx) => (
                    <li key={idx} className="text-sm text-gray-700 list-disc">
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {product.description && (
              <div className="flex flex-col gap-2">
                <h3 className="text-sm font-medium text-gray-700">Description</h3>
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                  {product.description}
                </p>
              </div>
            )}
          </section>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* Related Products — Req 10.12                                        */}
        {/* ------------------------------------------------------------------ */}
        {relatedProducts.length > 0 && (
          <section
            aria-labelledby="related-heading"
            className="mt-8 flex flex-col gap-4"
          >
            <h2 id="related-heading" className="text-base font-semibold text-gray-900">
              Related Products
            </h2>
            <div
              className="flex gap-3 overflow-x-auto pb-2"
              style={{ scrollbarWidth: 'none' }}
              role="list"
              aria-label="Related products"
            >
              {relatedProducts.map((p) => (
                <div key={p.id} role="listitem">
                  <MiniProductCard product={p} />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* Reviews — Req 10.11                                                 */}
        {/* ------------------------------------------------------------------ */}
        <div className="mt-8">
          <ProductReview
            productId={productId}
            averageRating={product.averageRating}
          />
        </div>
      </div>
    </main>
  )
}
