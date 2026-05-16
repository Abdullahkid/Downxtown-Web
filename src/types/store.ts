/**
 * Store domain types — mirrors Android Kotlin data classes.
 * Requirements: 9.1–9.13
 */

import type { MiniProduct } from './product'

// ---------------------------------------------------------------------------
// Store profile
// ---------------------------------------------------------------------------

export interface StoreProfile {
  id: string
  storeName: string
  storeUsername: string
  /** imageId for the store logo */
  logoImageId: string
  /** imageId for the store banner */
  bannerImageId?: string
  description?: string
  city?: string
  phoneNumber?: string
  whatsappNumber?: string
  averageRating: number
  totalReviews: number
  isFollowing: boolean
  followerCount: number
  productCount: number
}

// ---------------------------------------------------------------------------
// Store products (paginated)
// ---------------------------------------------------------------------------

export type StoreSortOption = 'RECENT' | 'PRICE_LOW_TO_HIGH' | 'PRICE_HIGH_TO_LOW' | 'RATING'

export interface StoreProductsResponse {
  products: MiniProduct[]
  currentPage: number
  hasNextPage: boolean
  totalProducts: number
}

/** Backend wraps in { success, data: StoreProductsResponse } */
export interface StoreProductsApiResponse {
  success: boolean
  data: StoreProductsResponse | null
}

// ---------------------------------------------------------------------------
// Store categories
// ---------------------------------------------------------------------------

export interface StoreCategoryProduct {
  id: string
  name: string
  /** imageId */
  mainImageUrl: string
  sellingPrice: number
  mrp: number
}

export interface StoreCategory {
  id: string
  name: string
  productCount: number
  products: StoreCategoryProduct[]
}

export interface StoreCategoriesResponse {
  categories: StoreCategory[]
}

// ---------------------------------------------------------------------------
// Store reviews
// ---------------------------------------------------------------------------

export interface StoreReview {
  id: string
  reviewerName: string
  reviewerImageId?: string
  rating: number
  comment: string
  /** Unix timestamp in milliseconds */
  createdAt: number
}

export interface ReviewStats {
  averageRating: number
  totalReviews: number
  /** Count per star level: index 0 = 1 star, index 4 = 5 stars */
  distribution: [number, number, number, number, number]
}

export interface StoreReviewsResponse {
  stats: ReviewStats
  reviews: StoreReview[]
  nextCursor: string | null
  hasMore: boolean
}
