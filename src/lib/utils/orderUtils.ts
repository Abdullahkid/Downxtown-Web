/**
 * Order utility functions.
 * Requirements: 11.7, 13.5
 */

import type { ItemFulfillmentStatus } from '@/types/order'

export interface OrderSummaryInput {
  unitPrice: number
  mrp: number
  shippingFee: number
}

export interface OrderSummary {
  discountAmount: number
  total: number
  discountPercentage: number
}

/**
 * Calculates the order summary from pricing inputs.
 *
 * - discountAmount     = mrp - unitPrice
 * - total              = unitPrice + shippingFee
 * - discountPercentage = mrp === 0 ? 0 : Math.round((discountAmount / mrp) * 100)
 */
export function calculateOrderSummary({
  unitPrice,
  mrp,
  shippingFee,
}: OrderSummaryInput): OrderSummary {
  const discountAmount = mrp - unitPrice
  const total = unitPrice + shippingFee
  const discountPercentage =
    mrp === 0 ? 0 : Math.round((discountAmount / mrp) * 100)

  return { discountAmount, total, discountPercentage }
}

/**
 * Maps an ItemFulfillmentStatus to a semantic color token.
 *
 * - 'green'      : DELIVERED, REFUNDED, REPLACEMENT_SENT
 * - 'BrandColor' : CONFIRMED, PROCESSING, HANDED_TO_COURIER, RETURN_APPROVED
 * - 'red'        : CUSTOMER_CANCELLED, SELLER_CANCELLED, FAILED_DELIVERY, RETURN_REJECTED
 * - 'warning'    : PENDING, RETURN_REQUESTED, RETURNED
 */
export function getStatusColor(
  status: ItemFulfillmentStatus,
): 'green' | 'BrandColor' | 'red' | 'warning' {
  switch (status) {
    case 'DELIVERED':
    case 'REFUNDED':
    case 'REPLACEMENT_SENT':
      return 'green'

    case 'CONFIRMED':
    case 'PROCESSING':
    case 'HANDED_TO_COURIER':
    case 'RETURN_APPROVED':
      return 'BrandColor'

    case 'CUSTOMER_CANCELLED':
    case 'SELLER_CANCELLED':
    case 'FAILED_DELIVERY':
    case 'RETURN_REJECTED':
      return 'red'

    case 'PENDING':
    case 'RETURN_REQUESTED':
    case 'RETURNED':
      return 'warning'
  }
}
