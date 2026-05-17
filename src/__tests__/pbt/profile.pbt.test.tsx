// Feature: web-buyer-app-ui-ux-improvements, Property 10: Profile wishlist View All visibility threshold

/**
 * Property 10: Profile wishlist View All visibility threshold
 *
 * For any wishlist item count N >= 0, the ProfilePage SHALL render the "View All"
 * navigation link if and only if N > 4. For N <= 4, the link SHALL be absent from the DOM.
 *
 * Validates: Requirements 6.7, 6.8
 */

import * as fc from 'fast-check'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { useAuthStore } from '@/store/authStore'
import { useUiStore } from '@/store/uiStore'
import type { Personal } from '@/types/user'

// Mock the components and hooks
vi.mock('@/store/authStore')
vi.mock('@/store/uiStore')
vi.mock('@/components/profile', () => ({
  ProfileStats: () => <div data-testid="profile-stats">Profile Stats</div>,
  AddressManager: () => <div data-testid="address-manager">Address Manager</div>,
  WishlistGrid: () => <div data-testid="wishlist-grid">Wishlist Grid</div>,
}))
vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    signOut: vi.fn(),
  }),
}))
vi.mock('@/lib/api/apiClient', () => ({
  api: {
    get: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
  ApiError: class ApiError extends Error {
    status: number
    constructor(message: string, status: number) {
      super(message)
      this.status = status
    }
  },
}))
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}))

// Import the component after mocking
import ProfilePage from '@/app/(app)/profile/page'

describe('Property 10: Profile wishlist View All visibility threshold', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it(
    'renders "View All" link if and only if wishlist count > 4',
    () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 50 }),
          (wishlistCount) => {
            // Reset mocks before each run
            vi.clearAllMocks()

            // Mock the auth store with a user that has the given wishlist count
            const mockUser: Personal = {
              id: 'user-123',
              name: 'Test User',
              username: 'testuser',
              email: 'test@example.com',
              gender: 'MALE',
              dateOfBirth: '1990-01-01',
              profileImage: null,
              wishlistCount,
              cartCount: 0,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            }

            // Mock useAuthStore
            ;(useAuthStore as any).mockReturnValue({
              user: mockUser,
              firebaseUser: { uid: 'user-123' },
              setUser: vi.fn(),
            })

            // Mock useUiStore
            ;(useUiStore as any).mockReturnValue({
              addToast: vi.fn(),
              setWishlistCount: vi.fn(),
              setCartCount: vi.fn(),
            })

            // Render the component
            const { container } = render(<ProfilePage />)

            // Find the "View All" link
            const viewAllLink = container.querySelector('a[href="/wishlist"]')

            // Assert: link should exist if and only if wishlistCount > 4
            if (wishlistCount > 4) {
              // Link MUST be present
              if (!viewAllLink) return false
              // Link text should contain "View All"
              if (!viewAllLink.textContent?.includes('View All')) return false
            } else {
              // Link MUST NOT be present
              if (viewAllLink) return false
            }

            return true
          }
        ),
        { numRuns: 100 }
      )
    }
  )
})
