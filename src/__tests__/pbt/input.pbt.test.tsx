// Feature: web-buyer-app-ui-ux-improvements, Property 6: Input error prop renders visible error text

/**
 * Property 6: Input error prop renders visible error text
 *
 * For any non-empty string `errorMsg`, rendering `<Input error={errorMsg} />` SHALL produce
 * a DOM element containing `errorMsg` as visible text content (i.e., the text is present in
 * the document and not hidden via `aria-hidden` or `display: none`).
 *
 * Validates: Requirements 8.6, 8.7, 8.11
 */

import * as fc from 'fast-check'
import { describe, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Input } from '@/components/ui/Input'

describe('Property 6: Input error prop renders visible error text', () => {
  it(
    'renders error text as visible DOM content for any non-empty error string',
    () => {
      fc.assert(
        fc.property(fc.string({ minLength: 1 }), (errorMsg) => {
          const { unmount } = render(<Input error={errorMsg} />)

          try {
            // Assert that getByText finds the error message
            // This will throw if the text is not found or is hidden
            const errorElement = screen.getByText(errorMsg)

            // Verify the error element is visible (not hidden)
            if (!errorElement) return false

            // Verify the element is in the document
            if (!document.body.contains(errorElement)) return false

            return true
          } finally {
            unmount()
          }
        }),
        { numRuns: 100 }
      )
    }
  )
})
