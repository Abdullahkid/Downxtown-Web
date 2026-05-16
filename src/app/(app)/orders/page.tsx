'use client'

/**
 * OrdersPage — buyer's order history screen.
 *
 * Features:
 *  - Filter chips: All, Pending, Confirmed, Processing, Shipped, Delivered,
 *    Cancelled, Returned
 *  - Search bar with 300ms debounce (filters by item name / order number)
 *  - Infinite scroll with pull-to-refresh
 *  - Skeleton placeholders during loading
 *  - Empty state with "Start Shopping" CTA when no filter is active
 *
 * Requirements: 13.1–13.11
 */

import React, { useState, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Search, RefreshCw, Loader2, ShoppingBag } from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll'
import { useDebounce } from '@/hooks/useDebounce'
import { api } from '@/lib/api/apiClient'
import { ShimmerCard, EmptyState, ErrorState } from '@/components/shared'
import { OrderCard } from '@/components/orders/OrderCard'
import type { OrderCardData } from '@/components/orders/OrderCard'
import type { ItemFulfillmentStatus } from '@/types/order'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface PaginatedOrdersResponse {
  orders: OrderCardData[]
  nextPage: number | null
}

// ---------------------------------------------------------------------------
// Filter chip definitions
// ---------------------------------------------------------------------------

type FilterOption = {
  label: string
  value: ItemFulfillmentStatus | 'ALL'
}

const FILTER_OPTIONS: FilterOption[] = [
  { label: 'All',        value: 'ALL'              },
  { label: 'Pending',    value: 'PENDING'           },
  { label: 'Confirmed',  value: 'CONFIRMED'         },
  { label: 'Processing', value: 'PROCESSING'        },
  { label: 'Shipped',    value: 'HANDED_TO_COURIER' },
  { label: 'Delivered',  value: 'DELIVERED'         },
  { label: 'Cancelled',  value: 'CUSTOMER_CANCELLED'},
  { label: 'Returned',   value: 'RETURNED'          },
]

// ---------------------------------------------------------------------------
// Skeleton loader
// ---------------------------------------------------------------------------

