/**
 * Review domain types — buyer-authored reviews.
 *
 * Mirrors Android `StoreReview` / `MiniStoreReview` data classes from
 * `com.downxtown.network.dto.review` with web-specific additions.
 */

// ---------------------------------------------------------------------------
// Store response (reply from the seller)
// ---------------------------------------------------------------------------

export interface StoreReviewResponse {
  message: string
  respondedAt: number
  responderName: string
}

// ---------------------------------------------------------------------------
// A review written by the currently authenticated buyer
// ---------------------------------------------------------------------------

export interface MyReview {
  id: string
  /** The store that was reviewed */
  storeId: string
  storeName: string
  storeUsername: string
  /** imageId for the store logo — use with ImageLoader */
  storeLogoImageId?: string
  /** 1–5 star rating */
  rating: number
  comment: string
  reviewTitle?: string
  isVerifiedPurchase: boolean
  /** Unix timestamp (ms) */
  createdAt: number
  storeResponse?: StoreReviewResponse
}

// ---------------------------------------------------------------------------
// Paginated list response from GET /buyer/reviews
// ---------------------------------------------------------------------------

export interface MyReviewsResponse {
  reviews: MyReview[]
  /** null when there are no further pages */
  nextPage: number | null
}
