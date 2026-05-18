'use client'

/**
 * FeedPage — Home feed screen. Publicly accessible — no login required.
 *
 * Category filter logic mirrors the Android FeedRepository exactly:
 *  - No category selected  → GET /feed/stores          (public trending)
 *  - Category selected     → GET /feed/filtered?category=FASHION&...
 *
 * Bugs fixed vs previous version:
 *  1. Stale closure — queryFn now reads filter values from queryKey (the
 *     context object) instead of the outer closure, so TanStack Query always
 *     fetches with the correct params when the key changes.
 *  2. Wrong endpoint — category-filtered requests now go to /feed/filtered
 *     (matching Android), not /feed/stores which ignores the category param.
 *  3. "All" gender tab never appeared selected — activeGender is now a
 *     nullable string ('men'|'women'|null); "All" is active when null.
 *  4. Infinite-scroll sentinel ref was never attached — the ref returned by
 *     useInfiniteScroll is now wired to a sentinel div at the list bottom.
 *
 * Requirements: 7.1–7.16, 25.2, 25.6
 */

import React, { useState, useCallback, useRef } from 'react'
import Image from 'next/image'
import { RefreshCw, Loader2 } from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll'
import { api } from '@/lib/api/apiClient'
import { ShimmerCard, EmptyState, ErrorState } from '@/components/shared'
import { FeedStoreCard } from '@/components/feed/FeedStoreCard'
import { BannerCarousel } from '@/components/feed/BannerCarousel'
import type { PaginatedFeedResponse, ApiResponse } from '@/types/feed'
import type { Banner } from '@/components/feed/BannerCarousel'

// ---------------------------------------------------------------------------
// Types & constants
// ---------------------------------------------------------------------------

type MasterCategory = 'Fashion' | 'Footwear' | 'Electronics' | 'Cosmetics' | 'Accessories'

/** API gender param value — null means "All" (no filter sent) */
type GenderParam = 'men' | 'women' | null

const MASTER_CATEGORIES: { label: MasterCategory; imageSrc: string }[] = [
  { label: 'Fashion',     imageSrc: '/categories/fashion.webp' },
  { label: 'Footwear',    imageSrc: '/categories/footwear.webp' },
  { label: 'Electronics', imageSrc: '/categories/electronics.webp' },
  { label: 'Cosmetics',   imageSrc: '/categories/cosmetics.webp' },
  { label: 'Accessories', imageSrc: '/categories/accessories.webp' },
]

/** Display labels for the gender tabs */
const GENDER_TABS: { label: string; value: GenderParam }[] = [
  { label: 'All',   value: null },
  { label: 'Men',   value: 'men' },
  { label: 'Women', value: 'women' },
]

// Placeholder banners — replace with a real API call when the endpoint is ready
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
// Pull-to-refresh hook
// ---------------------------------------------------------------------------

