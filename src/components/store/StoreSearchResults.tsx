'use client'

/**
 * StoreSearchResults — keyword search within a single store.
 *
 * Mirrors the Android StoreSearchContent composable: calls
 * GET /stores/{storeId}/products/search, renders a product grid with sort
 * chips, loading shimmers, empty/idle/error states, and infinite scroll.
 *
 * Requirements: 9.9
 */

import React, { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Star } from 'lucide-react'
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll'
import { ImageLoader } from '@/lib/image/imageLoader'
import { ShimmerCard } from '@/components/shared/ShimmerCard'
import { EmptyState } from '@/components/shared/EmptyState'
import { ErrorState } from '@/components/shared/ErrorState'
import { formatPrice } from '@/lib/utils/urlBuilders'
import { api } from '@/lib/api/apiClient'
import type { MiniProduct } from '@/types/product'
import type { StoreSortOption, StoreProductsApiResponse, StoreProductsResponse } from '@/types/store'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface StoreSearchResultsProps {
  storeId: string
  storeName: string
  /** Active search query. Empty string shows the idle/prompt state. */
  query: string
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
]

// ---------------------------------------------------------------------------
// Product card — same visual treatment as StoreProductGrid
// ---------------------------------------------------------------------------

function ProductCard({ product }: { product: MiniProduct }) {
  const router = useRouter()

  const discount =
    product.mrp > product.sellingPrice
      ? Math.round(((product.mrp - product.sellingPrice) / product.mrp) * 100)
      : 0

  return (
    <button
      type="button"
      onClick={() => router.push(`/product/${product.id}`)}
      className={[
        'group flex h-full w-full flex-col overflow-hidden rounded-xl border border-gray-100 bg-white',
        'text-left shadow-sm hover:shadow-md active:scale-[0.98]',
        'transition-all duration-150',
        'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2',
        'focus-visible:outline-[var(--brand-color,#6366f1)]',
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

function SearchResultsShimmer() {
  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-3 px-4">
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

export function StoreSearchResults({ storeId, storeName, query }: StoreSearchResultsProps) {
  const [sort, setSort] = useState<StoreSortOption>('RECENT')

  const trimmedQuery = query.trim()

  const { data, isLoading, error, ref, isFetchingNextPage } = useInfiniteScroll<
    StoreProductsResponse,
    number
  >({
    queryKey: ['store-search', storeId, trimmedQuery, sort],
    queryFn: async ({ pageParam }) => {
      // Guard: return empty data immediately when query is blank so we never
      // hit the network for an empty search (mirrors Android's PagingData.empty()).
      if (!trimmedQuery) {
        return { products: [], currentPage: 1, hasNextPage: false, totalProducts: 0 }
      }

      const params = new URLSearchParams({
        q: trimmedQuery,
        page: String(pageParam),
        limit: '20',
        sortBy: sort,
        semanticSearch: 'true',
      })

      const wrapped = await api.get<StoreProductsApiResponse>(
        `/stores/${storeId}/products/search?${params.toString()}`,
        { auth: false },
      )

      if (!wrapped.success || !wrapped.data) {
        return { products: [], currentPage: pageParam, hasNextPage: false, totalProducts: 0 }
      }

      return wrapped.data
    },
    getNextPageParam: (lastPage) =>
      lastPage.hasNextPage ? lastPage.currentPage + 1 : undefined,
    initialPageParam: 1,
  })

  const handleSortChange = useCallback((value: StoreSortOption) => {
    setSort(value)
  }, [])

  // ── Idle state: query is empty — prompt the user to type something ────────
  if (!trimmedQuery) {
    return (
      <div className="flex flex-col items-center justify-center py-24 px-6 text-center">
        <span className="text-5xl mb-4" aria-hidden="true">🔍</span>
        <p className="text-base font-medium text-gray-700">Search products in {storeName}</p>
        <p className="mt-1 text-sm text-gray-400">Type a keyword above to find products</p>
      </div>
    )
  }

  const products = data?.pages.flatMap((p) => p.products) ?? []

  return (
    <div className="pb-6">
      {/* Results header + sort chips */}
      <div className="px-4 pt-3 pb-2">
        <p className="mb-2 text-xs text-gray-500">
          Results for{' '}
          <span className="font-semibold text-gray-800">"{trimmedQuery}"</span>
        </p>

        <div
          className="flex gap-2 overflow-x-auto scrollbar-none"
          role="group"
          aria-label="Sort search results"
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
      </div>

      {/* Content states */}
      {isLoading ? (
        <SearchResultsShimmer />
      ) : error ? (
        <ErrorState message="Search failed. Please check your connection and try again." />
      ) : products.length === 0 ? (
        <EmptyState
          heading="No products found"
          body={`No results for "${trimmedQuery}" in this store. Try a different keyword.`}
        />
      ) : (
        <>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-3 px-4 items-stretch justify-items-stretch">
            {products.map((product) => (
              <div key={product.id} className="w-full">
                <ProductCard product={product} />
              </div>
            ))}
          </div>

          {/* Infinite scroll sentinel */}
          <div ref={ref} className="h-4" aria-hidden="true" />

          {/* Append shimmer during pagination */}
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
