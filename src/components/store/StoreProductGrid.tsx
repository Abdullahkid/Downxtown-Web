'use client'

/**
 * StoreProductGrid — staggered 2-column product grid with sort chips,
 * category filter chips, and cursor-based infinite scroll pagination.
 *
 * When ssrProducts are provided (server-rendered page 1), renders them
 * first and starts client-side infinite scroll from page 2, avoiding
 * the duplicate product grid that occurred when SSR and client both
 * fetched page 1.
 *
 * Requirements: 9.4, 9.5, 9.6
 */

import React, { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useInfiniteQuery } from '@tanstack/react-query'
import { ImageLoader } from '@/lib/image/imageLoader'
import { ShimmerCard } from '@/components/shared/ShimmerCard'
import { EmptyState } from '@/components/shared/EmptyState'
import { ErrorState } from '@/components/shared/ErrorState'
import { formatPrice, buildProductUrl } from '@/lib/utils/urlBuilders'
import { api } from '@/lib/api/apiClient'
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll'
import { useNavigationLoading } from '@/components/providers/NavigationLoadingProvider'
import type { MiniProduct } from '@/types/product'
import type { StoreSortOption, StoreProductsResponse, StoreProductsApiResponse } from '@/types/store'
import { Star } from 'lucide-react'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface StoreProductGridProps {
  storeId: string
  storeUsername: string
  /** Page 1 products pre-fetched server-side — avoids duplicate fetch */
  ssrProducts?: MiniProduct[]
  /** Whether the server fetch indicated there are more pages */
  ssrHasNextPage?: boolean
}

