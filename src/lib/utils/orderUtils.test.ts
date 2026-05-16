/**
 * Unit + property-based tests for orderUtils.ts
 * Requirements: 11.7, 13.5
 */

import { describe, it, expect } from 'vitest'
import fc from 'fast-check'
import { calculateOrderSummary, getStatusColor } from './orderUtils'
import type { ItemFulfillmentStatus } from '@/types/order'

// ---------------------------------------------------------------------------
// calculateOrderSummary — unit tests
// ---------------------------------------------------------------------------

describe('calculateOrderSummary', () => {
  it('computes discount, total, and percentage for a typical item', () => {
    const result = calculateOrderSummary({ unitPrice: 800, mrp: 1000, shippingFee: 50 })
    expect(result.discountAmount).toBe(200)
    expect(result.total).toBe(850)
    expect(result.discountPercentage).toBe(20)
  })

  it('returns 0 discountPercentage when mrp is 0', () => {
    const result = calculateOrderSummary({ unitPrice: 0, mrp: 0, shippingFee: 0 })
    expect(result.discountAmount).toBe(0)
    expect(result.total).toBe(0)
    expect(result.discountPercentage).toBe(0)
  })

  it('rounds discountPercentage correctly', () => {
    // 1/3 ≈ 33.33... → rounds to 33
    const result = calculateOrderSummary({ unitPrice: 200, mrp: 300, shippingFee: 0 })
    expect(result.discountPercentage).toBe(33)
  })

  it('handles zero shipping fee', () => {
    const result = calculateOrderSummary({ unitPrice: 500, mrp: 600, shippingFee: 0 })
    expect(result.total).toBe(500)
  })

  it('handles no discount (unitPrice === mrp)', () => {
    const result = calculateOrderSummary({ unitPrice: 500, mrp: 500, shippingFee: 40 })
    expect(result.discountAmount).toBe(0)
    expect(result.discountPercentage).toBe(0)
    expect(result.total).toBe(540)
  })
})

// ---------------------------------------------------------------------------
// calculateOrderSummary — Property 4
// Feature: web-buyer-app, Property 4: Order Summary Arithmetic
// ---------------------------------------------------------------------------

describe('calculateOrderSummary — Property 4: Order Summary Arithmetic', () => {
  it('discountAmount, total, and discountPercentage are always correct', () => {
    // **Validates: Requirements 11.7**
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 1_000_000 }),          // mrp
        fc.integer({ min: 0, max: 1_000_000 }),          // discount offset (mrp - unitPrice)
        fc.integer({ min: 0, max: 100_000 }),            // shippingFee
        (mrp, discountOffset, shippingFee) => {
          const unitPrice = Math.max(0, mrp - discountOffset)
          const result = calculateOrderSummary({ unitPrice, mrp, shippingFee })

          const expectedDiscount = mrp - unitPrice
          const expectedTotal = unitPrice + shippingFee
          const expectedPct =
            mrp === 0 ? 0 : Math.round((expectedDiscount / mrp) * 100)

          return (
            result.discountAmount === expectedDiscount &&
            result.total === expectedTotal &&
            result.discountPercentage === expectedPct
          )
        },
      ),
      { numRuns: 25 },
    )
  })
})

// ---------------------------------------------------------------------------
// getStatusColor — unit tests
// ---------------------------------------------------------------------------

const GREEN_STATUSES: ItemFulfillmentStatus[] = [
  'DELIVERED',
  'REFUNDED',
  'REPLACEMENT_SENT',
]

const BRAND_STATUSES: ItemFulfillmentStatus[] = [
  'CONFIRMED',
  'PROCESSING',
  'HANDED_TO_COURIER',
  'RETURN_APPROVED',
]

const RED_STATUSES: ItemFulfillmentStatus[] = [
  'CUSTOMER_CANCELLED',
  'SELLER_CANCELLED',
  'FAILED_DELIVERY',
  'RETURN_REJECTED',
]

const WARNING_STATUSES: ItemFulfillmentStatus[] = [
  'PENDING',
  'RETURN_REQUESTED',
  'RETURNED',
]

describe('getStatusColor', () => {
  it.each(GREEN_STATUSES)('%s → green', (status) => {
    expect(getStatusColor(status)).toBe('green')
  })

  it.each(BRAND_STATUSES)('%s → BrandColor', (status) => {
    expect(getStatusColor(status)).toBe('BrandColor')
  })

  it.each(RED_STATUSES)('%s → red', (status) => {
    expect(getStatusColor(status)).toBe('red')
  })

  it.each(WARNING_STATUSES)('%s → warning', (status) => {
    expect(getStatusColor(status)).toBe('warning')
  })
})

// ---------------------------------------------------------------------------
// getStatusColor — Property 5
// Feature: web-buyer-app, Property 5: Order Status Color Mapping
// ---------------------------------------------------------------------------

const ALL_STATUSES: ItemFulfillmentStatus[] = [
  ...GREEN_STATUSES,
  ...BRAND_STATUSES,
  ...RED_STATUSES,
  ...WARNING_STATUSES,
]

describe('getStatusColor — Property 5: Order Status Color Mapping', () => {
  it('every ItemFulfillmentStatus maps to a valid color and no status is unmapped', () => {
    // **Validates: Requirements 13.5**
    fc.assert(
      fc.property(
        fc.constantFrom(...ALL_STATUSES),
        (status) => {
          const color = getStatusColor(status)
          const validColors = ['green', 'BrandColor', 'red', 'warning']
          return validColors.includes(color)
        },
      ),
      { numRuns: 25 },
    )
  })

  it('green statuses are exactly DELIVERED, REFUNDED, REPLACEMENT_SENT', () => {
    // **Validates: Requirements 13.5**
    fc.assert(
      fc.property(
        fc.constantFrom(...ALL_STATUSES),
        (status) => {
          const isGreen = getStatusColor(status) === 'green'
          const shouldBeGreen = GREEN_STATUSES.includes(status)
          return isGreen === shouldBeGreen
        },
      ),
      { numRuns: 25 },
    )
  })

  it('red statuses are exactly CUSTOMER_CANCELLED, SELLER_CANCELLED, FAILED_DELIVERY, RETURN_REJECTED', () => {
    // **Validates: Requirements 13.5**
    fc.assert(
      fc.property(
        fc.constantFrom(...ALL_STATUSES),
        (status) => {
          const isRed = getStatusColor(status) === 'red'
          const shouldBeRed = RED_STATUSES.includes(status)
          return isRed === shouldBeRed
        },
      ),
      { numRuns: 25 },
    )
  })
})
