'use client'

/**
 * StoreReviews — rating breakdown chart + paginated review cards.
 *
 * Shows:
 *  - Average rating + total count
 *  - 5-bar star distribution chart
 *  - Paginated review cards (reviewer name, rating, date, comment)
 *
 * Requirements: 9.8
 */

import React, { useCallback } from 'react'
import { Star } from 'lucide-react'
import { ImageLoader } from '@/lib/image/imageLoader'
import { ShimmerCard } from '@/components/shared/ShimmerCard'
import { EmptyState } from '@/components/shared/EmptyState'
import { ErrorState } from '@/components/shared/ErrorState'
import { formatDate } from '@/lib/utils/urlBuilders'
import { api } from '@/lib/api/apiClient'
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll'
import type { StoreReviewsResponse, StoreReview, ReviewStats } from '@/types/store'

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface StoreReviewsProps {
  storeId: string
}

// ---------------------------------------------------------------------------
// Rating breakdown chart
// ---------------------------------------------------------------------------

function RatingBreakdown({ stats }: { stats: ReviewStats }) {
  const total = stats.totalReviews

  return (
    <div className="flex gap-4 px-4 py-4 border-b border-gray-100">
      {/* Big average */}
      <div className="flex flex-col items-center justify-center gap-1 shrink-0">
        <span className="text-4xl font-bold text-gray-900">
          {stats.averageRating.toFixed(1)}
        </span>
        <div className="flex items-center gap-0.5" aria-label={`${stats.averageRating.toFixed(1)} out of 5`}>
          {Array.from({ length: 5 }, (_, i) => (
            <Star
              key={i}
              size={14}
              aria-hidden="true"
              className={
                i < Math.round(stats.averageRating)
                  ? 'fill-amber-400 text-amber-400'
                  : 'fill-gray-200 text-gray-300'
              }
            />
          ))}
        </div>
        <span className="text-xs text-gray-400">
          {total.toLocaleString('en-IN')} review{total !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Distribution bars */}
      <div className="flex flex-1 flex-col gap-1.5 justify-center">
        {[5, 4, 3, 2, 1].map((star) => {
          const count = stats.distribution[star - 1] ?? 0
          const pct = total > 0 ? Math.round((count / total) * 100) : 0

          return (
            <div key={star} className="flex items-center gap-2">
              <span className="w-3 shrink-0 text-right text-xs text-gray-500">
                {star}
              </span>
              <Star
                size={10}
                className="shrink-0 fill-amber-400 text-amber-400"
                aria-hidden="true"
              />
              <div
                className="relative h-2 flex-1 overflow-hidden rounded-full bg-gray-100"
                role="progressbar"
                aria-valuenow={pct}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`${star} star: ${pct}%`}
              >
                <div
                  className="absolute inset-y-0 left-0 rounded-full bg-amber-400 transition-all duration-500"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className="w-8 shrink-0 text-right text-xs text-gray-400">
                {pct}%
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Review card
// ---------------------------------------------------------------------------

function ReviewCard({ review }: { review: StoreReview }) {
  return (
    <article
      className="flex flex-col gap-2 border-b border-gray-100 px-4 py-4 last:border-b-0"
      aria-label={`Review by ${review.reviewerName}`}
    >
      {/* Reviewer info */}
      <div className="flex items-center gap-3">
        {review.reviewerImageId ? (
          <div className="h-9 w-9 shrink-0 overflow-hidden rounded-full border border-gray-200">
            <ImageLoader
              imageId={review.reviewerImageId}
              endpoint="display"
              alt={`${review.reviewerName} avatar`}
              width={36}
              height={36}
              imageContext="store"
            />
          </div>
        ) : (
          <div
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-100 text-sm font-semibold text-gray-500"
            aria-hidden="true"
          >
            {review.reviewerName.charAt(0).toUpperCase()}
          </div>
        )}

        <div className="flex flex-col min-w-0">
          <span className="text-sm font-semibold text-gray-900 truncate">
            {review.reviewerName}
          </span>
          <span className="text-xs text-gray-400">
            {formatDate(review.createdAt)}
          </span>
        </div>

        {/* Star rating */}
        <div
          className="ml-auto flex items-center gap-0.5 shrink-0"
          aria-label={`${review.rating} out of 5 stars`}
        >
          {Array.from({ length: 5 }, (_, i) => (
            <Star
              key={i}
              size={12}
              aria-hidden="true"
              className={
                i < review.rating
                  ? 'fill-amber-400 text-amber-400'
                  : 'fill-gray-200 text-gray-300'
              }
            />
          ))}
        </div>
      </div>

      {/* Comment */}
      {review.comment && (
        <p className="text-sm text-gray-700 leading-relaxed">{review.comment}</p>
      )}
    </article>
  )
}

// ---------------------------------------------------------------------------
// Shimmer
// ---------------------------------------------------------------------------

function ReviewsShimmer() {
  return (
    <div>
      {/* Breakdown shimmer */}
      <div className="flex gap-4 px-4 py-4 border-b border-gray-100">
        <div className="flex flex-col items-center gap-2">
          <ShimmerCard height={40} className="w-16 rounded" />
          <ShimmerCard height={14} className="w-20 rounded" />
        </div>
        <div className="flex flex-1 flex-col gap-2 justify-center">
          {Array.from({ length: 5 }, (_, i) => (
            <ShimmerCard key={i} height={8} className="w-full rounded-full" />
          ))}
        </div>
      </div>
      {/* Review card shimmers */}
      {Array.from({ length: 3 }, (_, i) => (
        <div key={i} className="flex flex-col gap-2 border-b border-gray-100 px-4 py-4">
          <div className="flex items-center gap-3">
            <ShimmerCard height={36} className="w-9 rounded-full" />
            <div className="flex flex-col gap-1.5">
              <ShimmerCard height={12} className="w-28 rounded" />
              <ShimmerCard height={10} className="w-20 rounded" />
            </div>
          </div>
          <ShimmerCard height={14} className="w-full rounded" />
          <ShimmerCard height={14} className="w-3/4 rounded" />
        </div>
      ))}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function StoreReviews({ storeId }: StoreReviewsProps) {
  const { data, isLoading, error, ref, isFetchingNextPage } =
    useInfiniteScroll<StoreReviewsResponse, string | null>({
      queryKey: ['store-reviews', storeId],
      queryFn: ({ pageParam }) => {
        const params = new URLSearchParams()
        if (pageParam) params.set('cursor', pageParam)
        return api.get<StoreReviewsResponse>(
          `/stores/${storeId}/reviews?${params.toString()}`,
          { auth: false },
        )
      },
      getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
      initialPageParam: null,
    })

  if (isLoading) return <ReviewsShimmer />

  if (error) {
    return <ErrorState message="Failed to load reviews" />
  }

  const allReviews: StoreReview[] = data?.pages.flatMap((p) => p.reviews) ?? []
  const stats = data?.pages[0]?.stats

  if (!stats || stats.totalReviews === 0) {
    return (
      <EmptyState
        heading="No reviews yet"
        body="Be the first to shop here and leave a review."
      />
    )
  }

  return (
    <div className="pb-6">
      {/* Rating breakdown */}
      <RatingBreakdown stats={stats} />

      {/* Review cards */}
      {allReviews.map((review) => (
        <ReviewCard key={review.id} review={review} />
      ))}

      {/* Infinite scroll sentinel */}
      <div ref={ref} className="h-4" aria-hidden="true" />

      {/* Loading more */}
      {isFetchingNextPage && (
        <div className="flex flex-col gap-2 px-4 py-4">
          <div className="flex items-center gap-3">
            <ShimmerCard height={36} className="w-9 rounded-full" />
            <ShimmerCard height={12} className="w-28 rounded" />
          </div>
          <ShimmerCard height={14} className="w-full rounded" />
        </div>
      )}
    </div>
  )
}
