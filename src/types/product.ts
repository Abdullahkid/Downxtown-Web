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
  /** Shopify product handle — used to build canonical slug URLs /product/{handle}-{id} */
  shopifyHandle?: string | null
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
  /**
   * 'ADMIN' = Shopify-managed store — Buy Now opens the external Shopify cart URL.
   * 'SELLER' = regular in-app checkout flow.
   */
  managedBy?: 'ADMIN' | 'SELLER'
  /** Shopify product handle — used to build cart/product URLs for admin stores */
  shopifyHandle?: string | null
  /** Store's external website URL — used to build Shopify cart URLs */
  storeWebsiteUrl?: string | null
}
