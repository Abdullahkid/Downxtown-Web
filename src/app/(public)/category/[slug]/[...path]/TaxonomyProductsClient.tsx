'use client'

/**
 * TaxonomyProductsClient — infinite-scroll product grid for a taxonomy node.
 * Takes over from page 2 after SSR renders page 1.
 * Also owns the gender filter tabs since those are client-side UI state.
 */

import React, { useState, useCallback } from 'react'
import Link from 'next/link'
import { Loader2, Star } from 'lucide-react'
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll'
import { api } from '@/lib/api/apiClient'
import { ImageLoader } from '@/lib/image/imageLoader'
import { ShimmerCard } from '@/components/shared/ShimmerCard'
import { ErrorState } from '@/components/shared/ErrorState'
import { buildProductUrl, formatPrice } from '@/lib/utils/urlBuilders'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface TaxonomyProduct {
  id: string
  title: string
  brandName: string
  mainImageUrl: string
  sellingPrice: number
  mrp: number
  averageRating: number
  shopifyHandle?: string | null
  storeUsername?: string | null
}

interface TaxonomyProductsResponse {
  products: TaxonomyProduct[]
  currentPage: number
  hasNextPage: boolean
  totalProducts: number
}

interface TaxonomyProductsClientProps {
  leafId?: string
  nodeId?: string
  hasMorePages: boolean
}

type GenderParam = 'men' | 'women' | null

const GENDER_TABS: { label: string; value: GenderParam }[] = [
  { label: 'All', value: null },
  { label: 'Men', value: 'men' },
  { label: 'Women', value: 'women' },
]

// ---------------------------------------------------------------------------
// Product card
// ---------------------------------------------------------------------------

function ProductCard({ product }: { product: TaxonomyProduct }) {
  const discount =
    product.mrp > product.sellingPrice
      ? Math.round(((product.mrp - product.sellingPrice) / product.mrp) * 100)
      : 0

  return (
    <Link
      href={buildProductUrl(product.id, product.shopifyHandle)}
      className={[
        'group flex flex-col overflow-hidden rounded-xl border border-gray-100 bg-white',
        'shadow-sm hover:shadow-md active:scale-[0.98] transition-all duration-150',
        'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2',
        'focus-visible:outline-[var(--brand-color,#6366f1)]',
      ].join(' ')}
      aria-label={`${product.title}, ${formatPrice(product.sellingPrice)}`}
    >
      <div className="relative aspect-square w-full overflow-hidden bg-gray-50">
        <ImageLoader
          imageId={product.mainImageUrl}
          endpoint="detail"
          alt={product.title}
          fill
          imageContext="product"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="transition-transform duration-200 group-hover:scale-105"
        />
        {discount > 0 && (
          <span className="absolute left-2 top-2 rounded-full bg-green-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
            {discount}% off
          </span>
        )}
      </div>
      <div className="flex flex-col gap-0.5 p-2.5">
        {product.brandName && (
          <p className="text-[10px] font-semibold text-brand-accent uppercase tracking-wide truncate">
            {product.brandName}
          </p>
        )}
        <p className="line-clamp-2 text-xs font-medium text-gray-800 leading-snug">
          {product.title}
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
            <span className="text-[10px] text-gray-500">{product.averageRating.toFixed(1)}</span>
          </div>
        )}
      </div>
    </Link>
  )
}

// ---------------------------------------------------------------------------
// Shimmer
// ---------------------------------------------------------------------------

function ProductGridShimmer() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
      {Array.from({ length: 4 }, (_, i) => (
        <div key={i} className="flex flex-col gap-2">
          <ShimmerCard className="aspect-square w-full rounded-xl" />
          <ShimmerCard height={10} className="w-1/2 rounded" />
          <ShimmerCard height={12} className="w-3/4 rounded" />
          <ShimmerCard height={10} className="w-1/2 rounded" />
        </div>
      ))}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function TaxonomyProductsClient({
  leafId,
  nodeId,
  hasMorePages,
}: TaxonomyProductsClientProps) {
  const [activeGender, setActiveGender] = useState<GenderParam>(null)

  const handleGenderSelect = useCallback((value: GenderParam) => {
    setActiveGender(value)
  }, [])

  const queryKey = ['taxonomy-products', leafId ?? nodeId, activeGender] as const

  const {
    data,
    isLoading,
    error,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    ref: sentinelRef,
  } = useInfiniteScroll<TaxonomyProductsResponse>({
    queryKey,
    queryFn: async ({ pageParam, queryKey: key }) => {
      const [, id, gender] = key as typeof queryKey
      const params = new URLSearchParams({ page: String(pageParam), limit: '20' })
      if (leafId) params.set('leafId', leafId)
      else if (nodeId) params.set('nodeId', nodeId)
      if (gender) params.set('gender', gender)

      const res = await api.get<TaxonomyProductsResponse>(
        `/taxonomy/products?${params.toString()}`,
        { auth: false },
      )
      return res
    },
    getNextPageParam: (lastPage) =>
      lastPage.hasNextPage ? lastPage.currentPage + 1 : undefined,
    // Start from page 2 when no gender filter (page 1 was server-rendered).
    // Start from page 1 when gender filter is active (server page was unfiltered).
    initialPageParam: activeGender !== null ? 1 : 2,
  })

  const clientProducts = data?.pages.flatMap((p) => p.products) ?? []

  if (!hasMorePages && activeGender === null && clientProducts.length === 0) {
    // No more pages and no gender filter — nothing to render here
    return null
  }

  return (
    <div className="space-y-5">
      {/* Gender filter tabs */}
      <section aria-label="Filter by gender">
        <div className="flex gap-2" role="tablist" aria-label="Gender filter">
          {GENDER_TABS.map(({ label, value }) => {
            const isActive = activeGender === value
            return (
              <button
                key={label}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => handleGenderSelect(value)}
                className={[
                  'flex-1 py-2 rounded-xl text-sm font-medium transition-colors border',
                  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand',
                  isActive
                    ? 'bg-brand-accent/10 border-brand-accent text-brand-accent'
                    : 'bg-bg-3 border-border text-text-2 hover:bg-surface hover:text-text-1',
                ].join(' ')}
              >
                {label}
              </button>
            )
          })}
        </div>
      </section>

      {/* Client products (pages 2+, or page 1+ when gender filter active) */}
      {isLoading && <ProductGridShimmer />}
      {!isLoading && error && <ErrorState message="Failed to load products." />}

      {clientProducts.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {clientProducts.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}

      {/* Sentinel */}
      <div ref={sentinelRef} className="flex justify-center py-4">
        {isFetchingNextPage ? (
          <div className="flex items-center gap-2 text-text-3">
            <Loader2 size={18} className="animate-spin text-brand" aria-hidden="true" />
            <span className="text-sm">Loading more…</span>
          </div>
        ) : hasNextPage ? (
          <button
            onClick={() => fetchNextPage()}
            className="px-6 py-2.5 rounded-full text-sm font-medium border border-border text-brand hover:bg-bg-3 transition-colors"
          >
            Load more
          </button>
        ) : null}
      </div>
    </div>
  )
}
