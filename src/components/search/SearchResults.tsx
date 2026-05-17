'use client'

/**
 * SearchResults — store results section + staggered product grid,
 * each with independent infinite scroll.
 *
 * Requirements: 8.5, 8.6, 8.7, 8.13, 8.14
 */

import React, { useState, useCallback } from 'react'
import Link from 'next/link'
import { Star, ChevronRight } from 'lucide-react'
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll'
import { ImageLoader } from '@/lib/image/imageLoader'
import { MiniProductCard } from '@/components/feed/MiniProductCard'
import { ShimmerCard } from '@/components/shared/ShimmerCard'
import { EmptyState } from '@/components/shared/EmptyState'
import { ErrorState } from '@/components/shared/ErrorState'
import { api } from '@/lib/api/apiClient'
import type { MiniProduct } from '@/types/product'

// ---------------------------------------------------------------------------
// Types — mirror the Ktor backend DTOs exactly
// ---------------------------------------------------------------------------

export interface SearchStore {
  businessId: string
  /** Backend field is `name`, not `storeName` */
  name: string
  /** Backend field is `username`, not `storeUsername` */
  username: string
  /** Backend field is `imageUrl`, not `storeLogo` */
  imageUrl: string | null
  storeRating: number
  followersCount: number
  /** Backend field is `products`, not `topProducts` */
  products: MiniProduct[]
}

/**
 * Backend response shape for GET /search/stores
 * Wrapped in ApiResponse<T> — we unwrap in queryFn.
 */
interface SearchStoresResponse {
  stores: SearchStore[]
  totalResults: number
  page: number
  totalPages: number
  hasNextPage: boolean
  searchQuery: string
}

/**
 * Backend response shape for GET /search/products
 * Wrapped in ApiResponse<T> — we unwrap in queryFn.
 */
interface SearchProductsResponse {
  /** Populated when groupByStore=false (flat list) */
  productResults: MiniProduct[] | null
  totalResults: number
  page: number
  totalPages: number
  hasNextPage: boolean
  searchQuery: string
}

/** Generic ApiResponse envelope the backend always wraps data in */
interface ApiResponse<T> {
  success: boolean
  data: T | null
  message?: string
  error?: string
}

