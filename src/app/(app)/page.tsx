'use client'

/**
 * FeedPage — Home feed screen.
 *
 * Features:
 *  - Master category icon row (Fashion, Footwear, Electronics, Cosmetics, Accessories)
 *  - Gender filter tabs (Men / Women / Kids) — hidden when Electronics is selected (Req 7.3)
 *  - Featured banner carousel (auto-scrolls every 4s)
 *  - Infinite-scroll store list via useInfiniteScroll
 *  - Pull-to-refresh via TanStack Query refetch
 *  - Skeleton shimmer during initial load (Req 7.14)
 *  - Error state with Retry button (Req 7.15)
 *  - Empty state with Clear Filters CTA (Req 7.16)
 *
 * Requirements: 7.1–7.16, 25.2, 25.6
 */

import React, { useState, useCallback, useRef } from 'react'
import {
  Shirt,
  Footprints,
  Cpu,
  Sparkles,
  Watch,
  RefreshCw,
  Loader2,
} from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll'
import { api } from '@/lib/api/apiClient'
import { ShimmerCard, EmptyState, ErrorState } from '@/components/shared'
import { FeedStoreCard } from '@/components/feed/FeedStoreCard'
import { BannerCarousel } from '@/components/feed/BannerCarousel'
import type { PaginatedFeedResponse, ApiResponse } from '@/types/feed'
import type { Banner } from '@/components/feed/BannerCarousel'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

type MasterCategory = 'Fashion' | 'Footwear' | 'Electronics' | 'Cosmetics' | 'Accessories'
type GenderFilter = 'Men' | 'Women' | 'Kids'

const MASTER_CATEGORIES: { label: MasterCategory; icon: React.ReactNode }[] = [
  { label: 'Fashion',     icon: <Shirt     size={22} aria-hidden="true" /> },
  { label: 'Footwear',    icon: <Footprints size={22} aria-hidden="true" /> },
  { label: 'Electronics', icon: <Cpu       size={22} aria-hidden="true" /> },
  { label: 'Cosmetics',   icon: <Sparkles  size={22} aria-hidden="true" /> },
  { label: 'Accessories', icon: <Watch     size={22} aria-hidden="true" /> },
]

const GENDER_FILTERS: GenderFilter[] = ['Men', 'Women', 'Kids']

// Placeholder banners — in production these would come from an API endpoint
const PLACEHOLDER_BANNERS: Banner[] = []

// ---------------------------------------------------------------------------
// Skeleton loader
// ---------------------------------------------------------------------------

