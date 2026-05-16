// Feature: web-buyer-app, Property 4: Order summary arithmetic
// Feature: web-buyer-app, Property 5: Order status color mapping

import * as fc from 'fast-check'
import { describe, it, expect } from 'vitest'
import { calculateOrderSummary, getStatusColor } from '@/lib/utils/orderUtils'
import type { ItemFulfillmentStatus } from '@/types/order'

// ---------------------------------------------------------------------------
// Property 4: Order Summary Arithmetic
// ---------------------------------------------------------------------------

/**
 * Property 4: Order Summary Arithmetic
 *
 * For any combination of non-negative `unitPrice`, `mrp` (where mrp ≥ unitPrice),
 * and non-negative `shippingFee`, the `calculateOrderSummary` function must produce:
 *   - discountAmount     = mrp - unitPrice
 *   - total              = unitPrice + shippingFee
 *   - discountPercentage = Math.round((discountAmount / mrp) * 100)  (0 when mrp === 0)
 *
 * **Validates: Requirements 11.7**
 */
describe('Property 4: Order Summary Arithmetic', () => {
  it('discountAmount, total, and discountPercentage are always arithmetically correct', () => {
    fc.assert(
      fc.property(
        // Generate mrp as a non-negative integer
        fc.integer({ min: 0, max: 1_000_000 }),
        // Generate a discount offset so that unitPrice = mrp - offset (guarantees mrp >= unitPrice)
        fc.integer({ min: 0, max: 1_000_000 }),
        // Generate a non-negative shippingFee
        fc.integer({ min: 0, max: 100_000 }),
        (mrp, discountOffset, shippingFee) => {
          const unitPrice = Math.max(0, mrp - discountOffset)

          const result = calculateOrderSummary({ unitPrice, mrp, shippingFee })

          const expectedDiscountAmount = mrp - unitPrice
          const expectedTotal = unitPrice + shippingFee
          const expectedDiscountPercentage =
            mrp === 0
              ? 0
              : Math.round((expectedDiscountAmount / mrp) * 100)

          return (
            result.discountAmount === expectedDiscountAmount &&
            result.total === expectedTotal &&
            result.discountPercentage === expectedDiscountPercentage
          )
        }
      ),
      { numRuns: 25 }
    )
  })
})

// ---------------------------------------------------------------------------
// Property 5: Order Status Color Mapping
// ---------------------------------------------------------------------------

/**
 * Property 5: Order Status Color Mapping
 *
 * For every ItemFulfillmentStatus value, getStatusColor must return exactly
 * the correct color token — no value may be unmapped.
 *
 * Mapping:
 *   'green'      → DELIVERED, REFUNDED, REPLACEMENT_SENT
 *   'BrandColor' → CONFIRMED, PROCESSING, HANDED_TO_COURIER, RETURN_APPROVED
 *   'red'        → CUSTOMER_CANCELLED, SELLER_CANCELLED, FAILED_DELIVERY, RETURN_REJECTED
 *   'warning'    → PENDING, RETURN_REQUESTED, RETURNED
 *
 * **Validates: Requirements 13.5**
 */

// All 14 ItemFulfillmentStatus values
const ALL_STATUSES: ItemFulfillmentStatus[] = [
  'PENDING',
  'CONFIRMED',
  'PROCESSING',
  'HANDED_TO_COURIER',
  'DELIVERED',
  'FAILED_DELIVERY',
  'CUSTOMER_CANCELLED',
  'SELLER_CANCELLED',
  'RETURNED',
  'REFUNDED',
  'RETURN_REQUESTED',
  'RETURN_APPROVED',
  'RETURN_REJECTED',
  'REPLACEMENT_SENT',
]

// Expected color for each status — the ground truth
const EXPECTED_COLOR: Record<
  ItemFulfillmentStatus,
  'green' | 'BrandColor' | 'red' | 'warning'
> = {
  DELIVERED: 'green',
  REFUNDED: 'green',
  REPLACEMENT_SENT: 'green',

  CONFIRMED: 'BrandColor',
  PROCESSING: 'BrandColor',
  HANDED_TO_COURIER: 'BrandColor',
  RETURN_APPROVED: 'BrandColor',

  CUSTOMER_CANCELLED: 'red',
  SELLER_CANCELLED: 'red',
  FAILED_DELIVERY: 'red',
  RETURN_REJECTED: 'red',

  PENDING: 'warning',
  RETURN_REQUESTED: 'warning',
  RETURNED: 'warning',
}

describe('Property 5: Order status color mapping', () => {
  it(
    'every ItemFulfillmentStatus maps to exactly the correct color token',
    () => {
      fc.assert(
        fc.property(
          fc.constantFrom(...ALL_STATUSES),
          (status) => {
            const color = getStatusColor(status)
            return color === EXPECTED_COLOR[status]
          }
        ),
        { numRuns: 25 }
      )
    }
  )

  it('no ItemFulfillmentStatus value is unmapped (returns a valid color token)', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...ALL_STATUSES),
        (status) => {
          const color = getStatusColor(status)
          const validTokens = ['green', 'BrandColor', 'red', 'warning']
          return validTokens.includes(color)
        }
      ),
      { numRuns: 25 }
    )
  })

  it('all 14 statuses are covered — exhaustive check', () => {
    for (const status of ALL_STATUSES) {
      const color = getStatusColor(status)
      expect(color).toBe(EXPECTED_COLOR[status])
    }
  })
})
