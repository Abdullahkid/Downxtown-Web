/**
 * Product domain types — mirrors Android Kotlin data classes exactly.
 * Requirements: 10.1
 */

export type ImageEndpoint =
  | 'preview'
  | 'detail'
  | 'fullscreen'
  | 'banner'
  | 'display'
  | 'original'

export interface ImageGroup {
  id: string
  name: string
  /** Array of imageIds (not full URLs) */
  images: string[]
  groupType: 'COLOR_BASED' | 'PRODUCT_WIDE' | 'INDIVIDUAL'
  color?: string
}

export interface ProductVariant {
  id: string
  /** e.g. { color: 'Red', size: 'M' } */
  attributes: Record<string, string>
  sellingPrice: number
  mrp: number
  inventory: number
  imageGroupId: string
  /** Backend sends AVAILABLE, OUT_OF_STOCK, or DISCONTINUED */
  status: 'AVAILABLE' | 'OUT_OF_STOCK' | 'DISCONTINUED' | 'ACTIVE' | 'INACTIVE'
}

export interface MiniProduct {
  id: string
  businessId: string
  name: string
  /** imageId, not a full URL */
  mainImageUrl: string
  sellingPrice: number
  mrp: number
  averageRating: number
  mainCategory: string
  storeName: string
  storeUsername: string
}

export interface Product {
  id: string
  businessId: string
  /** Store username for navigation (e.g. 'baccabucci') */
  storeUsername?: string
  name: string
  brandName: string
  description: string
  keyFeatures: string[]
  imageGroups: ImageGroup[]
  variants: ProductVariant[]
  mainCategory: string
  shippingCost: number
  estimatedDeliveryDays: number
  isCodAllowed: boolean
  isReturnable: boolean
  returnWindowDays: number
  averageRating: number
  reelStatus?: string
  productReelVideoId?: string
  productReelThumbnailId?: string
}
