/**
 * Checkout domain types — mirrors Android Kotlin data classes exactly.
 * Requirements: 11.1
 */

export interface InitiatePaymentResponse {
  razorpayOrderId: string
  /** Amount in smallest currency unit (paise for INR) */
  amountInPaise: number
  currency: string
  razorpayKeyId: string
}

export interface CheckoutItemDetailsDto {
  productId: string
  variantId: string
  quantity: number
  /** Delivery address ID to ship to */
  addressId: string
  paymentMethod: 'ONLINE' | 'COD'
}
