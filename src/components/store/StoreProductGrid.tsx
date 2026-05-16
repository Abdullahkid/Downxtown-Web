'use client'

/**
 * StoreProductGrid — staggered 2-column product grid with sort chips,
 * category filter chips, and cursor-based infinite scroll pagination.
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
import { formatPrice } from '@/lib/utils/urlBuilders'
import { api } from '@/lib/api/apiClient'
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll'
import type { MiniProduct } from '@/types/product'
import type { StoreSortOption, StoreProductsResponse, StoreProductsApiResponse } from '@/types/store'
import { Star } from 'lucide-react'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface StoreProductGridProps {
  storeId: string
  storeUsername: string
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

  const discount =
    product.mrp > product.sellingPrice
      ? Math.round(((product.mrp - product.sellingPrice) / product.mrp) * 100)
      : 0

  return (
    <button
      type="button"
      onClick={() => router.push(`/product/${product.id}`)}
      className={[
        'group flex flex-col overflow-hidden rounded-xl border border-gray-100 bg-white',
        'text-left shadow-sm hover:shadow-md active:scale-[0.98]',
        'transition-all duration-150',
        'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-color,#6366f1)]',
      ].join(' ')}
      aria-label={`${product.name}, ${formatPrice(product.sellingPrice)}`}
    >
      {/* Product image */}
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

      {/* Product info */}
      <div className="flex flex-col gap-0.5 p-2.5">
        <p className="line-clamp-2 text-xs font-medium text-gray-800 leading-snug">
          {product.name}
        </p>

        <div className="flex items-baseline gap-1.5 mt-1">
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
          <div className="flex items-center gap-0.5 mt-0.5">
            <Star size={10} className="fill-amber-400 text-amber-400" aria-hidden="true" />
            <span className="text-[10px] text-gray-500">
              {product.averageRating.toFixed(1)}
            </span>
          </div>
        )}
      </div>
    </button>
  )
}

// ---------------------------------------------------------------------------
// Shimmer grid
// ---------------------------------------------------------------------------

function ProductGridShimmer() {
  return (
    <div className="grid grid-cols-2 gap-3 px-4">
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

export function StoreProductGrid({ storeId, storeUsername }: StoreProductGridProps) {
  const [sort, setSort] = useState<StoreSortOption>('RECENT')
  const [activeCategory, setActiveCategory] = useState<string | null>(null)

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

  const categoryChips =
    categoriesData?.pages[0]?.categories ?? []

  // Infinite scroll for products
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
    initialPageParam: 1,
  })

  const allProducts = data?.pages.flatMap((p) => p.products) ?? []

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
              'min-h-[36px] transition-colors',
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
              'min-h-[32px] transition-colors',
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
                'min-h-[32px] transition-colors',
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
      {isLoading ? (
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
          {/* Staggered 2-column grid */}
          <div className="grid grid-cols-2 gap-3 px-4">
            {allProducts.map((product, index) => (
              <div key={product.id}>
                <ProductCard product={product} />
              </div>
            ))}
          </div>

          {/* Infinite scroll sentinel */}
          <div ref={ref} className="h-4" aria-hidden="true" />

          {/* Loading more indicator */}
          {isFetchingNextPage && (
            <div className="mt-4 grid grid-cols-2 gap-3 px-4">
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
