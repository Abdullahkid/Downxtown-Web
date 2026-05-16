/**
 * Unit tests for urlBuilders.ts
 * Requirements: 10.14, 9.13, 21.5
 */

import { describe, it, expect } from 'vitest'
import {
  buildProductUrl,
  parseProductId,
  buildStoreUrl,
  formatPrice,
  formatDate,
} from './urlBuilders'

// ---------------------------------------------------------------------------
// buildProductUrl
// ---------------------------------------------------------------------------
describe('buildProductUrl', () => {
  it('returns /product/{productId} for a simple id', () => {
    expect(buildProductUrl('abc123')).toBe('/product/abc123')
  })

  it('handles ids with hyphens and underscores', () => {
    expect(buildProductUrl('prod-001_v2')).toBe('/product/prod-001_v2')
  })

  it('handles a UUID-style id', () => {
    const id = '550e8400-e29b-41d4-a716-446655440000'
    expect(buildProductUrl(id)).toBe(`/product/${id}`)
  })
})

// ---------------------------------------------------------------------------
// parseProductId
// ---------------------------------------------------------------------------
describe('parseProductId', () => {
  it('parses a relative product path', () => {
    expect(parseProductId('/product/abc123')).toBe('abc123')
  })

  it('parses a full absolute URL', () => {
    expect(parseProductId('https://downxtown.com/product/xyz789')).toBe('xyz789')
  })

  it('returns null for a non-product path', () => {
    expect(parseProductId('/store/myshop')).toBeNull()
  })

  it('returns null for an empty string', () => {
    expect(parseProductId('')).toBeNull()
  })

  it('returns null for a bare /product/ path with no id', () => {
    expect(parseProductId('/product/')).toBeNull()
  })

  it('round-trips: parseProductId(buildProductUrl(id)) === id', () => {
    const ids = ['abc123', 'prod-001', 'ITEM_99', '550e8400-e29b-41d4-a716-446655440000']
    for (const id of ids) {
      expect(parseProductId(buildProductUrl(id))).toBe(id)
    }
  })
})

// ---------------------------------------------------------------------------
// buildStoreUrl
// ---------------------------------------------------------------------------
describe('buildStoreUrl', () => {
  it('returns /store/{storeUsername}', () => {
    expect(buildStoreUrl('myshop')).toBe('/store/myshop')
  })

  it('handles usernames with hyphens', () => {
    expect(buildStoreUrl('my-cool-shop')).toBe('/store/my-cool-shop')
  })
})

// ---------------------------------------------------------------------------
// formatPrice
// ---------------------------------------------------------------------------
describe('formatPrice', () => {
  it('formats 129900 paise as ₹1,299', () => {
    // Intl output may vary slightly by environment; check for ₹ and 1,299
    const result = formatPrice(129900)
    expect(result).toContain('1,299')
    expect(result).toContain('₹')
  })

  it('formats 0 paise as ₹0', () => {
    const result = formatPrice(0)
    expect(result).toContain('0')
    expect(result).toContain('₹')
  })

  it('formats 100 paise as ₹1', () => {
    const result = formatPrice(100)
    expect(result).toContain('1')
    expect(result).toContain('₹')
  })

  it('formats 10000000 paise (₹1,00,000) correctly', () => {
    const result = formatPrice(10000000)
    expect(result).toContain('₹')
    // Indian numbering: 1,00,000
    expect(result).toMatch(/1,00,000|100,000/)
  })
})

// ---------------------------------------------------------------------------
// formatDate
// ---------------------------------------------------------------------------
describe('formatDate', () => {
  it('returns a non-empty string for a valid timestamp', () => {
    const result = formatDate(1700000000000)
    expect(typeof result).toBe('string')
    expect(result.length).toBeGreaterThan(0)
  })

  it('includes the year for a known timestamp', () => {
    // 1700000000000 ms = 14 Nov 2023 UTC
    const result = formatDate(1700000000000)
    expect(result).toContain('2023')
  })

  it('formats epoch (0) without throwing', () => {
    expect(() => formatDate(0)).not.toThrow()
  })
})