function usePullToRefresh(onRefresh: () => void) {
  const startYRef = useRef<number | null>(null)
  const [isPulling, setIsPulling] = useState(false)

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (window.scrollY === 0) {
      startYRef.current = e.touches[0]?.clientY ?? null
    }
  }, [])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (startYRef.current === null) return
    const delta = (e.touches[0]?.clientY ?? 0) - startYRef.current
    if (delta > 60) setIsPulling(true)
  }, [])

  const handleTouchEnd = useCallback(() => {
    if (isPulling) onRefresh()
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

  const [activeCategory, setActiveCategory] = useState<MasterCategory | null>(null)
  const [activeGender, setActiveGender] = useState<GenderParam>(null)

  // Electronics hides gender tabs (Req 7.3)
  const showGenderTabs = activeCategory !== 'Electronics'

  // -------------------------------------------------------------------------
  // Infinite scroll feed query
  //
  // FIX 1 (stale closure): filter values are embedded in queryKey so TanStack
  // Query creates a fresh query entry on every filter change. The queryFn
  // reads them from the queryKey array (via the context object) rather than
  // the outer closure — this guarantees the correct params are always used.
  //
  // FIX 2 (wrong endpoint): mirrors Android FeedRepository logic exactly:
  //   - no category → /feed/stores  (public trending, no category param)
  //   - category selected → /feed/filtered?category=FASHION  (filtered feed)
  // -------------------------------------------------------------------------
  const queryKey = ['feed', activeCategory, activeGender] as const

  const { data, isLoading, error, isFetchingNextPage, hasNextPage, fetchNextPage, ref: sentinelRef } =
    useInfiniteScroll<PaginatedFeedResponse>({
      queryKey,
      queryFn: async ({ pageParam, queryKey: key }) => {
        // Read filter values from the queryKey so this function is never stale
        const [, category, gender] = key as typeof queryKey

        const params = new URLSearchParams()
        params.set('page', String(pageParam))
        params.set('limit', '10')
        params.set('productsPerStore', '5')
        if (gender) params.set('gender', gender)

        // Mirror Android: use /feed/filtered when a category is active,
        // /feed/stores for the default "All" view.
        const endpoint = category
          ? `/feed/filtered?category=${category.toUpperCase()}&${params.toString()}`
          : `/feed/stores?${params.toString()}`

        const wrapped = await api.get<ApiResponse<PaginatedFeedResponse>>(endpoint, { auth: false })

        if (!wrapped.success || !wrapped.data) {
          throw new Error(wrapped.message || 'Failed to load feed')
        }
        return wrapped.data
      },
      getNextPageParam: (lastPage) =>
        lastPage.hasNextPage ? lastPage.currentPage + 1 : undefined,
      initialPageParam: 1,
    })

  const stores = data?.pages.flatMap((page) => page.stores) ?? []

  // -------------------------------------------------------------------------
  // Pull-to-refresh (Req 7.12)
  // -------------------------------------------------------------------------
  const handleRefresh = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['feed', activeCategory, activeGender] })
  }, [queryClient, activeCategory, activeGender])

  const { isPulling, handleTouchStart, handleTouchMove, handleTouchEnd } =
    usePullToRefresh(handleRefresh)

  // -------------------------------------------------------------------------
  // Filter handlers
  // -------------------------------------------------------------------------
  const handleCategorySelect = useCallback((category: MasterCategory) => {
    setActiveCategory((prev) => (prev === category ? null : category))
    // Reset gender when switching to Electronics (Req 7.3)
    if (category === 'Electronics') setActiveGender(null)
  }, [])

  // FIX 3 (gender "All" tab): activeGender is null for "All", so the tab is
  // active when value === null and activeGender === null.
  const handleGenderSelect = useCallback((value: GenderParam) => {
    setActiveGender((prev) => (prev === value ? null : value))
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
      className="min-h-screen bg-background"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {isPulling && (
        <div
          className="flex items-center justify-center py-3 bg-brand/10 text-brand text-sm font-medium gap-2"
          aria-live="polite"
          aria-label="Release to refresh"
        >
          <RefreshCw size={16} className="animate-spin" aria-hidden="true" />
          Release to refresh
        </div>
      )}

      <div className="max-w-[1320px] mx-auto px-2 md:px-4 xl:px-6 pb-24 space-y-5">

        {/* ---------------------------------------------------------------- */}
        {/* Master category icon row (Req 7.1)                               */}
        {/* ---------------------------------------------------------------- */}
        <section aria-label="Browse by category">
          <div className="flex gap-2.5 overflow-x-auto scrollbar-hide pb-1" role="list">
            {MASTER_CATEGORIES.map(({ label, imageSrc }) => {
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
                    'min-w-[78px] px-2 py-1.5 rounded-xl',
                    'text-xs font-medium transition-colors',
                    'focus-visible:outline focus-visible:outline-2',
                    'focus-visible:outline-offset-2 focus-visible:outline-brand',
                    isActive ? 'text-brand-accent' : 'text-text-2 hover:text-text-1',
                  ].join(' ')}
                >
                  <span
                    className={[
                      'relative h-11 w-11 md:h-12 md:w-12 lg:h-14 lg:w-14',
                      'overflow-hidden rounded-[9px] lg:rounded-[10px]',
                      isActive
                        ? 'ring-2 ring-brand-accent/70 ring-offset-1 ring-offset-background'
                        : '',
                    ].join(' ')}
                  >
                    <Image
                      src={imageSrc}
                      alt={`${label} category`}
                      fill
                      sizes="(max-width: 768px) 44px, (max-width: 1024px) 48px, 56px"
                      className="object-cover rounded-[6px]"
                    />
                  </span>
                  {label}
                </button>
              )
            })}
          </div>
        </section>

        {/* ---------------------------------------------------------------- */}
        {/* Gender filter tabs (Req 7.3, 7.4)                                */}
        {/* FIX 3: "All" tab is active when activeGender === null (value===null) */}
        {/* ---------------------------------------------------------------- */}
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
                      'flex-1 py-2 rounded-xl text-sm font-medium',
                      'transition-colors border',
                      'focus-visible:outline focus-visible:outline-2',
                      'focus-visible:outline-offset-2 focus-visible:outline-brand',
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

        {/* Banner carousel (Req 7.5) */}
        {PLACEHOLDER_BANNERS.length > 0 && (
          <section aria-label="Featured promotions">
            <BannerCarousel banners={PLACEHOLDER_BANNERS} />
          </section>
        )}

        {/* ---------------------------------------------------------------- */}
        {/* Feed content                                                      */}
        {/* ---------------------------------------------------------------- */}
        <section aria-label="Store feed" aria-live="polite">
          {isLoading && <FeedSkeleton />}

          {!isLoading && error && (
            <ErrorState
              message="Failed to load the feed. Please check your connection and try again."
              onRetry={handleRefresh}
            />
          )}

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

          {!isLoading && !error && stores.length > 0 && (
            <div className="space-y-4 md:grid md:grid-cols-2 md:gap-4 xl:gap-5 md:space-y-0">
              {stores.map((store) => (
                <div key={store.businessId}>
                  <FeedStoreCard store={store} />
                </div>
              ))}

              {/* ---------------------------------------------------------- */}
              {/* Infinite scroll sentinel + fallback button (Req 7.13)       */}
              {/* FIX 4: sentinelRef is now attached so the IntersectionObserver */}
              {/* auto-fetches the next page when this div enters the viewport. */}
              {/* ---------------------------------------------------------- */}
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
                  // Fallback manual trigger (e.g. if IntersectionObserver is unavailable)
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
                    You&apos;ve seen all stores
                  </p>
                )}
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  )
}
