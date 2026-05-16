// Feature: web-buyer-app, Property 6: WebSocket exponential backoff

import * as fc from 'fast-check'
import { describe, it, expect } from 'vitest'
import { getBackoffDelay } from '@/hooks/useWebSocket'

// ---------------------------------------------------------------------------
// Property 6: WebSocket Exponential Backoff
// ---------------------------------------------------------------------------

/**
 * Property 6: WebSocket Exponential Backoff
 *
 * For any reconnect attempt number `n` in the range [0, 9], the
 * `getBackoffDelay(n)` function must return `Math.min(1000 * Math.pow(2, n), 30_000)`
 * milliseconds, and the result must never exceed 30,000 ms.
 *
 * **Validates: Requirements 15.8**
 */
describe('Property 6: WebSocket Exponential Backoff', () => {
  it('getBackoffDelay(n) === Math.min(1000 * 2^n, 30_000) for all n in [0, 9]', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 9 }),
        (n) => {
          const result = getBackoffDelay(n)
          const expected = Math.min(1000 * Math.pow(2, n), 30_000)
          return result === expected
        }
      ),
      { numRuns: 25 }
    )
  })

  it('getBackoffDelay(n) never exceeds 30,000 ms for any n in [0, 9]', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 9 }),
        (n) => {
          const result = getBackoffDelay(n)
          return result <= 30_000
        }
      ),
      { numRuns: 25 }
    )
  })

  it('getBackoffDelay(n) is always a positive number for all n in [0, 9]', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 9 }),
        (n) => {
          const result = getBackoffDelay(n)
          return result > 0
        }
      ),
      { numRuns: 25 }
    )
  })

  it('exhaustive check — all 10 attempt values produce the correct delay', () => {
    for (let n = 0; n <= 9; n++) {
      const result = getBackoffDelay(n)
      const expected = Math.min(1000 * Math.pow(2, n), 30_000)
      expect(result).toBe(expected)
      expect(result).toBeLessThanOrEqual(30_000)
    }
  })
})
