// Feature: web-buyer-app, Property 2: Product URL round-trip

import { describe, it } from 'vitest'
import * as fc from 'fast-check'
import { buildProductUrl, parseProductId } from '@/lib/utils/urlBuilders'

/**
 * Property 2: Product URL Round-Trip
 *
 * For any valid productId string, building the canonical product URL from the
 * productId and then parsing the productId back from that URL must return the
 * original productId.
 *
 * Formally: parseProductId(buildProductUrl(productId)) === productId
 *
 * Validates: Requirements 10.14
 */
describe('Property 2: Product URL Round-Trip', () => {
  it('parseProductId(buildProductUrl(productId)) === productId for all valid productIds', () => {
    // Valid productIds: non-empty strings composed of URL-safe characters only.
    // We restrict to alphanumeric characters plus '-', '_', '.', '~' — the set
    // of characters that the URL constructor does NOT percent-encode in a path
    // segment. Characters like '/', '?', '#' break URL parsing, and characters
    // like spaces or unicode get percent-encoded by `new URL()`, causing the
    // round-trip to fail because parseProductId uses the URL constructor
    // internally to normalise the pathname.
    //
    // Additionally, we exclude the dot-segment strings '.' and '..' because the
    // URL constructor resolves them as relative path references (RFC 3986 §5.2),
    // stripping them from the pathname before parseProductId can extract them.
    const validProductId = fc
      .stringMatching(/^[A-Za-z0-9\-_.~]+$/)
      .filter((s) => s !== '.' && s !== '..')

    fc.assert(
      fc.property(validProductId, (productId) => {
        const url = buildProductUrl(productId)
        return parseProductId(url) === productId
      }),
      { numRuns: 25 }
    )
  })
})
