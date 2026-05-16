/**
 * Order domain types — mirrors Android Kotlin data classes exactly.
 * Requirements: 13.5
 */

export type ItemFulfillmentStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PROCESSING'
  | 'HANDED_TO_COURIER'
  | 'DELIVERED'
  | 'FAILED_DELIVERY'
  | 'CUSTOMER_CANCELLED'
  | 'SELLER_CANCELLED'
  | 'RETURNED'
  | 'REFUNDED'
  | 'RETURN_REQUESTED'
  | 'RETURN_APPROVED'
  | 'RETURN_REJECTED'
  | 'REPLACEMENT_SENT'

export type PaymentMethod = 'ONLINE' | 'COD'

export interface TrackingInfo {
  courierName: string
  trackingNumber: string
  trackingUrl: string
}

export interface ItemStatusChange {
  status: ItemFulfillmentStatus
  timestamp: number
  note?: string
}

export interface OrderItem {
  id: string
  productId: string
  variantId: string
  productName: string
  /** e.g. { color: 'Red', size: 'M' } */
  variantAttributes: Record<string, string>
  quantity: number
  unitPrice: number
  shippingFee: number
  platformFee: number
  totalAmount: number
  status: ItemFulfillmentStatus
  canBeCancelled: boolean
  canBeReturned: boolean
  trackingInfo?: TrackingInfo
  statusHistory: ItemStatusChange[]
}
