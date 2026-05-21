'use client'

/**
 * StoreCategories — image card grid of store collections.
 *
 * Each card shows the collection image, name, and product count.
 * Tapping a card navigates to /store/{username}/collection/{categoryId}
 * — a dedicated server-rendered page with its own URL, metadata, and
 * JSON-LD, making each collection indexable by Google.
 *
 * Requirements: 9.7
 */

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useQuery } from '@tanstack/react-query'
import { Package } from 'lucide-react'
import { ShimmerCard } from '@/components/shared/ShimmerCard'
import { EmptyState } from '@/components/shared/EmptyState'
import { ErrorState } from '@/components/shared/ErrorState'
import { api } from '@/lib/api/apiClient'
import type { StoreCategory } from '@/types/store'

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface StoreCategoriesProps {
  storeId: string
  storeUsername: string
}

// ---------------------------------------------------------------------------
// Category card
// ---------------------------------------------------------------------------

function CategoryCard({
  category,
  storeUsername,
}: {
  category: StoreCategory
  storeUsername: string
}) {
  const href = `/store/${storeUsername}/collection/${category.id}`
  const hasImage = Boolean(category.imageUrl)

  return (
    <Link
      href={href}
      className={[
        'group flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white',
        'shadow-sm hover:shadow-md active:scale-[0.98] transition-all duration-150',
        'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2',
        'focus-visible:outline-[var(--brand-color,#6366f1)]',
      ].join(' ')}
      aria-label={`${category.name} — ${category.productCount} products`}
    >
      {/* Category image */}
      <div className="relative aspect-square w-full overflow-hidden bg-gray-50">
        {hasImage ? (
          <Image
            src={category.imageUrl!}
            alt={category.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            unoptimized={category.imageUrl!.startsWith('https://cdn.shopify.com')}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gray-100">
            <Package size={32} className="text-gray-300" aria-hidden="true" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-col gap-0.5 p-3">
        <p className="text-sm font-semibold text-gray-900 line-clamp-2 leading-snug">
          {category.name}
        </p>
        <p className="text-xs text-gray-400 mt-0.5">
          {category.productCount} product{category.productCount !== 1 ? 's' : ''}
        </p>
      </div>
    </Link>
  )
}

// ---------------------------------------------------------------------------
// Shimmer grid
// ---------------------------------------------------------------------------

function CategoriesShimmer() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 px-4 pb-6">
      {Array.from({ length: 6 }, (_, i) => (
        <div key={i} className="flex flex-col gap-2">
          <ShimmerCard className="aspect-square w-full rounded-2xl" />
          <ShimmerCard height={14} className="w-3/4 rounded" />
          <ShimmerCard height={10} className="w-1/2 rounded" />
        </div>
      ))}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function StoreCategories({ storeId, storeUsername }: StoreCategoriesProps) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['store-categories', storeId],
    queryFn: async () => {
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

      if (!res.success || !res.data) return []

      return res.data.items.map<StoreCategory>((item) => ({
        id: item.id,
        name: item.name,
        imageUrl: item.imageUrl,
        productCount: item.productCount,
        products: [],
      }))
    },
    staleTime: 5 * 60 * 1000,
  })

  if (isLoading) return <CategoriesShimmer />

  if (error) {
    return (
      <div className="px-4">
        <ErrorState message="Failed to load collections" onRetry={() => refetch()} />
      </div>
    )
  }

  const categories = data ?? []

  if (categories.length === 0) {
    return (
      <div className="px-4">
        <EmptyState
          heading="No collections yet"
          body="This store hasn't organised its products into collections."
        />
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 px-4 pb-6 pt-3">
      {categories.map((category) => (
        <CategoryCard
          key={category.id}
          category={category}
          storeUsername={storeUsername}
        />
      ))}
    </div>
  )
}
