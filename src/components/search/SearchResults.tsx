'use client'

/**
 * SearchResults — store results section + staggered product grid,
 * each with independent infinite scroll.
 *
 * Requirements: 8.5, 8.6, 8.7, 8.13, 8.14
 */

import React from 'react'
import Link from 'next/link'
import { Star, ChevronRight } from 'lucide-react'
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll'
import { ImageLoader } from '@/lib/image/imageLoader'
import { ShimmerCard } from '@/components/shared/ShimmerCard'
import { EmptyState } from '@/components/shared/EmptyState'
import { ErrorState } from '@/components/shared/ErrorState'
import { api } from '@/lib/api/apiClient'
import type { MiniProduct } from '@/types/product'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface SearchStore {
  businessId: string
  storeName: string
  storeUsername: string
  storeLogo: string
  storeRating: number
  topProducts: MiniProduct[]
}

interface PaginatedProductsResponse {
  products: MiniProduct[]
  nextPage: number | null
  hasMore: boolean
}

interface PaginatedStoresResponse {
  stores: SearchStore[]
  nextPage: number | null
  hasMore: boolean
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
  if (minPrice) params.set('minPrice', minPrice)
  if (maxPrice) params.set('maxPrice', maxPrice)
  if (categories && categories.length > 0) {
    params.set('categories', categories.join(','))
  }
  if (minRating && minRating > 0) params.set('minRating', String(minRating))
  if (sort && sort !== 'relevance') params.set('sort', sort)
  return `/search/products?${params.toString()}`
}

function buildStoreQueryString(query: string, page: number): string {
  const params = new URLSearchParams()
  params.set('q', query)
  params.set('page', String(page))
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
// Store card
// ---------------------------------------------------------------------------

function StoreCard({ store, query }: { store: SearchStore; query: string }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Store header */}
      <Link
        href={`/store/${store.storeUsername}`}
        className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
        aria-label={`Visit ${store.storeName} store`}
      >
        <div className="relative w-10 h-10 rounded-full overflow-hidden shrink-0 bg-gray-100">
          <ImageLoader
            imageId={store.storeLogo}
            endpoint="preview"
            alt={`${store.storeName} logo`}
            fill
            imageContext="store"
            sizes="40px"
          />
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900 truncate">{store.storeName}</p>
          <p className="text-xs text-gray-500">@{store.storeUsername}</p>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <Star size={12} className="fill-amber-400 text-amber-400" aria-hidden="true" />
          <span className="text-xs font-medium text-gray-700">
            {store.storeRating.toFixed(1)}
          </span>
        </div>
      </Link>

      {/* Top products horizontal scroll */}
      {store.topProducts.length > 0 && (
        <div className="px-4 pb-3">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
            {store.topProducts.slice(0, 5).map((product) => (
              <Link
                key={product.id}
                href={`/product/${product.id}`}
                className="shrink-0 w-20 group"
                aria-label={product.name}
              >
                <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-gray-100 mb-1">
                  <ImageLoader
                    imageId={product.mainImageUrl}
                    endpoint="preview"
                    alt={product.name}
                    fill
                    imageContext="product"
                    sizes="80px"
                  />
                </div>
                <p className="text-xs text-gray-700 truncate leading-tight">
                  {formatPrice(product.sellingPrice)}
                </p>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* "See all" link — navigates to store profile with query (Req 8.7) */}
      <Link
        href={`/store/${store.storeUsername}?q=${encodeURIComponent(query)}`}
        className={[
          'flex items-center justify-center gap-1 py-2.5 border-t border-gray-100',
          'text-xs font-medium text-blue-600 hover:bg-blue-50 transition-colors',
        ].join(' ')}
        aria-label={`See all products from ${store.storeName}`}
      >
        See all products
        <ChevronRight size={12} aria-hidden="true" />
      </Link>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Product card (mini)
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
      // Staggered entrance animation via inline style (Req 8.5)
      style={{ animationDelay: `${(index % 10) * 40}ms` }}
    >
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
        {/* Product image */}
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

        {/* Product info */}
        <div className="p-2.5">
          <p className="text-xs text-gray-800 font-medium line-clamp-2 leading-snug mb-1">
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
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 space-y-3">
      <div className="flex items-center gap-3">
        <ShimmerCard width={40} height={40} className="rounded-full" />
        <div className="flex-1 space-y-1.5">
          <ShimmerCard width="60%" height={14} />
          <ShimmerCard width="40%" height={12} />
        </div>
      </div>
      <div className="flex gap-2">
        {[1, 2, 3].map((i) => (
          <ShimmerCard key={i} width={80} height={80} className="rounded-lg shrink-0" />
        ))}
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
    useInfiniteScroll<PaginatedStoresResponse>({
      queryKey: ['search-stores', query],
      queryFn: ({ pageParam }) =>
        api.get<PaginatedStoresResponse>(
          buildStoreQueryString(query, pageParam as number),
        ),
      getNextPageParam: (lastPage) => lastPage.nextPage ?? undefined,
      initialPageParam: 1,
    })

  const stores = data?.pages.flatMap((p) => p.stores) ?? []

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
        <h2 className="text-sm font-semibold text-gray-900">Stores</h2>
        <Link
          href={`/search?type=stores&q=${encodeURIComponent(query)}`}
          className="text-xs text-blue-600 font-medium hover:underline"
          aria-label="See all store results"
        >
          See all
        </Link>
      </div>

      <div className="space-y-3">
        {stores.map((store) => (
          <StoreCard key={store.businessId} store={store} query={query} />
        ))}
      </div>

      {/* Infinite scroll sentinel for stores */}
      <div ref={ref} aria-hidden="true" className="h-4" />
      {isFetchingNextPage && (
        <div className="space-y-3 mt-3">
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
    useInfiniteScroll<PaginatedProductsResponse>({
      queryKey: ['search-products', query, minPrice, maxPrice, categories, minRating, sort],
      queryFn: ({ pageParam }) =>
        api.get<PaginatedProductsResponse>(
          buildProductQueryString(
            query,
            pageParam as number,
            minPrice,
            maxPrice,
            categories,
            minRating,
            sort,
          ),
        ),
      getNextPageParam: (lastPage) => lastPage.nextPage ?? undefined,
      initialPageParam: 1,
    })

  const products = data?.pages.flatMap((p) => p.products) ?? []

  // Report result count to parent after first page loads (Req 25.4)
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
        <div className="grid grid-cols-2 gap-3">
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
      <h2 className="text-sm font-semibold text-gray-900 mb-3">
        Products
        <span className="ml-1.5 text-xs font-normal text-gray-500">
          ({products.length} shown)
        </span>
      </h2>

      {/* Staggered 2-column grid (Req 8.5) */}
      <div className="grid grid-cols-2 gap-3">
        {products.map((product, index) => (
          <ProductCard key={product.id} product={product} index={index} />
        ))}
      </div>

      {/* Infinite scroll sentinel for products */}
      <div ref={ref} aria-hidden="true" className="h-4 mt-2" />
      {isFetchingNextPage && (
        <div className="grid grid-cols-2 gap-3 mt-3">
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
 *  1. Store results (horizontal product previews + "See all" link)
 *  2. Product results (2-column staggered grid with infinite scroll)
 *
 * Both sections have independent infinite scroll (Req 8.6).
 * Skeleton placeholders shown while loading (Req 8.13).
 * Empty state shown when no results (Req 8.14).
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
