// Feature: web-buyer-app, Property 1: Image URL round-trip

import { describe, it } from 'vitest'
import * as fc from 'fast-check'
import { buildImageUrl, parseImageId } from '@/lib/image/imageUrls'
import type { ImageEndpoint } from '@/types/product'

/**
 * Property 1: Image URL Round-Trip
 *
 * For any valid imageId string and any image endpoint type, building a URL
 * from the imageId and then parsing the imageId back from that URL must
 * return the original imageId.
 *
 * Formally: parseImageId(buildImageUrl(endpoint, imageId)) === imageId
 *
 * Validates: Requirements 6.7
 */
describe('Property 1: Image URL Round-Trip', () => {
  it('parseImageId(buildImageUrl(endpoint, imageId)) === imageId for all valid endpoints and imageIds', () => {
    fc.assert(
      fc.property(
        fc.constantFrom<ImageEndpoint>(
          'preview',
          'detail',
          'fullscreen',
          'banner',
          'display',
          'original'
        ),
        // Valid image IDs are alphanumeric strings (with optional hyphens/underscores),
        // matching real server-side identifiers (e.g. MongoDB ObjectIds, UUIDs).
        // We use fc.stringMatching to constrain to characters that survive URL round-trips
        // without percent-encoding or whitespace trimming issues.
        fc.stringMatching(/^[a-zA-Z0-9_-]+$/),
        (endpoint, imageId) => {
          const url = buildImageUrl(endpoint, imageId)
          return parseImageId(url) === imageId
        }
      ),
      { numRuns: 25 }
    )
  })
})
