'use client'

/**
 * StoreCategories — expandable category list with products.
 *
 * Each category row can be expanded to reveal its product grid.
 * Tapping a product navigates to the Product Page.
 *
 * Requirements: 9.7
 */

import React, { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { ImageLoader } from '@/lib/image/imageLoader'
import { ShimmerCard } from '@/components/shared/ShimmerCard'
import { EmptyState } from '@/components/shared/EmptyState'
import { ErrorState } from '@/components/shared/ErrorState'
import { formatPrice } from '@/lib/utils/urlBuilders'
import { api } from '@/lib/api/apiClient'
import type { StoreCategory, StoreCategoryProduct, StoreCategoriesResponse } from '@/types/store'

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface StoreCategoriesProps {
  storeId: string
}

// ---------------------------------------------------------------------------
// Category row
// ---------------------------------------------------------------------------

function CategoryRow({ category, storeId }: { category: StoreCategory; storeId: string }) {
  const router = useRouter()
  const [expanded, setExpanded] = useState(false)
  const [products, setProducts] = useState<StoreCategoryProduct[]>([])
  const [loadingProducts, setLoadingProducts] = useState(false)

  const toggle = useCallback(async () => {
    const next = !expanded
    setExpanded(next)
    if (next && products.length === 0) {
      setLoadingProducts(true)
      try {
        const res = await api.get<{
          success: boolean
          data: {
            category: { id: string; name: string; productCount: number }
            products: {
              items: Array<{
                id: string
                title?: string
                name?: string
                mainImageUrl?: string
                sellingPrice: number
                mrp?: number
              }>
            }
          } | null
        }>(`/stores/${storeId}/categories/${category.id}/products`, { auth: false })
        if (res.success && res.data) {
          setProducts(res.data.products.items.map(p => ({
            id: p.id,
            name: p.title ?? p.name ?? '',
            mainImageUrl: p.mainImageUrl ?? '',
            sellingPrice: p.sellingPrice,
            mrp: p.mrp ?? p.sellingPrice,
          })))
        }
      } catch {
        // silently fail — empty state shown
      } finally {
        setLoadingProducts(false)
      }
    }
  }, [expanded, products.length, storeId, category.id])

  return (
    <div className="border-b border-gray-100 last:border-b-0">
      {/* Header row */}
      <button
        type="button"
        onClick={toggle}
        aria-expanded={expanded}
        aria-controls={`category-products-${category.id}`}
        className={[
          'flex w-full items-center justify-between px-4 py-3.5',
          'text-left transition-colors hover:bg-gray-50 active:bg-gray-100',
          'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-color,#6366f1)]',
          'min-h-[52px]',
        ].join(' ')}
      >
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-gray-900">
            {category.name}
          </span>
          <span className="text-xs text-gray-400">
            {category.productCount} product{category.productCount !== 1 ? 's' : ''}
          </span>
        </div>
        {expanded ? (
          <ChevronUp size={18} className="text-gray-500 shrink-0" aria-hidden="true" />
        ) : (
          <ChevronDown size={18} className="text-gray-500 shrink-0" aria-hidden="true" />
        )}
      </button>

      {/* Expandable product grid */}
      {expanded && (
        <div
          id={`category-products-${category.id}`}
          className="grid grid-cols-2 gap-3 px-4 pb-4"
        >
          {loadingProducts ? (
            <div className="col-span-2 py-4 flex justify-center">
              <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : products.length === 0 ? (
            <p className="col-span-2 py-4 text-center text-sm text-gray-400">
              No products in this category yet.
            </p>
          ) : (
            products.map((product) => {
              const discount =
                product.mrp > product.sellingPrice
                  ? Math.round(
                      ((product.mrp - product.sellingPrice) / product.mrp) * 100,
                    )
                  : 0

              return (
                <button
                  key={product.id}
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
                </button>
              )
            })
          )}
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Shimmer
// ---------------------------------------------------------------------------

function CategoriesShimmer() {
  return (
    <div className="flex flex-col gap-0">
      {Array.from({ length: 5 }, (_, i) => (
        <div key={i} className="flex items-center justify-between border-b border-gray-100 px-4 py-3.5">
          <div className="flex flex-col gap-1.5">
            <ShimmerCard height={14} className="w-32 rounded" />
            <ShimmerCard height={10} className="w-20 rounded" />
          </div>
          <ShimmerCard height={18} className="w-5 rounded" />
        </div>
      ))}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function StoreCategories({ storeId }: StoreCategoriesProps) {
  const { data, isLoading, error, refetch } = useQuery<StoreCategoriesResponse, Error>({
    queryKey: ['store-categories', storeId],
    queryFn: async () => {
      // Backend returns ApiResponse<PaginatedResponse<StoreCategoryResponse>>
      const res = await api.get<{
        success: boolean
        data: {
          items: Array<{
            id: string
            name: string
            description: string
            imageUrl?: string
            productCount: number
          }>
          totalItems: number
          totalPages: number
          currentPage: number
        } | null
      }>(`/stores/${storeId}/categories`, { auth: false })

      if (!res.success || !res.data) return { categories: [] }

      // Map to the StoreCategoriesResponse shape the component expects
      return {
        categories: res.data.items.map(item => ({
          id: item.id,
          name: item.name,
          productCount: item.productCount,
          products: [], // Products loaded separately when expanded
        })),
      }
    },
    staleTime: 5 * 60 * 1000,
  })

  if (isLoading) return <CategoriesShimmer />

  if (error) {
    return (
      <ErrorState
        message="Failed to load categories"
        onRetry={() => refetch()}
      />
    )
  }

  const categories = data?.categories ?? []

  if (categories.length === 0) {
    return (
      <EmptyState
        heading="No categories yet"
        body="This store hasn't organised its products into categories."
      />
    )
  }

  return (
    <div className="pb-6">
      {categories.map((category) => (
        <CategoryRow key={category.id} category={category} storeId={storeId} />
      ))}
    </div>
  )
}