function FeedSkeleton() {
  return (
    <div className="space-y-4" aria-busy="true" aria-label="Loading feed…">
      {Array.from({ length: 3 }, (_, i) => (
        <div
          key={i}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden p-4 space-y-3"
        >
          {/* Store header skeleton */}
          <div className="flex items-center gap-3">
            <ShimmerCard width={48} height={48} className="rounded-full" />
            <div className="flex-1 space-y-2">
              <ShimmerCard width="60%" height={14} />
              <ShimmerCard width="40%" height={12} />
            </div>
            <ShimmerCard width={72} height={32} className="rounded-full" />
          </div>
          {/* Product row skeleton */}
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
// Pull-to-refresh hook
// ---------------------------------------------------------------------------

function usePullToRefresh(onRefresh: () => void) {
  const startYRef = useRef<number | null>(null)
  const [isPulling, setIsPulling] = useState(false)

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    // Only trigger if scrolled to top
    if (window.scrollY === 0) {
      startYRef.current = e.touches[0]?.clientY ?? null
    }
  }, [])

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (startYRef.current === null) return
      const delta = (e.touches[0]?.clientY ?? 0) - startYRef.current
      if (delta > 60) {
        setIsPulling(true)
      }
    },
    [],
  )

  const handleTouchEnd = useCallback(() => {
    if (isPulling) {
      onRefresh()
    }
    setIsPulling(false)
    startYRef.current = null
  }, [isPulling, onRefresh])

  return { isPulling, handleTouchStart, handleTouchMove, handleTouchEnd }
}

// ---------------------------------------------------------------------------
// FeedPage
// ---------------------------------------------------------------------------

export default function FeedPage() {
  const queryClient = useQueryClient()

  // Active filters
  const [activeCategory, setActiveCategory] = useState<MasterCategory | null>(null)
  const [activeGender, setActiveGender] = useState<GenderFilter | null>(null)

  // Electronics hides gender tabs (Req 7.3)
  const showGenderTabs = activeCategory !== 'Electronics'

  // -------------------------------------------------------------------------
  // Infinite scroll feed query
  // -------------------------------------------------------------------------
  const queryKey = ['feed', activeCategory, activeGender]

  const { data, isLoading, error, ref, isFetchingNextPage, hasNextPage } =
    useInfiniteScroll<PaginatedFeedResponse>({
      queryKey,
      queryFn: async ({ pageParam }) => {
        const params = new URLSearchParams()
        params.set('page', String(pageParam))
        if (activeCategory) params.set('category', activeCategory.toUpperCase())
        if (activeGender) params.set('gender', activeGender.toLowerCase())
        // Backend wraps response in ApiResponse<PaginatedFeedResponse>
        const wrapped = await api.get<ApiResponse<PaginatedFeedResponse>>(
          `/feed/stores?${params.toString()}`,
          { auth: false }
        )
        if (!wrapped.success || !wrapped.data) {
          throw new Error(wrapped.message || 'Failed to load feed')
        }
        return wrapped.data
      },
      getNextPageParam: (lastPage) =>
        lastPage.hasNextPage ? lastPage.currentPage + 1 : undefined,
      initialPageParam: 1,
    })

  // Flatten pages into a single store list
  const stores = data?.pages.flatMap((page) => page.stores) ?? []

  // -------------------------------------------------------------------------
  // Pull-to-refresh (Req 7.12)
  // -------------------------------------------------------------------------
  const handleRefresh = useCallback(() => {
    queryClient.invalidateQueries({ queryKey })
  }, [queryClient, queryKey])

  const { isPulling, handleTouchStart, handleTouchMove, handleTouchEnd } =
    usePullToRefresh(handleRefresh)

  // -------------------------------------------------------------------------
  // Filter handlers
  // -------------------------------------------------------------------------
  const handleCategorySelect = useCallback((category: MasterCategory) => {
    setActiveCategory((prev) => (prev === category ? null : category))
    // Clear gender filter when switching to Electronics (Req 7.3)
    if (category === 'Electronics') {
      setActiveGender(null)
    }
  }, [])

  const handleGenderSelect = useCallback((gender: GenderFilter) => {
    setActiveGender((prev) => (prev === gender ? null : gender))
  }, [])

  const handleClearFilters = useCallback(() => {
    setActiveCategory(null)
    setActiveGender(null)
  }, [])

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------
  return (
    <main
      className="min-h-screen bg-gray-50"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull-to-refresh indicator */}
      {isPulling && (
        <div
          className="flex items-center justify-center py-3 bg-blue-50 text-blue-600 text-sm font-medium gap-2"
          aria-live="polite"
          aria-label="Release to refresh"
        >
          <RefreshCw size={16} className="animate-spin" aria-hidden="true" />
          Release to refresh
        </div>
      )}

      <div className="max-w-2xl mx-auto px-4 pb-24 space-y-4">
        {/* ---------------------------------------------------------------- */}
        {/* Master category icon row (Req 7.1)                               */}
        {/* ---------------------------------------------------------------- */}
        <section aria-label="Browse by category" className="pt-4">
          <div
            className="flex gap-2 overflow-x-auto scrollbar-hide pb-1"
            role="list"
          >
            {MASTER_CATEGORIES.map(({ label, icon }) => {
              const isActive = activeCategory === label
              return (
                <button
                  key={label}
                  type="button"
                  role="listitem"
                  aria-pressed={isActive}
                  aria-label={`Filter by ${label}`}
                  onClick={() => handleCategorySelect(label)}
                  className={[
                    'flex-shrink-0 flex flex-col items-center gap-1.5',
                    'min-w-[64px] px-3 py-2.5 rounded-2xl',
                    'text-xs font-medium transition-colors',
                    'focus-visible:outline focus-visible:outline-2',
                    'focus-visible:outline-offset-2 focus-visible:outline-blue-600',
                    isActive
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50',
                  ].join(' ')}
                >
                  {icon}
                  {label}
                </button>
              )
            })}
          </div>
        </section>

        {/* ---------------------------------------------------------------- */}
        {/* Gender filter tabs (Req 7.3, 7.4) — hidden for Electronics       */}
        {/* ---------------------------------------------------------------- */}
        {showGenderTabs && (
          <section aria-label="Filter by gender">
            <div
              className="flex gap-2"
              role="tablist"
              aria-label="Gender filter"
            >
              {GENDER_FILTERS.map((gender) => {
                const isActive = activeGender === gender
                return (
                  <button
                    key={gender}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => handleGenderSelect(gender)}
                    className={[
                      'flex-1 py-2 rounded-xl text-sm font-medium',
                      'transition-colors border',
                      'focus-visible:outline focus-visible:outline-2',
                      'focus-visible:outline-offset-2 focus-visible:outline-blue-600',
                      isActive
                        ? 'bg-blue-600 border-blue-600 text-white'
                        : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50',
                    ].join(' ')}
                  >
                    {gender}
                  </button>
                )
              })}
            </div>
          </section>
        )}

        {/* ---------------------------------------------------------------- */}
        {/* Banner carousel (Req 7.5)                                         */}
        {/* ---------------------------------------------------------------- */}
        {PLACEHOLDER_BANNERS.length > 0 && (
          <section aria-label="Featured promotions">
            <BannerCarousel banners={PLACEHOLDER_BANNERS} />
          </section>
        )}

        {/* ---------------------------------------------------------------- */}
        {/* Feed content                                                      */}
        {/* ---------------------------------------------------------------- */}
        <section aria-label="Store feed" aria-live="polite">
          {/* Initial loading skeleton (Req 7.14) */}
          {isLoading && <FeedSkeleton />}

          {/* Error state (Req 7.15) */}
          {!isLoading && error && (
            <ErrorState
              message="Failed to load the feed. Please check your connection and try again."
              onRetry={handleRefresh}
            />
          )}

          {/* Empty state (Req 7.16) */}
          {!isLoading && !error && stores.length === 0 && (
            <EmptyState
              heading="No stores found"
              body={
                activeCategory || activeGender
                  ? 'No stores match your current filters. Try clearing them to see more.'
                  : 'No stores available right now. Check back soon!'
              }
              ctaLabel={activeCategory || activeGender ? 'Clear Filters' : undefined}
              onCta={activeCategory || activeGender ? handleClearFilters : undefined}
            />
          )}

          {/* Store list (Req 7.6) */}
          {!isLoading && !error && stores.length > 0 && (
            <div className="space-y-4">
              {stores.map((store, index) => {
                // Attach sentinel ref to the 3rd-from-last card (Req 7.13)
                const isSentinel = index === stores.length - 3
                return (
                  <div key={store.businessId} ref={isSentinel ? ref : undefined}>
                    <FeedStoreCard store={store} />
                  </div>
                )
              })}

              {/* Sentinel fallback — always at the very end */}
              <div ref={ref} aria-hidden="true" />

              {/* Loading next page indicator */}
              {isFetchingNextPage && (
                <div
                  className="flex items-center justify-center py-6 text-gray-400 gap-2"
                  aria-live="polite"
                  aria-label="Loading more stores…"
                >
                  <Loader2 size={20} className="animate-spin" aria-hidden="true" />
                  <span className="text-sm">Loading more…</span>
                </div>
              )}

              {/* End of list */}
              {!hasNextPage && stores.length > 0 && (
                <p className="text-center text-xs text-gray-400 py-4">
                  You&apos;ve seen all stores
                </p>
              )}
            </div>
          )}
        </section>
      </div>
    </main>
  )
}
