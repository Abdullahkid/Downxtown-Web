// Feature: web-buyer-app-ui-ux-improvements, Property 3: Toast queue FIFO ordering and exact count

/**
 * Property 3: Toast queue FIFO ordering and exact count
 *
 * For any array of N toast objects where 1 ≤ N ≤ 10, after calling addToast
 * for each toast in sequence (before any auto-dismiss timer fires), the
 * toastQueue array SHALL contain exactly N items and the items SHALL appear
 * in the same order as they were added (FIFO — first added is first in the array).
 *
 * Validates: Requirements 3.5, 3.8
 */

import * as fc from 'fast-check'
import { describe, it, beforeEach } from 'vitest'
import { useUiStore, type Toast } from '@/store/uiStore'

describe('Property 3: Toast queue FIFO ordering and exact count', () => {
  beforeEach(() => {
    // Reset the store before each run to ensure a clean state
    useUiStore.setState({ toastQueue: [] })
  })

  it(
    'toastQueue contains exactly N items after N addToast calls, in FIFO order',
    () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              id: fc.uuid(),
              message: fc.string({ minLength: 1 }),
              type: fc.constantFrom('success', 'error', 'info'),
            }),
            { minLength: 1, maxLength: 10 }
          ),
          (toasts) => {
            // Reset store before each property run
            useUiStore.setState({ toastQueue: [] })

            const store = useUiStore.getState()

            // Add each toast in sequence
            toasts.forEach((toast) => {
              store.addToast(toast)
            })

            // Get the current queue
            const queue = useUiStore.getState().toastQueue

            // Property 1: Exact count
            if (queue.length !== toasts.length) {
              return false
            }

            // Property 2: FIFO order — each toast appears in the same position
            for (let i = 0; i < toasts.length; i++) {
              if (queue[i].id !== toasts[i].id) {
                return false
              }
              if (queue[i].message !== toasts[i].message) {
                return false
              }
              if (queue[i].type !== toasts[i].type) {
                return false
              }
            }

            return true
          }
        ),
        { numRuns: 100 }
      )
    }
  )
})
