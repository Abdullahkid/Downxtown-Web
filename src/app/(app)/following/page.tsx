'use client'

/**
 * Following page — shows a feed of stores the authenticated user follows.
 *
 * Uses the same FeedStoreCard and infinite-scroll pattern as the home feed.
 * Accessible from:
 *  - Profile page → "Following" card
 *  - SideRail → "Following" nav item (desktop)
 *
 * Requirements: mirrors FeedPageClient (7.1–7.16) but scoped to followed stores only.
 */

import React, { useCallback } from 'react'
import { Heart, Loader2 } from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll'
import { api } from '@/lib/api/apiClient'
import { ShimmerCard, EmptyState, ErrorState, AuthGuard } from '@/components/shared'
import { FeedStoreCard } from '@/components/feed/FeedStoreCard'
import type { PaginatedFeedResponse, ApiResponse } from '@/types/feed'

// ---------------------------------------------------------------------------
// Skeleton
// ---------------------------------------------------------------------------

function FollowingSkeleton() {
  return (
    <div className="space-y-4" aria-busy="true" aria-label="Loading followed stores…">
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
// Page
// ---------------------------------------------------------------------------

export default function FollowingPage() {
  const queryClient = useQueryClient()
  const queryKey = ['following-feed'] as const

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
    queryFn: async ({ pageParam }) => {
      const params = new URLSearchParams()
      params.set('page', String(pageParam))
      params.set('limit', '10')
      params.set('productsPerStore', '8')

      const wrapped = await api.get<ApiResponse<PaginatedFeedResponse>>(
        `/feed/following?${params.toString()}`,
        { auth: true },
      )

      if (!wrapped.success || !wrapped.data) {
        throw new Error(wrapped.message || 'Failed to load followed stores')
      }
      return wrapped.data
    },
    getNextPageParam: (lastPage) =>
      lastPage.hasNextPage ? lastPage.currentPage + 1 : undefined,
    initialPageParam: 1,
  })

  const stores = data?.pages.flatMap((page) => page.stores) ?? []

  const handleRefresh = useCallback(() => {
    queryClient.invalidateQueries({ queryKey })
  }, [queryClient])

  return (
    <AuthGuard>
      <main className="min-h-screen bg-background">
      <div className="max-w-[1320px] mx-auto px-2 md:px-4 xl:px-6 pb-24 space-y-5">

        {/* Page header */}
        <section className="pt-4 pb-2">
          <div className="flex items-center gap-2">
            <Heart size={22} className="text-brand-accent" aria-hidden="true" />
            <h1 className="text-xl font-bold text-text-1">Following</h1>
          </div>
          <p className="text-sm text-text-3 mt-1">Stores you follow</p>
        </section>

        {/* Feed content */}
        <section aria-label="Followed stores feed" aria-live="polite">
          {isLoading && <FollowingSkeleton />}

          {!isLoading && error && (
            <ErrorState
              message="Failed to load your followed stores. Please check your connection and try again."
              onRetry={handleRefresh}
            />
          )}

          {!isLoading && !error && stores.length === 0 && (
            <EmptyState
              heading="You're not following any stores yet"
              body="Follow stores from the home feed to see their latest products here."
              ctaLabel="Explore stores"
              onCta={() => { window.location.href = '/' }}
            />
          )}

          {!isLoading && !error && stores.length > 0 && (
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
                ) : (
                  <p className="text-center text-xs text-text-3 font-medium">
                    You&apos;ve seen all followed stores
                  </p>
                )}
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
    </AuthGuard>
  )
}
