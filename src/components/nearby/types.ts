/**
 * Shared types for the Nearby Store Discovery feature.
 *
 * Requirements: 17.1–17.7
 */

export interface NearbyStore {
  /** Unique business identifier */
  businessId: string
  /** Display name of the store */
  storeName: string
  /** URL-safe username for the store profile */
  storeUsername: string
  /** imageId for the store logo (not a full URL) */
  storeLogo: string
  /** Store's latitude coordinate */
  lat: number
  /** Store's longitude coordinate */
  lng: number
  /** Distance from the buyer's current location in meters */
  distanceMeters: number
  /** Average star rating (0–5) */
  storeRating: number
}
