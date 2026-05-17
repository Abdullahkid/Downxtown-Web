// Feature: web-buyer-app-ui-ux-improvements, Property 2: Viewport-responsive navigation rendering

/**
 * Property 2: Viewport-responsive navigation rendering
 *
 * For any viewport width W in the range [320, 2560] pixels, the AppLayout SHALL render
 * <BottomNav /> if and only if W < 1024, and SHALL render <SideRail /> if and only if
 * W >= 1024. These two conditions are mutually exclusive and exhaustive.
 *
 * Validates: Requirements 2.2, 2.3, 2.4, 10.11
 */

import * as fc from 'fast-check'
import { describe, it, beforeEach, afterEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { AppLayout } from '@/app/(app)/layout'

// Mock the child components to avoid rendering the entire app tree
vi.mock('@/components/layout', () => ({
  AppBar: () => <div data-testid="app-bar">AppBar</div>,
  BottomNav: () => <nav data-testid="bottom-nav">BottomNav</nav>,
  SideRail: () => <nav data-testid="side-rail">SideRail</nav>,
  PageShell: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="page-shell">{children}</div>
  ),
}))

vi.mock('@/components/shared', () => ({
  ToastContainer: () => <div data-testid="toast-container">ToastContainer</div>,
}))

describe('Property 2: Viewport-responsive navigation rendering', () => {
  let originalInnerWidth: number

  beforeEach(() => {
    // Save the original innerWidth
    originalInnerWidth = window.innerWidth
  })

  afterEach(() => {
    // Restore the original innerWidth
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: originalInnerWidth,
    })
  })

  it(
    'BottomNav present iff W < 1024, SideRail present iff W >= 1024',
    () => {
      fc.assert(
        fc.property(fc.integer({ min: 320, max: 2560 }), (viewportWidth) => {
          // Mock the window.innerWidth for this viewport width
          Object.defineProperty(window, 'innerWidth', {
            writable: true,
            configurable: true,
            value: viewportWidth,
          })

          // Trigger a resize event to simulate viewport change
          window.dispatchEvent(new Event('resize'))

          // Render the AppLayout
          const { unmount } = render(
            <AppLayout>
              <div data-testid="page-content">Test Content</div>
            </AppLayout>
          )

          try {
            // Check BottomNav visibility
            const bottomNav = screen.queryByTestId('bottom-nav')
            const sideRail = screen.queryByTestId('side-rail')

            // BottomNav should be present iff W < 1024
            const bottomNavShouldBePresent = viewportWidth < 1024
            const bottomNavIsPresent = bottomNav !== null

            // SideRail should be present iff W >= 1024
            const sideRailShouldBePresent = viewportWidth >= 1024
            const sideRailIsPresent = sideRail !== null

            // Both conditions must hold
            const bottomNavCondition = bottomNavIsPresent === bottomNavShouldBePresent
            const sideRailCondition = sideRailIsPresent === sideRailShouldBePresent

            return bottomNavCondition && sideRailCondition
          } finally {
            unmount()
          }
        }),
        { numRuns: 100 }
      )
    }
  )

  it(
    'BottomNav and SideRail are mutually exclusive (never both present)',
    () => {
      fc.assert(
        fc.property(fc.integer({ min: 320, max: 2560 }), (viewportWidth) => {
          // Mock the window.innerWidth for this viewport width
          Object.defineProperty(window, 'innerWidth', {
            writable: true,
            configurable: true,
            value: viewportWidth,
          })

          // Trigger a resize event to simulate viewport change
          window.dispatchEvent(new Event('resize'))

          // Render the AppLayout
          const { unmount } = render(
            <AppLayout>
              <div data-testid="page-content">Test Content</div>
            </AppLayout>
          )

          try {
            const bottomNav = screen.queryByTestId('bottom-nav')
            const sideRail = screen.queryByTestId('side-rail')

            // At most one of them should be present
            const bothPresent = bottomNav !== null && sideRail !== null
            const neitherPresent = bottomNav === null && sideRail === null

            // Invalid states: both present or neither present
            return !bothPresent && !neitherPresent
          } finally {
            unmount()
          }
        }),
        { numRuns: 100 }
      )
    }
  )

  it(
    'exactly one navigation component is always rendered',
    () => {
      fc.assert(
        fc.property(fc.integer({ min: 320, max: 2560 }), (viewportWidth) => {
          // Mock the window.innerWidth for this viewport width
          Object.defineProperty(window, 'innerWidth', {
            writable: true,
            configurable: true,
            value: viewportWidth,
          })

          // Trigger a resize event to simulate viewport change
          window.dispatchEvent(new Event('resize'))

          // Render the AppLayout
          const { unmount } = render(
            <AppLayout>
              <div data-testid="page-content">Test Content</div>
            </AppLayout>
          )

          try {
            const bottomNav = screen.queryByTestId('bottom-nav')
            const sideRail = screen.queryByTestId('side-rail')

            // Exactly one should be present
            const count = (bottomNav !== null ? 1 : 0) + (sideRail !== null ? 1 : 0)
            return count === 1
          } finally {
            unmount()
          }
        }),
        { numRuns: 100 }
      )
    }
  )

  it(
    'breakpoint at 1024px is the exact transition point',
    () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 320, max: 1023 }),
          fc.integer({ min: 1024, max: 2560 })
        ),
        (mobileWidth, desktopWidth) => {
          // Test mobile viewport (< 1024)
          Object.defineProperty(window, 'innerWidth', {
            writable: true,
            configurable: true,
            value: mobileWidth,
          })
          window.dispatchEvent(new Event('resize'))

          const { unmount: unmountMobile } = render(
            <AppLayout>
              <div data-testid="page-content">Test Content</div>
            </AppLayout>
          )

          const mobileBottomNav = screen.queryByTestId('bottom-nav')
          const mobileSideRail = screen.queryByTestId('side-rail')
          const mobileCondition =
            mobileBottomNav !== null && mobileSideRail === null

          unmountMobile()

          // Test desktop viewport (>= 1024)
          Object.defineProperty(window, 'innerWidth', {
            writable: true,
            configurable: true,
            value: desktopWidth,
          })
          window.dispatchEvent(new Event('resize'))

          const { unmount: unmountDesktop } = render(
            <AppLayout>
              <div data-testid="page-content">Test Content</div>
            </AppLayout>
          )

          const desktopBottomNav = screen.queryByTestId('bottom-nav')
          const desktopSideRail = screen.queryByTestId('side-rail')
          const desktopCondition =
            desktopBottomNav === null && desktopSideRail !== null

          unmountDesktop()

          return mobileCondition && desktopCondition
        },
        { numRuns: 100 }
      )
    }
  )
})
