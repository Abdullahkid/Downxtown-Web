/**
 * Feed domain types — mirrors the Ktor backend response shapes exactly.
 * Requirements: 7.6
 */

import type { MiniProduct } from './product'

export interface FeedStore {
  businessId: string
  storeName: string
  storeUsername: string
  /** imageId for the store logo (not a full URL) */
  storeLogo: string
  storeRating: number
  isFollowing: boolean
  recentProducts: MiniProduct[]
}

/** Shape returned by GET /feed/stores (wrapped in ApiResponse.data) */
export interface PaginatedFeedResponse {
  stores: FeedStore[]
  currentPage: number
  hasNextPage: boolean
  totalStores: number
}

/** Generic API response wrapper used by the Ktor backend */
export interface ApiResponse<T> {
  success: boolean
  data: T | null
  message: string
}
