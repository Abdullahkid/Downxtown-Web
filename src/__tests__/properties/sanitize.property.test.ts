// Feature: web-buyer-app, Property 8: XSS sanitization

/**
 * Property 8: XSS Sanitization
 *
 * For any string (including strings containing <script> tags, javascript: URLs,
 * onerror handlers, and other XSS payloads), sanitize(input) must return a
 * string that contains no executable script content.
 *
 * Specifically, the output must not match any of:
 *   - /<script/i
 *   - /javascript:/i
 *   - /on\w+\s*=/i
 *
 * Validates: Requirements 27.5
 */

import * as fc from 'fast-check'
import { describe, it } from 'vitest'
import { sanitize } from '@/lib/sanitize/sanitize'

// XSS patterns that must never appear in sanitized output
const SCRIPT_TAG_PATTERN = /<script/i
const JAVASCRIPT_PROTOCOL_PATTERN = /javascript:/i
const EVENT_HANDLER_PATTERN = /on\w+\s*=/i

// Arbitrary that generates strings with embedded XSS payloads
const xssPayloadArb = fc.oneof(
  // Plain arbitrary strings (baseline)
  fc.string(),
  // Strings with <script> tags
  fc.tuple(fc.string(), fc.string()).map(
    ([pre, post]) => `${pre}<script>alert(1)</script>${post}`
  ),
  // Strings with javascript: protocol
  fc.tuple(fc.string(), fc.string()).map(
    ([pre, post]) => `${pre}<a href="javascript:alert(1)">${post}</a>`
  ),
  // Strings with on* event handlers
  fc.tuple(fc.string(), fc.string(), fc.string()).map(
    ([pre, event, post]) =>
      `${pre}<img src=x onerror="alert(1)">${post}${event}`
  ),
  // Strings with onload handlers
  fc.tuple(fc.string(), fc.string()).map(
    ([pre, post]) => `${pre}<body onload="alert(1)">${post}`
  ),
  // Strings with onclick handlers
  fc.tuple(fc.string(), fc.string()).map(
    ([pre, post]) => `${pre}<div onclick="evil()">${post}</div>`
  ),
  // Mixed / nested payloads
  fc.tuple(fc.string(), fc.string()).map(
    ([pre, post]) =>
      `${pre}<ScRiPt>alert('xss')</ScRiPt><a href="JAVASCRIPT:void(0)" onmouseover="x()">click</a>${post}`
  )
)

describe('Property 8: XSS sanitization', () => {
  it(
    'sanitized output must not contain <script tags',
    () => {
      fc.assert(
        fc.property(xssPayloadArb, (input) => {
          const output = sanitize(input)
          return !SCRIPT_TAG_PATTERN.test(output)
        }),
        { numRuns: 25 }
      )
    }
  )

  it(
    'sanitized output must not contain javascript: protocol',
    () => {
      fc.assert(
        fc.property(xssPayloadArb, (input) => {
          const output = sanitize(input)
          return !JAVASCRIPT_PROTOCOL_PATTERN.test(output)
        }),
        { numRuns: 25 }
      )
    }
  )

  it(
    'sanitized output must not contain on* event handler attributes',
    () => {
      fc.assert(
        fc.property(xssPayloadArb, (input) => {
          const output = sanitize(input)
          return !EVENT_HANDLER_PATTERN.test(output)
        }),
        { numRuns: 25 }
      )
    }
  )

  it(
    'sanitized output must not contain any XSS pattern (combined check)',
    () => {
      fc.assert(
        fc.property(xssPayloadArb, (input) => {
          const output = sanitize(input)
          return (
            !SCRIPT_TAG_PATTERN.test(output) &&
            !JAVASCRIPT_PROTOCOL_PATTERN.test(output) &&
            !EVENT_HANDLER_PATTERN.test(output)
          )
        }),
        { numRuns: 25 }
      )
    }
  )
})
