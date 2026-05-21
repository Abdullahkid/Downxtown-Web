// Feature: web-buyer-app, Property 2: Product URL round-trip

import { describe, it } from 'vitest'
import * as fc from 'fast-check'
import { buildProductUrl, parseProductId } from '@/lib/utils/urlBuilders'

/** A real-looking 24-char hex ObjectId used as the productId in property tests. */
const OBJECT_ID = '695d5897429a7676c733204c'

/**
 * Property 2: Product URL Round-Trip
 *
 * For any valid slug string combined with a fixed ObjectId, building the
 * canonical SEO product URL and then parsing the productId back must always
 * return the original ObjectId.
 *
 * Formally: parseProductId(buildProductUrl(OBJECT_ID, slug)) === OBJECT_ID
 *
 * The slug is the human-readable prefix (shopifyHandle or title-derived).
 * The ObjectId is the last 24 lowercase hex chars of the URL path segment.
 * parseProductId always extracts those last 24 chars — so the round-trip must
 * hold for any slug prefix, including ones with hyphens and numbers.
 *
 * Validates: Requirements 10.14
 */
describe('Property 2: Product URL Round-Trip', () => {
  it('parseProductId(buildProductUrl(id, slug)) === id for all valid slug prefixes', () => {
    // Valid slug characters: lowercase alphanumeric and hyphens (URL-safe, no encoding needed).
    // Slugs must be non-empty and not end with a hyphen (buildProductSlug trims trailing hyphens).
    const validSlug = fc
      .stringMatching(/^[a-z0-9][a-z0-9-]*[a-z0-9]$/)
      .filter((s) => s.length >= 2)

    fc.assert(
      fc.property(validSlug, (slug) => {
        const url = buildProductUrl(OBJECT_ID, slug)
        return parseProductId(url) === OBJECT_ID
      }),
      { numRuns: 25 }
    )
  })

  it('parseProductId(buildProductUrl(id)) === id for legacy bare-id format', () => {
    // Without a slug, the URL is /product/{24-hex-objectId} — must still round-trip.
    const url = buildProductUrl(OBJECT_ID)
    // Use a manual assertion since property test frameworks can't easily generate valid ObjectIds
    if (parseProductId(url) !== OBJECT_ID) {
      throw new Error(`Round-trip failed: parseProductId("${url}") !== "${OBJECT_ID}"`)
    }
  })
})

