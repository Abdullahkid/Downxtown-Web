'use client'

/**
 * ProductReview — paginated product reviews with average rating and total count.
 *
 * - Fetches reviews from GET /products/{productId}/reviews?page={page}&limit=10
 * - Displays star rating, reviewer name, comment, and date
 * - Paginated with "Load More" button
 *
 * Requirements: 10.11
 */

import React, { useState, useCallback } from 'react'
import { Star } from 'lucide-react'
import { api } from '@/lib/api/apiClient'
import { formatDate } from '@/lib/utils/urlBuilders'
import { ShimmerCard } from '@/components/shared/ShimmerCard'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ProductReviewItem {
  id: string
  reviewerName: string
  reviewerImageId?: string
  rating: number
  comment: string
  createdAt: number
}

interface ReviewsResponse {
  reviews: ProductReviewItem[]
  totalCount: number
  averageRating: number
  hasMore: boolean
  nextPage: number | null
}

// Backend wraps in ApiResponse<PaginatedProductReviewsResponse>
interface BackendReviewsResponse {
  success: boolean
  data: {
    reviews: Array<{
      id: string
      reviewerName: string
      reviewerImageId?: string
      rating: number
      comment: string
      createdAt: number
    }>
    stats: { averageRating: number; totalReviews: number }
    currentPage: number
    totalPages: number
    hasNextPage: boolean
    totalReviews: number
  } | null
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

/** Renders filled/half/empty stars for a given rating (0–5). */
function StarRating({
  rating,
  size = 16,
  className = '',
}: {
  rating: number
  size?: number
  className?: string
}) {
  return (
    <div
      className={`flex items-center gap-0.5 ${className}`}
      role="img"
      aria-label={`Rating: ${rating.toFixed(1)} out of 5`}
    >
      {Array.from({ length: 5 }, (_, i) => {
        const filled = i < Math.floor(rating)
        const partial = !filled && i < rating
        return (
          <span key={i} className="relative" aria-hidden="true">
            {/* Background (empty) star */}
            <Star
              size={size}
              className="text-gray-300"
              fill="currentColor"
              strokeWidth={0}
            />
            {/* Foreground (filled) star — clipped for partial fill */}
            {(filled || partial) && (
              <span
                className="absolute inset-0 overflow-hidden"
                style={{ width: filled ? '100%' : `${(rating - Math.floor(rating)) * 100}%` }}
              >
                <Star
                  size={size}
                  className="text-amber-400"
                  fill="currentColor"
                  strokeWidth={0}
                />
              </span>
            )}
          </span>
        )
      })}
    </div>
  )
}

/** Single review card. */
function ReviewCard({ review }: { review: ProductReviewItem }) {
  return (
    <article className="flex flex-col gap-2 py-4 border-b border-gray-100 last:border-0">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          {/* Avatar placeholder */}
          <div
            className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-none"
            aria-hidden="true"
          >
            <span className="text-blue-700 text-xs font-semibold uppercase">
              {review.reviewerName.charAt(0)}
            </span>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">{review.reviewerName}</p>
            <p className="text-xs text-gray-500">{formatDate(review.createdAt)}</p>
          </div>
        </div>
        <StarRating rating={review.rating} size={14} />
      </div>
      {review.comment && (
        <p className="text-sm text-gray-700 leading-relaxed">{review.comment}</p>
      )}
    </article>
  )
}

/** Shimmer placeholder for a review card. */
function ReviewShimmer() {
  return (
    <div className="flex flex-col gap-2 py-4 border-b border-gray-100">
      <div className="flex items-center gap-2">
        <ShimmerCard width={32} height={32} className="rounded-full" />
        <div className="flex flex-col gap-1">
          <ShimmerCard width={100} height={12} />
          <ShimmerCard width={60} height={10} />
        </div>
      </div>
      <ShimmerCard width="100%" height={14} />
      <ShimmerCard width="80%" height={14} />
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

interface ProductReviewProps {
  productId: string
  /** Pre-fetched average rating from the product object (shown immediately). */
  averageRating: number
}

const PAGE_LIMIT = 10

export function ProductReview({ productId, averageRating }: ProductReviewProps) {
  const [reviews, setReviews] = useState<ProductReviewItem[]>([])
  const [totalCount, setTotalCount] = useState<number | null>(null)
  const [serverAvgRating, setServerAvgRating] = useState<number | null>(null)
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [initialLoaded, setInitialLoaded] = useState(false)

  const loadReviews = useCallback(
    async (pageNum: number) => {
      setLoading(true)
      setError(null)
      try {
        const wrapped = await api.get<BackendReviewsResponse>(
          `/products/${productId}/reviews?page=${pageNum}&limit=${PAGE_LIMIT}`,
          { auth: false },
        )
        const data = wrapped.data
        if (!data) throw new Error('No data in response')

        const mappedReviews: ProductReviewItem[] = (data.reviews ?? []).map(r => ({
          id: r.id,
          reviewerName: r.reviewerName,
          reviewerImageId: r.reviewerImageId,
          rating: r.rating,
          comment: r.comment,
          createdAt: r.createdAt,
        }))

        setReviews((prev) => (pageNum === 1 ? mappedReviews : [...prev, ...mappedReviews]))
        setTotalCount(data.totalReviews ?? 0)
        setServerAvgRating(data.stats?.averageRating ?? null)
        setHasMore(data.hasNextPage ?? false)
        setPage(pageNum)
        setInitialLoaded(true)
      } catch {
        setError('Failed to load reviews. Please try again.')
      } finally {
        setLoading(false)
      }
    },
    [productId],
  )

  // Load first page on mount
  React.useEffect(() => {
    loadReviews(1)
  }, [loadReviews])

  const displayRating = serverAvgRating ?? averageRating
  const displayCount = totalCount ?? 0

  return (
    <section aria-labelledby="reviews-heading" className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 id="reviews-heading" className="text-base font-semibold text-gray-900">
          Customer Reviews
        </h2>
        {initialLoaded && (
          <span className="text-sm text-gray-500">
            {displayCount} {displayCount === 1 ? 'review' : 'reviews'}
          </span>
        )}
      </div>

      {/* Average rating summary */}
      {initialLoaded && displayCount > 0 && (
        <div className="flex items-center gap-3 p-4 bg-amber-50 rounded-xl">
          <span className="text-3xl font-bold text-gray-900">
            {displayRating.toFixed(1)}
          </span>
          <div className="flex flex-col gap-1">
            <StarRating rating={displayRating} size={18} />
            <span className="text-xs text-gray-500">
              Based on {displayCount} {displayCount === 1 ? 'review' : 'reviews'}
            </span>
          </div>
        </div>
      )}

      {/* Review list */}
      <div>
        {/* Initial loading shimmer */}
        {!initialLoaded && loading && (
          <div aria-busy="true" aria-label="Loading reviews">
            {Array.from({ length: 3 }, (_, i) => (
              <ReviewShimmer key={i} />
            ))}
          </div>
        )}

        {/* Error state */}
        {error && (
          <div
            role="alert"
            className="flex flex-col items-center gap-2 py-6 text-center"
          >
            <p className="text-sm text-red-600">{error}</p>
            <button
              type="button"
              onClick={() => loadReviews(1)}
              className="text-sm text-blue-600 underline hover:text-blue-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500 rounded"
            >
              Retry
            </button>
          </div>
        )}

        {/* Empty state */}
        {initialLoaded && !loading && reviews.length === 0 && !error && (
          <p className="text-sm text-gray-500 py-4 text-center">
            No reviews yet. Be the first to review this product!
          </p>
        )}

        {/* Review cards */}
        {reviews.map((review) => (
          <ReviewCard key={review.id} review={review} />
        ))}

        {/* Load more shimmer */}
        {initialLoaded && loading && (
          <div aria-busy="true" aria-label="Loading more reviews">
            {Array.from({ length: 3 }, (_, i) => (
              <ReviewShimmer key={i} />
            ))}
          </div>
        )}
      </div>

      {/* Load More button */}
      {initialLoaded && hasMore && !loading && !error && (
        <button
          type="button"
          onClick={() => loadReviews(page + 1)}
          className={[
            'w-full min-h-[44px] py-2.5 rounded-xl border border-gray-300',
            'text-sm font-medium text-gray-700 bg-white',
            'hover:bg-gray-50 active:bg-gray-100 transition-colors',
            'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500',
          ].join(' ')}
        >
          Load More Reviews
        </button>
      )}
    </section>
  )
}