function OrderSkeleton() {
  return (
    <div
      className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-3"
      aria-busy="true"
      aria-label="Loading order…"
    >
      {/* Header row */}
      <div className="flex items-center justify-between">
        <ShimmerCard width="40%" height={14} />
        <ShimmerCard width={80} height={22} className="rounded-full" />
      </div>
      {/* Product row */}
      <div className="flex gap-3">
        <ShimmerCard width={64} height={64} className="rounded-xl flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <ShimmerCard width="80%" height={14} />
          <ShimmerCard width="50%" height={12} />
          <ShimmerCard width="30%" height={12} />
        </div>
      </div>
      {/* Footer row */}
      <div className="flex items-center justify-between pt-1 border-t border-gray-50">
        <ShimmerCard width={80} height={16} />
        <ShimmerCard width={60} height={12} />
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Pull-to-refresh hook (same pattern as FeedPage)
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
// OrdersPage
// ---------------------------------------------------------------------------

export default function OrdersPage() {
  const router = useRouter()
  const queryClient = useQueryClient()

  const [activeFilter, setActiveFilter] = useState<FilterOption['value']>('ALL')
  const [searchInput, setSearchInput] = useState('')
  const debouncedSearch = useDebounce(searchInput, 300)

  // -------------------------------------------------------------------------
  // Infinite scroll query
  // -------------------------------------------------------------------------
  const queryKey = ['orders', activeFilter, debouncedSearch]

  const { data, isLoading, error, ref, isFetchingNextPage, hasNextPage } =
    useInfiniteScroll<PaginatedOrdersResponse>({
      queryKey,
      queryFn: ({ pageParam }) => {
        const params = new URLSearchParams()
        params.set('page', String(pageParam))
        if (activeFilter !== 'ALL') params.set('status', activeFilter)
        if (debouncedSearch.trim()) params.set('q', debouncedSearch.trim())
        return api.get<PaginatedOrdersResponse>(`/buyer/orders?${params.toString()}`)
      },
      getNextPageParam: (lastPage) => lastPage.nextPage ?? undefined,
      initialPageParam: 1,
    })

  const orders = data?.pages.flatMap((page) => page.orders) ?? []

  // -------------------------------------------------------------------------
  // Pull-to-refresh
  // -------------------------------------------------------------------------
  const handleRefresh = useCallback(() => {
    queryClient.invalidateQueries({ queryKey })
  }, [queryClient, queryKey])

  const { isPulling, handleTouchStart, handleTouchMove, handleTouchEnd } =
    usePullToRefresh(handleRefresh)

  // -------------------------------------------------------------------------
  // Cancel / Return handlers — navigate to detail page for action
  // -------------------------------------------------------------------------
  const handleCancel = useCallback(
    (orderId: string) => {
      router.push(`/orders/${orderId}`)
    },
    [router],
  )

  const handleReturn = useCallback(
    (orderId: string) => {
      router.push(`/orders/${orderId}?action=return`)
    },
    [router],
  )

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
        {/* Page header                                                       */}
        {/* ---------------------------------------------------------------- */}
        <div className="pt-4">
          <h1 className="text-xl font-bold text-gray-900">My Orders</h1>
        </div>

        {/* ---------------------------------------------------------------- */}
        {/* Search bar (Req 13.4)                                            */}
        {/* ---------------------------------------------------------------- */}
        <div className="relative">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            aria-hidden="true"
          />
          <input
            type="search"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by item name or order number…"
            className={[
              'w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200',
              'text-sm text-gray-900 placeholder-gray-400 bg-white',
              'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
              'transition-shadow',
            ].join(' ')}
            aria-label="Search orders"
          />
        </div>

        {/* ---------------------------------------------------------------- */}
        {/* Filter chips (Req 13.2, 13.3)                                   */}
        {/* ---------------------------------------------------------------- */}
        <section aria-label="Filter orders">
          <div
            className="flex gap-2 overflow-x-auto scrollbar-hide pb-1"
            role="list"
            aria-label="Order status filters"
          >
            {FILTER_OPTIONS.map(({ label, value }) => {
              const isActive = activeFilter === value
              return (
                <button
                  key={value}
                  type="button"
                  role="listitem"
                  aria-pressed={isActive}
                  onClick={() => setActiveFilter(value)}
                  className={[
                    'flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium',
                    'border transition-colors whitespace-nowrap',
                    'focus-visible:outline focus-visible:outline-2',
                    'focus-visible:outline-offset-2 focus-visible:outline-blue-600',
                    isActive
                      ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                      : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50',
                  ].join(' ')}
                >
                  {label}
                </button>
              )
            })}
          </div>
        </section>

        {/* ---------------------------------------------------------------- */}
        {/* Order list                                                        */}
        {/* ---------------------------------------------------------------- */}
        <section aria-label="Order list" aria-live="polite">
          {/* Skeleton loading (Req 13.10) */}
          {isLoading && (
            <div className="space-y-3" aria-busy="true" aria-label="Loading orders…">
              {Array.from({ length: 4 }, (_, i) => (
                <OrderSkeleton key={i} />
              ))}
            </div>
          )}

          {/* Error state */}
          {!isLoading && error && (
            <ErrorState
              message="Failed to load orders. Please check your connection and try again."
              onRetry={handleRefresh}
            />
          )}

          {/* Empty state (Req 13.11) */}
          {!isLoading && !error && orders.length === 0 && (
            <EmptyState
              icon={<ShoppingBag size={48} strokeWidth={1.5} />}
              heading={
                activeFilter !== 'ALL' || debouncedSearch
                  ? 'No orders found'
                  : 'No orders yet'
              }
              body={
                activeFilter !== 'ALL' || debouncedSearch
                  ? 'Try changing your filters or search query.'
                  : 'Your order history will appear here once you make a purchase.'
              }
              ctaLabel={activeFilter === 'ALL' && !debouncedSearch ? 'Start Shopping' : undefined}
              onCta={
                activeFilter === 'ALL' && !debouncedSearch
                  ? () => router.push('/')
                  : undefined
              }
            />
          )}

          {/* Order cards */}
          {!isLoading && !error && orders.length > 0 && (
            <div className="space-y-3">
              {orders.map((order, index) => {
                const isSentinel = index === orders.length - 3
                return (
                  <div key={order.orderId} ref={isSentinel ? ref : undefined}>
                    <OrderCard
                      order={order}
                      onCancel={handleCancel}
                      onReturn={handleReturn}
                    />
                  </div>
                )
              })}

              {/* Sentinel fallback */}
              <div ref={ref} aria-hidden="true" />

              {/* Loading next page */}
              {isFetchingNextPage && (
                <div
                  className="flex items-center justify-center py-6 text-gray-400 gap-2"
                  aria-live="polite"
                  aria-label="Loading more orders…"
                >
                  <Loader2 size={20} className="animate-spin" aria-hidden="true" />
                  <span className="text-sm">Loading more…</span>
                </div>
              )}

              {/* End of list */}
              {!hasNextPage && orders.length > 0 && (
                <p className="text-center text-xs text-gray-400 py-4">
                  All orders loaded
                </p>
              )}
            </div>
          )}
        </section>
      </div>
    </main>
  )
}
