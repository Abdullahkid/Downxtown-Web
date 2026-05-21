'use client'

/**
 * CategoryFeedClient — infinite-scroll feed for a single category.
 *
 * Receives the initial page of stores (server-fetched for SEO) and continues
 * loading from page 2 via the browser. Also owns the gender filter tabs since
 * those are client-side UI state.
 *
 * Uses the same /feed/filtered endpoint as the home feed category filter,
 * keeping behaviour 100% consistent.
 *
 * Requirements: 7.1–7.16
 */

import React, { useState, useCallback } from 'react'
import { Loader2 } from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll'
import { api } from '@/lib/api/apiClient'
import { FeedStoreCard } from '@/components/feed/FeedStoreCard'
import { ShimmerCard, EmptyState, ErrorState } from '@/components/shared'
import type { PaginatedFeedResponse, ApiResponse, FeedStore } from '@/types/feed'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type GenderParam = 'men' | 'women' | null

const GENDER_TABS: { label: string; value: GenderParam }[] = [
  { label: 'All',   value: null },
  { label: 'Men',   value: 'men' },
  { label: 'Women', value: 'women' },
]

interface CategoryFeedClientProps {
  /** API category value e.g. "FASHION" */
  apiValue: string
  /** Initial stores from SSR — avoids a client-side waterfall on first load */
  initialStores: FeedStore[]
  /** Whether there are more pages beyond the initial SSR page */
  hasMorePages: boolean
  /** Show gender tabs — hidden for Electronics */
  showGenderTabs: boolean
}

// ---------------------------------------------------------------------------
// Skeleton
// ---------------------------------------------------------------------------

function FeedSkeleton() {
  return (
    <div className="space-y-4" aria-busy="true" aria-label="Loading stores…">
      {Array.from({ length: 3 }, (_, i) => (
        <div
          key={i}
          className="bg-bg-3 rounded-2xl border border-border overflow-hidden p-4 space-y-3"
        >
          <div className="flex items-center gap-3">
            <ShimmerCard width={48} height={48} className="rounded-full" />
            <div className="flex-1 space-y-2">
              <ShimmerCard width="60%" height={14} />
              <ShimmerCard width="40%" height={12} />
            </div>
            <ShimmerCard width={72} height={32} className="rounded-full" />
          </div>
          <div className="flex gap-3 overflow-hidden">
            {Array.from({ length: 3 }, (_, j) => (
              <ShimmerCard key={j} width={128} height={160} className="flex-shrink-0 rounded-xl" />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function CategoryFeedClient({
  apiValue,
  initialStores,
  hasMorePages,
  showGenderTabs,
}: CategoryFeedClientProps) {
  const queryClient = useQueryClient()
  const [activeGender, setActiveGender] = useState<GenderParam>(null)

  const handleGenderSelect = useCallback((value: GenderParam) => {
    setActiveGender((prev) => (prev === value ? null : value))
    // Invalidate so the feed reloads with the new gender filter
    queryClient.removeQueries({ queryKey: ['category-feed', apiValue] })
  }, [queryClient, apiValue])

  const queryKey = ['category-feed', apiValue, activeGender] as const

  const {
    data,
    isLoading,
    error,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    ref: sentinelRef,
  } = useInfiniteScroll<PaginatedFeedResponse>({
    queryKey,
    queryFn: async ({ pageParam, queryKey: key }) => {
      const [, category, gender] = key as typeof queryKey
      const params = new URLSearchParams()
      params.set('page', String(pageParam))
      params.set('limit', '10')
      params.set('productsPerStore', '5')
      if (gender) params.set('gender', gender)

      const wrapped = await api.get<ApiResponse<PaginatedFeedResponse>>(
        `/feed/filtered?category=${category}&${params.toString()}`,
        { auth: false },
      )
      if (!wrapped.success || !wrapped.data) {
        throw new Error(wrapped.message || 'Failed to load feed')
      }
      return wrapped.data
    },
    getNextPageParam: (lastPage) =>
      lastPage.hasNextPage ? lastPage.currentPage + 1 : undefined,
    // Start from page 2 — page 1 was already server-rendered.
    // When the gender filter changes, reset to page 1 since initialStores
    // don't apply (they were fetched without a gender filter).
    initialPageParam: activeGender !== null ? 1 : 2,
  })

  // Merge: show SSR stores first (when no gender filter), then client pages
  const clientStores = data?.pages.flatMap((p) => p.stores) ?? []
  const stores = activeGender === null
    ? [...initialStores, ...clientStores]
    : clientStores

  const handleRefresh = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['category-feed', apiValue, activeGender] })
  }, [queryClient, apiValue, activeGender])

  return (
    <div className="space-y-5">
      {/* Gender filter tabs — hidden for Electronics */}
      {showGenderTabs && (
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
      )}

      {/* Feed content */}
      <section aria-label="Store feed" aria-live="polite">
        {/* Initial load shimmer — only when client is taking over from SSR
            and the gender filter is active (no initialStores available) */}
        {isLoading && activeGender !== null && <FeedSkeleton />}

        {!isLoading && error && (
          <ErrorState
            message="Failed to load stores. Please check your connection and try again."
            onRetry={handleRefresh}
          />
        )}

        {stores.length === 0 && !isLoading && !error && (
          <EmptyState
            heading="No stores found"
            body="No stores match your current filter. Try selecting a different gender."
          />
        )}

        {stores.length > 0 && (
          <div className="space-y-4 md:grid md:grid-cols-2 md:gap-4 xl:gap-5 md:space-y-0">
            {stores.map((store) => (
              <div key={store.businessId}>
                <FeedStoreCard store={store} />
              </div>
            ))}

            {/* Infinite scroll sentinel */}
            <div
              ref={sentinelRef}
              className="col-span-full flex flex-col items-center justify-center pt-8 pb-4"
            >
              {isFetchingNextPage ? (
                <div
                  className="flex items-center justify-center py-6 text-text-3 gap-2"
                  aria-live="polite"
                  aria-label="Loading more stores…"
                >
                  <Loader2 size={20} className="animate-spin text-brand" aria-hidden="true" />
                  <span className="text-sm font-medium">Loading more…</span>
                </div>
              ) : hasNextPage ? (
                <button
                  onClick={() => fetchNextPage()}
                  className={[
                    'px-8 py-3 rounded-full font-bold text-sm tracking-wide',
                    'bg-surface border border-border text-brand hover:bg-bg-3',
                    'transition-colors focus-visible:outline focus-visible:outline-2',
                    'focus-visible:outline-offset-2 focus-visible:outline-brand',
                  ].join(' ')}
                >
                  Load more
                </button>
              ) : stores.length > 0 ? (
                <p className="text-center text-xs text-text-3 font-medium">
                  You&apos;ve seen all stores
                </p>
              ) : null}
            </div>
          </div>
        )}
      </section>
    </div>
  )
}
