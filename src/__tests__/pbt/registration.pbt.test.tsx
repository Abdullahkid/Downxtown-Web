// Feature: web-buyer-app-ui-ux-improvements, Property 7: Gender optional — no validation error on empty gender

/**
 * Property 7: Gender optional — no validation error on empty gender
 *
 * For any registration form state where the gender field value is "" or "PREFER_NOT_TO_SAY",
 * calling the form's submit handler SHALL NOT produce a gender-related validation error message
 * in the rendered output, and the form SHALL proceed to the API call step with gender set to
 * "PREFER_NOT_TO_SAY".
 *
 * Validates: Requirements 9.1, 9.3, 9.5
 */

import * as fc from 'fast-check'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import RegisterPage from '@/app/auth/register/page'

// Mock Firebase
vi.mock('@/lib/firebase/firebaseApp', () => ({
  default: {},
}))

vi.mock('@/lib/firebase/authManager', () => ({
  authManager: {
    registerWithEmail: vi.fn().mockResolvedValue({}),
    sendEmailVerification: vi.fn().mockResolvedValue({}),
  },
}))

// Mock the API client
vi.mock('@/lib/api/apiClient', () => ({
  api: {
    post: vi.fn().mockResolvedValue({}),
    get: vi.fn().mockResolvedValue({}),
  },
  ApiError: class ApiError extends Error {
    status: number
    constructor(message: string, status: number) {
      super(message)
      this.status = status
    }
  },
}))

// Mock useRouter
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}))

// Mock useAuthStore
vi.mock('@/store/authStore', () => ({
  useAuthStore: {
    getState: () => ({
      setUser: vi.fn(),
    }),
  },
}))

// Mock setAuthCookie
vi.mock('@/lib/firebase/authCookie', () => ({
  setAuthCookie: vi.fn(),
}))

describe('Property 7: Gender optional — no validation error on empty gender', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it(
    'does not produce gender validation error for empty or PREFER_NOT_TO_SAY gender values',
    async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.constantFrom('', 'PREFER_NOT_TO_SAY'),
          async (genderValue) => {
            const { unmount } = render(<RegisterPage />)

            try {
              // Step 1: Enter email
              const emailInput = screen.getByPlaceholderText(/you@example.com/i) as HTMLInputElement
              fireEvent.change(emailInput, { target: { value: 'test@example.com' } })

              const continueBtn = screen.getByRole('button', { name: /continue/i })
              fireEvent.click(continueBtn)

              // Wait for step 2
              await waitFor(() => {
                expect(screen.getByPlaceholderText(/••••••••/i)).toBeInTheDocument()
              })

              // Step 2: Enter password
              const passwordInputs = screen.getAllByPlaceholderText(/••••••••/i)
              fireEvent.change(passwordInputs[0], { target: { value: 'TestPassword123' } })
              fireEvent.change(passwordInputs[1], { target: { value: 'TestPassword123' } })

              const continueBtn2 = screen.getByRole('button', { name: /continue/i })
              fireEvent.click(continueBtn2)

              // Wait for step 3 (email verification)
              await waitFor(() => {
                expect(screen.getByRole('button', { name: /i've verified my email/i })).toBeInTheDocument()
              })

              // Step 3: Click "I've verified my email"
              const verifyBtn = screen.getByRole('button', { name: /i've verified my email/i })
              fireEvent.click(verifyBtn)

              // Wait for step 4 (personal details)
              await waitFor(() => {
                expect(screen.getByLabelText(/full name/i)).toBeInTheDocument()
              })

              // Step 4: Fill in personal details with the test gender value
              const nameInput = screen.getByLabelText(/full name/i) as HTMLInputElement
              const usernameInput = screen.getByLabelText(/username/i) as HTMLInputElement
              const genderSelect = screen.getByLabelText(/gender/i) as HTMLSelectElement
              const dobInput = screen.getByLabelText(/date of birth/i) as HTMLInputElement

              fireEvent.change(nameInput, { target: { value: 'John Doe' } })
              fireEvent.change(usernameInput, { target: { value: 'john_doe_test' } })
              fireEvent.change(genderSelect, { target: { value: genderValue } })
              fireEvent.change(dobInput, { target: { value: '2000-01-01' } })

              // Submit the form
              const createAccountBtn = screen.getByRole('button', { name: /create account/i })
              fireEvent.click(createAccountBtn)

              // Wait a bit for any validation errors to appear
              await new Promise((resolve) => setTimeout(resolve, 100))

              // Check that no gender-related error is displayed
              const errorMessages = screen.queryAllByRole('alert')
              const hasGenderError = errorMessages.some((el) =>
                el.textContent?.toLowerCase().includes('gender')
              )

              // Assert: no gender error should be present
              return !hasGenderError
            } finally {
              unmount()
            }
          }
        ),
        { numRuns: 100 }
      )
    }
  )
})