export interface SearchResultsProps {
  query: string
  minPrice?: string
  maxPrice?: string
  categories?: string[]
  minRating?: number
  sort?: string
  /** Called after the first page of results loads with the total product count. */
  onResultCountChange?: (count: number) => void
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function buildProductQueryString(
  query: string,
  page: number,
  minPrice?: string,
  maxPrice?: string,
  categories?: string[],
  minRating?: number,
  sort?: string,
): string {
  const params = new URLSearchParams()
  params.set('q', query)
  params.set('page', String(page))
  params.set('groupByStore', 'false')
  params.set('semanticSearch', 'true')
  if (minPrice) params.set('minPrice', minPrice)
  if (maxPrice) params.set('maxPrice', maxPrice)
  if (categories && categories.length > 0) params.set('categories', categories.join(','))
  if (minRating && minRating > 0) params.set('minRating', String(minRating))
  if (sort && sort !== 'relevance') params.set('sort', sort)
  return `/search/products?${params.toString()}`
}

function buildStoreQueryString(query: string, page: number): string {
  const params = new URLSearchParams()
  params.set('q', query)
  params.set('page', String(page))
  params.set('semanticSearch', 'true')
  return `/search/stores?${params.toString()}`
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(price)
}

// ---------------------------------------------------------------------------
// Star rating helper
// ---------------------------------------------------------------------------

function RatingStars({ rating }: { rating: number }) {
  const full = Math.floor(rating)
  const hasHalf = rating - full >= 0.5
  return (
    <div className="flex items-center gap-0.5" aria-label={`${rating.toFixed(1)} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, i) => {
        const filled = i < full
        const half = !filled && hasHalf && i === full
        return (
          <Star
            key={i}
            size={12}
            aria-hidden="true"
            className={
              filled || half ? 'text-amber-400 fill-amber-400' : 'text-gray-300 fill-gray-300'
            }
          />
        )
      })}
      <span className="ml-1 text-xs text-text-3">{rating.toFixed(1)}</span>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Store card — matches FeedStoreCard visual design exactly,
//              with the "See all products" button preserved at the bottom.
// ---------------------------------------------------------------------------

function StoreCard({ store, query }: { store: SearchStore; query: string }) {
  const [isFollowing, setIsFollowing] = useState(false)
  const [isFollowLoading, setIsFollowLoading] = useState(false)

  const handleFollowToggle = useCallback(
    async (e: React.MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()
      if (isFollowLoading) return
      const prev = isFollowing
      setIsFollowing(!prev)
      setIsFollowLoading(true)
      try {
        if (!prev) {
          await api.post(`/stores/${store.businessId}/follow`)
        } else {
          await api.delete(`/stores/${store.businessId}/follow`)
        }
      } catch {
        setIsFollowing(prev)
      } finally {
        setIsFollowLoading(false)
      }
    },
    [isFollowing, isFollowLoading, store.businessId],
  )

  return (
    <article
      className={[
        'bg-bg-3 rounded-[16px] shadow-sm border border-border',
        'overflow-hidden transition-all duration-200',
        'hover:border-border-accent hover:-translate-y-[2px] relative group',
      ].join(' ')}
      aria-label={`${store.name} store card`}
    >
      {/* Hover glow — same as FeedStoreCard */}
      <div className="absolute inset-0 rounded-[16px] bg-gradient-to-br from-brand/5 to-brand-accent/5 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity" />

      {/* Cover strip */}
      <div className="h-[65px] bg-bg-4 relative overflow-hidden pattern-2">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-bg-3/80" />
      </div>

      {/* Store header — tappable, navigates to store profile */}
      <Link
        href={`/store/${store.username}`}
        className={[
          'relative z-10 w-full flex items-start gap-3 px-4 pb-3',
          'focus-visible:outline focus-visible:outline-2',
          'focus-visible:outline-offset-2 focus-visible:outline-brand',
        ].join(' ')}
        aria-label={`Visit ${store.name} store`}
      >
        {/* Logo — overlaps cover strip */}
        <div
          className={[
            'flex-shrink-0 w-[52px] h-[52px] rounded-[14px] overflow-hidden',
            'bg-white border-2 border-bg-3 -mt-[26px] p-[5px]',
            'flex items-center justify-center relative',
          ].join(' ')}
        >
          <ImageLoader
            imageId={store.imageUrl ?? ''}
            endpoint="display"
            alt={`${store.name} logo`}
            fill
            imageContext="store"
            sizes="48px"
          />
          {!store.imageUrl && (
            <span className="font-display text-lg text-brand uppercase tracking-wider">
              {store.name.substring(0, 2)}
            </span>
          )}
        </div>

        {/* Name / username / rating */}
        <div className="flex-1 min-w-0 pt-2">
          <p className="text-[16px] font-semibold text-text-1 truncate">{store.name}</p>
          <p className="text-[12px] text-text-3 truncate mt-0.5">@{store.username}</p>
          <div className="mt-1">
            <RatingStars rating={store.storeRating} />
          </div>
        </div>

        {/* Follow button */}
        <button
          type="button"
          aria-label={isFollowing ? `Unfollow ${store.name}` : `Follow ${store.name}`}
          aria-pressed={isFollowing}
          disabled={isFollowLoading}
          onClick={handleFollowToggle}
          className={[
            'flex-shrink-0 mt-2 px-4 py-[7px] rounded-full',
            'text-[12px] font-semibold tracking-wide font-sans',
            'border transition-colors whitespace-nowrap',
            'focus-visible:outline focus-visible:outline-2',
            'focus-visible:outline-offset-2 focus-visible:outline-brand',
            'disabled:opacity-60 disabled:cursor-not-allowed',
            isFollowing
              ? 'bg-brand border-brand text-white'
              : 'bg-transparent border-border-accent text-brand hover:bg-brand-accent/10',
          ].join(' ')}
        >
          {isFollowing ? 'Following' : 'Follow'}
        </button>
      </Link>

      {/* Horizontal product scroll — uses MiniProductCard, same as feed */}
      {store.products.length > 0 ? (
        <div
          className="pb-2 relative z-10"
          role="region"
          aria-label={`${store.name} products`}
        >
          <div className="flex gap-3 px-4 pb-1 overflow-x-auto scrollbar-hide">
            {store.products.map((product) => (
              <MiniProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      ) : (
        <div className="px-4 pb-3 relative z-10">
          <p className="text-[12px] text-text-3 italic">No products yet</p>
        </div>
      )}

      {/* See all — preserved as requested (Req 8.7) */}
      <Link
        href={`/store/${store.username}?q=${encodeURIComponent(query)}`}
        className={[
          'relative z-10 flex items-center justify-center gap-1 py-2.5',
          'border-t border-border text-xs font-medium text-brand',
          'hover:bg-brand-accent/5 transition-colors',
          'focus-visible:outline focus-visible:outline-2',
          'focus-visible:outline-offset-2 focus-visible:outline-brand',
        ].join(' ')}
        aria-label={`See all products from ${store.name}`}
      >
        See all products
        <ChevronRight size={12} aria-hidden="true" />
      </Link>
    </article>
  )
}

// ---------------------------------------------------------------------------
// Product card (mini grid card used in product results section)
// ---------------------------------------------------------------------------

function ProductCard({ product, index }: { product: MiniProduct; index: number }) {
  const discountPct =
    product.mrp > 0
      ? Math.round(((product.mrp - product.sellingPrice) / product.mrp) * 100)
      : 0

  return (
    <Link
      href={`/product/${product.id}`}
      className="group block"
      aria-label={product.name}
      style={{ animationDelay: `${(index % 10) * 40}ms` }}
    >
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
        <div className="relative aspect-square bg-gray-100 overflow-hidden">
          <ImageLoader
            imageId={product.mainImageUrl}
            endpoint="preview"
            alt={product.name}
            fill
            imageContext="product"
            sizes="(max-width: 768px) 50vw, 25vw"
          />
          {discountPct > 0 && (
            <span
              aria-label={`${discountPct}% off`}
              className="absolute top-2 left-2 bg-green-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded"
            >
              {discountPct}% off
            </span>
          )}
        </div>

        <div className="p-2.5">
          {/* Store/brand name — bigger and bolder, shown above product name */}
          {product.storeName && (
            <Link
              href={`/store/${product.storeUsername}`}
              onClick={(e) => e.stopPropagation()}
              className="block mb-0.5 w-fit"
              aria-label={`From ${product.storeName}`}
            >
              <span className="text-sm font-bold text-text-1 truncate hover:text-brand transition-colors">
                {product.storeName}
              </span>
            </Link>
          )}

          <p className="text-xs font-medium text-text-2 line-clamp-2 leading-snug mb-1">
            {product.name}
          </p>

          <div className="flex items-baseline gap-1.5 flex-wrap">
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
            <div className="flex items-center gap-0.5 mt-1">
              <Star size={10} className="fill-amber-400 text-amber-400" aria-hidden="true" />
              <span className="text-[10px] text-gray-500">
                {product.averageRating.toFixed(1)}
              </span>
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}

// ---------------------------------------------------------------------------
// Skeleton loaders
// ---------------------------------------------------------------------------

function StoreCardSkeleton() {
  return (
    <div className="bg-bg-3 rounded-[16px] border border-border overflow-hidden">
      {/* Cover strip skeleton */}
      <ShimmerCard className="h-[65px] w-full rounded-none" />
      <div className="px-4 pb-4 pt-1 space-y-3">
        <div className="flex items-start gap-3">
          {/* Logo skeleton — overlapping */}
          <ShimmerCard width={52} height={52} className="rounded-[14px] -mt-[26px] flex-shrink-0" />
          <div className="flex-1 pt-2 space-y-1.5">
            <ShimmerCard width="55%" height={16} />
            <ShimmerCard width="35%" height={12} />
            <ShimmerCard width="45%" height={12} />
          </div>
          <ShimmerCard width={72} height={32} className="rounded-full mt-2 flex-shrink-0" />
        </div>
        {/* Product row skeleton */}
        <div className="flex gap-3 overflow-hidden">
          {[1, 2, 3].map((i) => (
            <ShimmerCard key={i} width={176} height={230} className="rounded-[12px] flex-shrink-0" />
          ))}
        </div>
      </div>
    </div>
  )
}

function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <ShimmerCard className="aspect-square w-full rounded-none" />
      <div className="p-2.5 space-y-1.5">
        <ShimmerCard width="90%" height={12} />
        <ShimmerCard width="70%" height={12} />
        <ShimmerCard width="50%" height={14} />
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Store results section
// ---------------------------------------------------------------------------

function StoreResults({ query }: { query: string }) {
  const { data, isLoading, error, ref, isFetchingNextPage } =
    useInfiniteScroll<SearchStoresResponse>({
      queryKey: ['search-stores', query],
      queryFn: async ({ pageParam }) => {
        const envelope = await api.get<ApiResponse<SearchStoresResponse>>(
          buildStoreQueryString(query, pageParam as number),
        )
        if (!envelope.success || !envelope.data) {
          throw new Error(envelope.error ?? envelope.message ?? 'Store search failed')
        }
        return envelope.data
      },
      getNextPageParam: (lastPage) =>
        lastPage.hasNextPage ? lastPage.page + 1 : undefined,
      initialPageParam: 1,
    })

  const stores = data?.pages.flatMap((p) => p.stores ?? []) ?? []

  if (isLoading) {
    return (
      <section aria-label="Store results loading" className="space-y-3">
        <ShimmerCard width={120} height={20} className="rounded" />
        {[1, 2].map((i) => (
          <StoreCardSkeleton key={i} />
        ))}
      </section>
    )
  }

  if (error) {
    return <ErrorState message="Could not load store results." />
  }

  if (stores.length === 0) return null

  return (
    <section aria-label="Store results">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-text-1">Stores</h2>
        <Link
          href={`/search?type=stores&q=${encodeURIComponent(query)}`}
          className="text-xs text-brand font-medium hover:underline"
          aria-label="See all store results"
        >
          See all
        </Link>
      </div>

      <div className="space-y-4">
        {stores.map((store) => (
          <StoreCard key={store.businessId} store={store} query={query} />
        ))}
      </div>

      <div ref={ref} aria-hidden="true" className="h-4" />
      {isFetchingNextPage && (
        <div className="space-y-4 mt-4">
          <StoreCardSkeleton />
        </div>
      )}
    </section>
  )
}

// ---------------------------------------------------------------------------
// Product results section
// ---------------------------------------------------------------------------

function ProductResults({
  query,
  minPrice,
  maxPrice,
  categories,
  minRating,
  sort,
  onResultCountChange,
}: SearchResultsProps) {
  const { data, isLoading, error, ref, isFetchingNextPage } =
    useInfiniteScroll<SearchProductsResponse>({
      queryKey: ['search-products', query, minPrice, maxPrice, categories, minRating, sort],
      queryFn: async ({ pageParam }) => {
        const envelope = await api.get<ApiResponse<SearchProductsResponse>>(
          buildProductQueryString(
            query,
            pageParam as number,
            minPrice,
            maxPrice,
            categories,
            minRating,
            sort,
          ),
        )
        if (!envelope.success || !envelope.data) {
          throw new Error(envelope.error ?? envelope.message ?? 'Product search failed')
        }
        return envelope.data
      },
      getNextPageParam: (lastPage) =>
        lastPage.hasNextPage ? lastPage.page + 1 : undefined,
      initialPageParam: 1,
    })

  const products = data?.pages.flatMap((p) => p.productResults ?? []) ?? []

  React.useEffect(() => {
    if (data?.pages[0] !== undefined) {
      onResultCountChange?.(products.length)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data?.pages[0]])

  if (isLoading) {
    return (
      <section aria-label="Product results loading">
        <ShimmerCard width={140} height={20} className="rounded mb-3" />
        <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      </section>
    )
  }

  if (error) {
    return <ErrorState message="Could not load product results." />
  }

  if (products.length === 0) {
    return (
      <EmptyState
        heading={`No products found for "${query}"`}
        body="Try different keywords, remove filters, or browse by category."
      />
    )
  }

  return (
    <section aria-label="Product results">
      <h2 className="text-sm font-semibold text-text-1 mb-3">
        Products
        <span className="ml-1.5 text-xs font-normal text-text-3">
          ({products.length} shown)
        </span>
      </h2>

      <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-3">
        {products.map((product, index) => (
          <ProductCard key={product.id} product={product} index={index} />
        ))}
      </div>

      <div ref={ref} aria-hidden="true" className="h-4 mt-2" />
      {isFetchingNextPage && (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-3 mt-3">
          {[1, 2].map((i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      )}
    </section>
  )
}

// ---------------------------------------------------------------------------
// SearchResults (combined)
// ---------------------------------------------------------------------------

/**
 * SearchResults renders two independent sections:
 *  1. Store results — feed-style cards with cover strip, overlapping logo,
 *     follow button, MiniProductCard row, and "See all products" link.
 *  2. Product results — 2-column staggered grid with infinite scroll.
 */
export function SearchResults(props: SearchResultsProps) {
  const { query } = props

  if (!query.trim()) return null

  return (
    <div className="space-y-6">
      <StoreResults query={query} />
      <ProductResults {...props} />
    </div>
  )
}

