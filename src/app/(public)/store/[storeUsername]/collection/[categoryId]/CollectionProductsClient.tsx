'use client'

/**
 * CollectionProductsClient — infinite-scroll product grid for a store collection.
 * Takes over from page 2 after SSR page 1.
 */

import React from 'react'
import Link from 'next/link'
import { Loader2 } from 'lucide-react'
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll'
import { api } from '@/lib/api/apiClient'
import { ImageLoader } from '@/lib/image/imageLoader'
import { ShimmerCard } from '@/components/shared/ShimmerCard'
import { ErrorState } from '@/components/shared/ErrorState'
import { buildProductUrl, formatPrice } from '@/lib/utils/urlBuilders'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface CollectionProduct {
  id: string
  name: string
  mainImageUrl: string
  sellingPrice: number
  mrp: number
  shopifyHandle?: string | null
  averageRating?: number
}

interface CollectionPageResponse {
  category: { id: string; name: string; productCount: number }
  products: { items: CollectionProduct[]; hasNextPage: boolean; currentPage: number; totalPages: number }
}

interface CollectionProductsClientProps {
  storeId: string
  categoryId: string
  /** Whether there is a page 2+ to load */
  hasMorePages: boolean
}

// ---------------------------------------------------------------------------
// Product card
// ---------------------------------------------------------------------------

function ProductCard({ product }: { product: CollectionProduct }) {
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
      aria-label={`${product.name}, ${formatPrice(product.sellingPrice)}`}
    >
      <div className="relative aspect-square w-full overflow-hidden bg-gray-50">
        <ImageLoader
          imageId={product.mainImageUrl}
          endpoint="detail"
          alt={product.name}
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

export function CollectionProductsClient({
  storeId,
  categoryId,
  hasMorePages,
}: CollectionProductsClientProps) {
  const { data, isLoading, error, isFetchingNextPage, hasNextPage, fetchNextPage, ref } =
    useInfiniteScroll<CollectionPageResponse>({
      queryKey: ['collection-products', storeId, categoryId],
      queryFn: async ({ pageParam }) => {
        const params = new URLSearchParams({
          page: String(pageParam),
          pageSize: '20',
        })
        const res = await api.get<{ success: boolean; data: CollectionPageResponse | null }>(
          `/stores/${storeId}/categories/${categoryId}/products?${params.toString()}`,
          { auth: false },
        )
        if (!res.success || !res.data) throw new Error('Failed to load products')
        return res.data
      },
      getNextPageParam: (lastPage) =>
        lastPage.products.hasNextPage ? lastPage.products.currentPage + 1 : undefined,
      // Start from page 2 — page 1 is server-rendered
      initialPageParam: 2,
    })

  if (!hasMorePages && !isLoading) return null

  const clientProducts = data?.pages.flatMap((p) =>
    p.products.items.map((item) => ({
      id: item.id,
      name: item.name,
      mainImageUrl: item.mainImageUrl ?? '',
      sellingPrice: item.sellingPrice,
      mrp: item.mrp ?? item.sellingPrice,
      shopifyHandle: item.shopifyHandle,
    }))
  ) ?? []

  if (isLoading) return <ProductGridShimmer />
  if (error) return <ErrorState message="Failed to load more products." />

  return (
    <>
      {clientProducts.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {clientProducts.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}

      <div ref={ref} className="col-span-full flex justify-center py-6">
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
    </>
  )
}
