'use client'

/**
 * MyReviewsPage — buyer's personal review history.
 *
 * Shows all store reviews the authenticated buyer has written, with:
 *  - Infinite scroll pagination
 *  - Pull-to-refresh
 *  - Skeleton loading placeholders
 *  - Empty state with "Start Shopping" CTA
 *  - Error state with retry
 *
 * API: GET /buyer/reviews?page={page}
 */

import React, { useCallback, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Loader2, MessageSquare, RefreshCw, Star } from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll'
import { fetchMyReviews } from '@/lib/api/reviews'
import { ShimmerCard, EmptyState, ErrorState } from '@/components/shared'
import { ImageLoader } from '@/components/shared'
import { formatDate } from '@/lib/utils/urlBuilders'
import { buildStoreUrl } from '@/lib/utils/urlBuilders'
import Link from 'next/link'
import type { MyReview, MyReviewsResponse } from '@/types/review'

// ---------------------------------------------------------------------------
// Star rating display
// ---------------------------------------------------------------------------

function StarRow({ rating }: { rating: number }) {
  return (
    <div
      className="flex items-center gap-0.5"
      role="img"
      aria-label={`${rating} out of 5 stars`}
    >
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          size={13}
          aria-hidden="true"
          className={
            i < rating
              ? 'fill-amber-400 text-amber-400'
              : 'fill-gray-200 text-gray-200'
          }
        />
      ))}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Review card
// ---------------------------------------------------------------------------

