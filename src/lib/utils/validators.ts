/**
 * Validation utilities for the DownXtown Web Buyer App.
 * Requirements: 3.4, 3.5, 28.7
 */

import type { Address } from '@/types/user'

// ---------------------------------------------------------------------------
// Password validation
// ---------------------------------------------------------------------------

const PASSWORD_ERRORS = {
  MIN_LENGTH: 'Password must be at least 8 characters',
  UPPERCASE: 'Password must contain at least one uppercase letter',
  LOWERCASE: 'Password must contain at least one lowercase letter',
  DIGIT: 'Password must contain at least one digit',
} as const

/**
 * Validates a password against the platform's complexity rules.
 *
 * Rules enforced:
 *  - Minimum length of 8 characters
 *  - At least one uppercase letter (A–Z)
 *  - At least one lowercase letter (a–z)
 *  - At least one digit (0–9)
 *
 * @returns `{ isValid, errors }` where `errors` is a Set of human-readable
 *          error strings for every unmet rule (empty when `isValid` is true).
 */
export function validatePassword(password: string): {
  isValid: boolean
  errors: Set<string>
} {
  const errors = new Set<string>()

  if (password.length < 8) {
    errors.add(PASSWORD_ERRORS.MIN_LENGTH)
  }

  if (!/[A-Z]/.test(password)) {
    errors.add(PASSWORD_ERRORS.UPPERCASE)
  }

  if (!/[a-z]/.test(password)) {
    errors.add(PASSWORD_ERRORS.LOWERCASE)
  }

  if (!/[0-9]/.test(password)) {
    errors.add(PASSWORD_ERRORS.DIGIT)
  }

  return { isValid: errors.size === 0, errors }
}

// ---------------------------------------------------------------------------
// Address validation
// ---------------------------------------------------------------------------

/**
 * Returns `true` iff all four required address fields (`addressLine1`, `city`,
 * `state`, `pincode`) are present, non-empty, and non-whitespace-only.
 *
 * Accepts a `Partial<Address>` so it can be used during incremental form
 * validation before all optional fields are filled in.
 */
export function validateAddress(address: Partial<Address>): boolean {
  const requiredFields: Array<keyof Address> = [
    'addressLine1',
    'city',
    'state',
    'pincode',
  ]

  return requiredFields.every((field) => {
    const value = address[field]
    return typeof value === 'string' && value.trim().length > 0
  })
}
