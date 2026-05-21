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

// A real-looking 24-char hex ObjectId for tests
const OBJECT_ID = '695d5897429a7676c733204c'

// ---------------------------------------------------------------------------
// buildProductUrl
// ---------------------------------------------------------------------------
describe('buildProductUrl', () => {
  it('returns /product/{id} when no slugBase is provided', () => {
    expect(buildProductUrl(OBJECT_ID)).toBe(`/product/${OBJECT_ID}`)
  })

  it('returns /product/{slugBase}-{id} when slugBase is provided', () => {
    expect(buildProductUrl(OBJECT_ID, 'rockstar-stitch-oversized-t-shirt-1'))
      .toBe(`/product/rockstar-stitch-oversized-t-shirt-1-${OBJECT_ID}`)
  })

  it('falls back to id-only URL when slugBase is empty string', () => {
    expect(buildProductUrl(OBJECT_ID, '')).toBe(`/product/${OBJECT_ID}`)
  })

  it('falls back to id-only URL when slugBase is null', () => {
    expect(buildProductUrl(OBJECT_ID, null)).toBe(`/product/${OBJECT_ID}`)
  })

  it('truncates slugBase longer than 6 words to exactly 6 words', () => {
    const longSlug = 'bacca-bucci-boundary-blazers-cricket-shoes-dynamic-flex-tech-superior'
    // first 6 words → 'bacca-bucci-boundary-blazers-cricket-shoes'
    const result = buildProductUrl(OBJECT_ID, longSlug)
    const segment = result.replace('/product/', '').replace(`-${OBJECT_ID}`, '')
    expect(segment).toBe('bacca-bucci-boundary-blazers-cricket-shoes')
  })

  it('does not truncate slugBase with 6 words or fewer', () => {
    const shortSlug = 'rockstar-stitch-oversized-t-shirt-1'  // 5 words
    expect(buildProductUrl(OBJECT_ID, shortSlug))
      .toBe(`/product/rockstar-stitch-oversized-t-shirt-1-${OBJECT_ID}`)
  })

  it('falls back to id-only URL when slugBase is whitespace only', () => {
    expect(buildProductUrl(OBJECT_ID, '   ')).toBe(`/product/${OBJECT_ID}`)
  })
})

// ---------------------------------------------------------------------------
// parseProductId
// ---------------------------------------------------------------------------
describe('parseProductId', () => {
  it('extracts ObjectId from SEO slug URL', () => {
    expect(parseProductId(`/product/rockstar-stitch-oversized-t-shirt-1-${OBJECT_ID}`))
      .toBe(OBJECT_ID)
  })

  it('extracts ObjectId from legacy bare-id URL', () => {
    expect(parseProductId(`/product/${OBJECT_ID}`)).toBe(OBJECT_ID)
  })

  it('parses a full absolute URL with slug', () => {
    expect(parseProductId(`https://downxtown.com/product/my-product-${OBJECT_ID}`))
      .toBe(OBJECT_ID)
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

  it('round-trips: parseProductId(buildProductUrl(id)) === id for legacy format', () => {
    expect(parseProductId(buildProductUrl(OBJECT_ID))).toBe(OBJECT_ID)
  })

  it('round-trips: parseProductId(buildProductUrl(id, slug)) === id for slug format', () => {
    expect(parseProductId(buildProductUrl(OBJECT_ID, 'classic-white-tee'))).toBe(OBJECT_ID)
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
  it('formats 1299 rupees as ₹1,299', () => {
    // Backend sends prices in rupees directly; 1299 → ₹1,299
    const result = formatPrice(1299)
    expect(result).toContain('1,299')
    expect(result).toContain('₹')
  })

  it('formats 0 rupees as ₹0', () => {
    const result = formatPrice(0)
    expect(result).toContain('0')
    expect(result).toContain('₹')
  })

  it('formats 1 rupee as ₹1', () => {
    const result = formatPrice(1)
    expect(result).toContain('1')
    expect(result).toContain('₹')
  })

  it('formats 100000 rupees (₹1,00,000) correctly', () => {
    const result = formatPrice(100000)
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