function ReviewCard({ review }: { review: MyReview }) {
  return (
    <article
      className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-3"
      aria-label={`Your review for ${review.storeName}`}
    >
      {/* Store identity row */}
      <Link
        href={buildStoreUrl(review.storeUsername)}
        className="flex items-center gap-3 group"
        aria-label={`Visit ${review.storeName}`}
      >
        {/* Store logo */}
        <div className="h-10 w-10 rounded-xl overflow-hidden border border-gray-100 flex-shrink-0 bg-gray-50">
          {review.storeLogoImageId ? (
            <ImageLoader
              imageId={review.storeLogoImageId}
              endpoint="display"
              alt={`${review.storeName} logo`}
              width={40}
              height={40}
              imageContext="store"
            />
          ) : (
            <div
              className="h-full w-full flex items-center justify-center text-sm font-bold text-brand bg-brand-bg"
              aria-hidden="true"
            >
              {review.storeName.charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        <div className="min-w-0">
          <p className="text-sm font-semibold text-gray-900 truncate group-hover:text-brand transition-colors">
            {review.storeName}
          </p>
          <p className="text-xs text-gray-400">@{review.storeUsername}</p>
        </div>

        {/* Verified badge */}
        {review.isVerifiedPurchase && (
          <span className="ml-auto shrink-0 text-xs font-medium text-green-700 bg-green-50 px-2 py-0.5 rounded-full border border-green-100">
            Verified
          </span>
        )}
      </Link>

      {/* Rating + date */}
      <div className="flex items-center gap-3">
        <StarRow rating={review.rating} />
        {review.reviewTitle && (
          <span className="text-sm font-medium text-gray-800 truncate">
            {review.reviewTitle}
          </span>
        )}
        <span className="ml-auto shrink-0 text-xs text-gray-400">
          {formatDate(review.createdAt)}
        </span>
      </div>

      {/* Comment */}
      <p className="text-sm text-gray-700 leading-relaxed">{review.comment}</p>

      {/* Store response */}
      {review.storeResponse && (
        <div className="bg-gray-50 rounded-xl p-3 space-y-1 border border-gray-100">
          <p className="text-xs font-semibold text-gray-600">
            Response from {review.storeResponse.responderName}
          </p>
          <p className="text-xs text-gray-600 leading-relaxed">
            {review.storeResponse.message}
          </p>
          <p className="text-xs text-gray-400">
            {formatDate(review.storeResponse.respondedAt)}
          </p>
        </div>
      )}
    </article>
  )
}

// ---------------------------------------------------------------------------
// Skeleton
// ---------------------------------------------------------------------------

function ReviewSkeleton() {
  return (
    <div
      className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-3"
      aria-busy="true"
      aria-label="Loading review…"
    >
      {/* Store row */}
      <div className="flex items-center gap-3">
        <ShimmerCard width={40} height={40} className="rounded-xl flex-shrink-0" />
        <div className="flex flex-col gap-1.5 flex-1">
          <ShimmerCard width="50%" height={13} />
          <ShimmerCard width="30%" height={11} />
        </div>
      </div>
      {/* Stars + date */}
      <div className="flex items-center justify-between">
        <ShimmerCard width={80} height={13} />
        <ShimmerCard width={60} height={11} />
      </div>
      {/* Comment */}
      <ShimmerCard width="100%" height={13} />
      <ShimmerCard width="75%" height={13} />
    </div>
  )
}

// ---------------------------------------------------------------------------
// Pull-to-refresh (same pattern as orders page)
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
// MyReviewsPage
// ---------------------------------------------------------------------------

const QUERY_KEY = ['my-reviews']

export default function MyReviewsPage() {
  const router = useRouter()
  const queryClient = useQueryClient()

  // -------------------------------------------------------------------------
  // Infinite scroll query
  // -------------------------------------------------------------------------
  const { data, isLoading, error, ref, isFetchingNextPage, hasNextPage } =
    useInfiniteScroll<MyReviewsResponse>({
      queryKey: QUERY_KEY,
      queryFn: ({ pageParam }) => fetchMyReviews(pageParam as number),
      getNextPageParam: (lastPage) => lastPage.nextPage ?? undefined,
      initialPageParam: 1,
    })

  const reviews: MyReview[] = data?.pages.flatMap((page) => page.reviews) ?? []

  // -------------------------------------------------------------------------
  // Pull-to-refresh
  // -------------------------------------------------------------------------
  const handleRefresh = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: QUERY_KEY })
  }, [queryClient])

  const { isPulling, handleTouchStart, handleTouchMove, handleTouchEnd } =
    usePullToRefresh(handleRefresh)

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
          className="flex items-center justify-center py-3 bg-brand-bg text-brand text-sm font-medium gap-2"
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
        <div className="pt-4 flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            aria-label="Go back"
            className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            <ArrowLeft size={20} className="text-gray-700" aria-hidden="true" />
          </button>
          <h1 className="text-xl font-bold text-gray-900">My Reviews</h1>
        </div>

        {/* ---------------------------------------------------------------- */}
        {/* Review list                                                        */}
        {/* ---------------------------------------------------------------- */}
        <section aria-label="Your reviews" aria-live="polite">
          {/* Skeleton loading */}
          {isLoading && (
            <div className="space-y-3" aria-busy="true" aria-label="Loading reviews…">
              {Array.from({ length: 4 }, (_, i) => (
                <ReviewSkeleton key={i} />
              ))}
            </div>
          )}

          {/* Error state */}
          {!isLoading && error && (
            <ErrorState
              message="Failed to load your reviews. Please check your connection and try again."
              onRetry={handleRefresh}
            />
          )}

          {/* Empty state */}
          {!isLoading && !error && reviews.length === 0 && (
            <EmptyState
              icon={<MessageSquare size={48} strokeWidth={1.5} />}
              heading="No reviews yet"
              body="Reviews you leave for stores will appear here."
              ctaLabel="Start Shopping"
              onCta={() => router.push('/')}
            />
          )}

          {/* Review cards */}
          {!isLoading && !error && reviews.length > 0 && (
            <div className="space-y-3">
              {reviews.map((review, index) => {
                const isSentinel = index === reviews.length - 3
                return (
                  <div key={review.id} ref={isSentinel ? ref : undefined}>
                    <ReviewCard review={review} />
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
                  aria-label="Loading more reviews…"
                >
                  <Loader2 size={20} className="animate-spin" aria-hidden="true" />
                  <span className="text-sm">Loading more…</span>
                </div>
              )}

              {/* End of list */}
              {!hasNextPage && reviews.length > 0 && (
                <p className="text-center text-xs text-gray-400 py-4">
                  All reviews loaded
                </p>
              )}
            </div>
          )}
        </section>
      </div>
    </main>
  )
}
