// Feature: web-buyer-app-ui-ux-improvements, Property 5: Button variant renders without error and produces non-empty className

/**
 * Property 5: Button variant renders without error and produces non-empty className
 *
 * For any valid `variant` string from {primary, secondary, ghost, destructive},
 * rendering <Button variant={variant}>Label</Button> SHALL complete without throwing
 * a React error and the rendered <button> element SHALL have a non-empty `className` attribute.
 *
 * Validates: Requirements 8.1, 8.10
 */

import * as fc from 'fast-check'
import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { Button, type ButtonVariant } from '@/components/ui/Button'

describe('Property 5: Button variant renders without error and produces non-empty className', () => {
  it(
    'renders without error and produces non-empty className for any valid variant',
    () => {
      fc.assert(
        fc.property(
          fc.constantFrom('primary', 'secondary', 'ghost', 'destructive') as fc.Arbitrary<ButtonVariant>,
          (variant) => {
            // Render the button with the given variant
            const { container } = render(
              <Button variant={variant}>Test Label</Button>
            )

            // Get the button element
            const button = container.querySelector('button')

            // Assert button exists
            if (!button) return false

            // Assert className is non-empty
            const className = button.getAttribute('className')
            if (!className || className.trim().length === 0) return false

            return true
          }
        ),
        { numRuns: 100 }
      )
    }
  )
})
