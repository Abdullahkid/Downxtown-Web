/**
 * Reviews API service.
 *
 * Mirrors the Android `StoreReviewApiService` Ktor calls, adapted for
 * the web `api` client helper (fetch-based, auto-auth).
 */

import { api } from '@/lib/api/apiClient'
import type { MyReviewsResponse } from '@/types/review'

/**
 * Fetch the authenticated buyer's own reviews, paginated.
 * Endpoint: GET /api/v1/reviews/my-reviews?page={page}
 *
 * The backend wraps the response in ApiResponse<PaginatedMyReviewsResponse>,
 * so we unwrap the `data` field here.
 */
export async function fetchMyReviews(page: number): Promise<MyReviewsResponse> {
  const wrapped = await api.get<{ success: boolean; data: MyReviewsResponse | null }>(
    `/api/v1/reviews/my-reviews?page=${page}`
  )
  if (!wrapped.success || !wrapped.data) {
    throw new Error('Failed to load reviews')
  }
  return wrapped.data
}