interface SortChip {
  label: string
  value: StoreSortOption
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const SORT_CHIPS: SortChip[] = [
  { label: 'Newest', value: 'RECENT' },
  { label: 'Price ↑', value: 'PRICE_LOW_TO_HIGH' },
  { label: 'Price ↓', value: 'PRICE_HIGH_TO_LOW' },
  { label: 'Rating', value: 'RATING' },
]

// ---------------------------------------------------------------------------
// Product card
// ---------------------------------------------------------------------------

function ProductCard({ product }: { product: MiniProduct }) {
  const router = useRouter()
  const { isNavigating } = useNavigationLoading()

  const discount =
    product.mrp > product.sellingPrice
      ? Math.round(((product.mrp - product.sellingPrice) / product.mrp) * 100)
      : 0

  return (
    <button
      type="button"
      onClick={() => router.push(buildProductUrl(product.id, product.shopifyHandle))}
      className={[
        'group flex h-full w-full flex-col overflow-hidden rounded-xl border border-gray-100 bg-white',
        'text-left shadow-sm hover:shadow-md active:scale-[0.98]',
        'transition-all duration-150',
        'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-color,#6366f1)]',
        isNavigating ? 'opacity-50' : '',
      ].join(' ')}
      aria-label={`${product.name}, ${formatPrice(product.sellingPrice)}`}
    >
      <div className="relative aspect-square w-full overflow-hidden bg-gray-50">
        <ImageLoader
          imageId={product.mainImageUrl}
          endpoint="detail"
          alt={product.name}
          fill
          imageContext="product"
          sizes="(max-width: 768px) 50vw, 25vw"
          className="transition-transform duration-200 group-hover:scale-105"
        />
        {discount > 0 && (
          <span className="absolute left-2 top-2 rounded-full bg-green-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
            {discount}% off
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-0.5 p-2.5">
        <p className="line-clamp-2 min-h-[2.6em] text-xs font-medium text-gray-800 leading-snug">
          {product.name}
        </p>
        <div className="mt-1 flex items-baseline gap-1.5">
          <span className="text-sm font-bold text-gray-900">
            {formatPrice(product.sellingPrice)}
          </span>
          {product.mrp > product.sellingPrice && (
            <span className="text-xs text-gray-400 line-through">
              {formatPrice(product.mrp)}
            </span>
          )}
        </div>
        <div className="mt-auto pt-1">
          {product.averageRating > 0 && (
            <div className="flex items-center gap-0.5">
              <Star size={10} className="fill-amber-400 text-amber-400" aria-hidden="true" />
              <span className="text-[10px] text-gray-500">
                {product.averageRating.toFixed(1)}
              </span>
            </div>
          )}
        </div>
      </div>
    </button>
  )
}

// ---------------------------------------------------------------------------
// Shimmer grid
// ---------------------------------------------------------------------------

function ProductGridShimmer() {
  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-3 px-4 justify-items-stretch">
      {Array.from({ length: 6 }, (_, i) => (
        <div key={i} className="flex flex-col gap-2">
          <ShimmerCard className="aspect-square w-full rounded-xl" />
          <ShimmerCard height={12} className="w-3/4 rounded" />
          <ShimmerCard height={10} className="w-1/2 rounded" />
        </div>
      ))}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function StoreProductGrid({
  storeId,
  storeUsername,
  ssrProducts = [],
  ssrHasNextPage = true,
}: StoreProductGridProps) {
  const [sort, setSort] = useState<StoreSortOption>('RECENT')
  const [activeCategory, setActiveCategory] = useState<string | null>(null)

  // When sort/category changes, ignore SSR products and re-fetch from page 1
  const filtersActive = sort !== 'RECENT' || activeCategory !== null
  const showSsrProducts = ssrProducts.length > 0 && !filtersActive

  // Fetch category chips for this store
  const { data: categoriesData } = useInfiniteQuery<
    { categories: Array<{ id: string; name: string }> },
    Error
  >({
    queryKey: ['store-category-names', storeId],
    queryFn: async () => {
      const res = await api.get<{
        success: boolean
        data: {
          items: Array<{ id: string; name: string; productCount: number }>
        } | null
      }>(`/stores/${storeId}/categories`, { auth: false })
      if (!res.success || !res.data) return { categories: [] }
      return { categories: res.data.items.map(c => ({ id: c.id, name: c.name })) }
    },
    getNextPageParam: () => undefined,
    initialPageParam: undefined,
  })

  const categoryChips = categoriesData?.pages[0]?.categories ?? []

  // Infinite scroll:
  //  - When SSR products exist and no filter active → start from page 2
  //  - When filter active or no SSR products → start from page 1
  const { data, isLoading, error, ref, isFetchingNextPage } = useInfiniteScroll<
    StoreProductsResponse,
    number
  >({
    queryKey: ['store-products', storeId, sort, activeCategory],
    queryFn: async ({ pageParam }) => {
      const params = new URLSearchParams({ sortBy: sort })
      if (activeCategory) params.set('categoryId', activeCategory)
      params.set('page', String(pageParam))
      const wrapped = await api.get<StoreProductsApiResponse>(
        `/stores/${storeId}/products?${params.toString()}`,
        { auth: false },
      )
      if (!wrapped.success || !wrapped.data) {
        return { products: [], currentPage: pageParam, hasNextPage: false, totalProducts: 0 }
      }
      return wrapped.data
    },
    getNextPageParam: (lastPage) =>
      lastPage.hasNextPage ? lastPage.currentPage + 1 : undefined,
    // Start from page 2 when SSR covers page 1 and no filter changes the sort order
    initialPageParam: showSsrProducts ? 2 : 1,
  })

  const clientProducts = data?.pages.flatMap((p) => p.products) ?? []

  // Merge: SSR page 1 first, then client pages 2+
  // When a filter is active, discard SSR and show only client results
  const allProducts = showSsrProducts
    ? [...ssrProducts, ...clientProducts]
    : clientProducts

  const handleSortChange = useCallback((value: StoreSortOption) => {
    setSort(value)
  }, [])

  const handleCategoryChange = useCallback((id: string | null) => {
    setActiveCategory(id)
  }, [])

  return (
    <div className="pb-6">
      {/* Sort chips */}
      <div
        className="flex gap-2 overflow-x-auto px-4 py-3 scrollbar-none"
        role="group"
        aria-label="Sort products"
      >
        {SORT_CHIPS.map((chip) => (
          <button
            key={chip.value}
            type="button"
            onClick={() => handleSortChange(chip.value)}
            aria-pressed={sort === chip.value}
            className={[
              'shrink-0 rounded-full px-4 py-1.5 text-sm font-medium',
              'min-h-[44px] transition-colors',
              'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2',
              sort === chip.value
                ? 'bg-[var(--brand-color,#6366f1)] text-white focus-visible:outline-[var(--brand-color,#6366f1)]'
                : 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus-visible:outline-gray-400',
            ].join(' ')}
          >
            {chip.label}
          </button>
        ))}
      </div>

      {/* Category filter chips */}
      {categoryChips.length > 0 && (
        <div
          className="flex gap-2 overflow-x-auto px-4 pb-3 scrollbar-none"
          role="group"
          aria-label="Filter by category"
        >
          <button
            type="button"
            onClick={() => handleCategoryChange(null)}
            aria-pressed={activeCategory === null}
            className={[
              'shrink-0 rounded-full px-3 py-1 text-xs font-medium',
              'min-h-[44px] transition-colors',
              'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2',
              activeCategory === null
                ? 'bg-gray-900 text-white focus-visible:outline-gray-700'
                : 'border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 focus-visible:outline-gray-400',
            ].join(' ')}
          >
            All
          </button>
          {categoryChips.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => handleCategoryChange(cat.id)}
              aria-pressed={activeCategory === cat.id}
              className={[
                'shrink-0 rounded-full px-3 py-1 text-xs font-medium',
                'min-h-[44px] transition-colors',
                'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2',
                activeCategory === cat.id
                  ? 'bg-gray-900 text-white focus-visible:outline-gray-700'
                  : 'border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 focus-visible:outline-gray-400',
              ].join(' ')}
            >
              {cat.name}
            </button>
          ))}
        </div>
      )}

      {/* Product grid */}
      {isLoading && !showSsrProducts ? (
        <ProductGridShimmer />
      ) : error ? (
        <ErrorState message="Failed to load products" />
      ) : allProducts.length === 0 ? (
        <EmptyState
          heading="No products found"
          body={
            activeCategory
              ? 'Try selecting a different category or clearing the filter.'
              : 'This store has no products yet.'
          }
          ctaLabel={activeCategory ? 'Clear filter' : undefined}
          onCta={activeCategory ? () => handleCategoryChange(null) : undefined}
        />
      ) : (
        <>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-3 px-4 items-stretch justify-items-stretch">
            {allProducts.map((product) => (
              <div key={product.id} className="w-full">
                <ProductCard product={product} />
              </div>
            ))}
          </div>

          <div ref={ref} className="h-4" aria-hidden="true" />

          {isFetchingNextPage && (
            <div className="mt-4 grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-3 px-4 justify-items-stretch">
              {Array.from({ length: 2 }, (_, i) => (
                <div key={i} className="flex flex-col gap-2">
                  <ShimmerCard className="aspect-square w-full rounded-xl" />
                  <ShimmerCard height={12} className="w-3/4 rounded" />
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
