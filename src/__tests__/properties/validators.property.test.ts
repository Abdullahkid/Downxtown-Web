// Feature: web-buyer-app, Property 3: Password validation correctness

/**
 * Property 3: Password Validation Correctness
 *
 * For any string, validatePassword must return:
 *   - isValid === (length >= 8 && hasUppercase && hasLowercase && hasDigit)
 *   - Each error string appears in the set iff its corresponding rule is violated
 *   - Error set is empty iff isValid is true
 *
 * Validates: Requirements 3.4, 3.5
 */

import * as fc from 'fast-check'
import { describe, it } from 'vitest'
import { validatePassword } from '@/lib/utils/validators'

// Expected error messages (must match the implementation exactly)
const ERROR_MIN_LENGTH = 'Password must be at least 8 characters'
const ERROR_UPPERCASE = 'Password must contain at least one uppercase letter'
const ERROR_LOWERCASE = 'Password must contain at least one lowercase letter'
const ERROR_DIGIT = 'Password must contain at least one digit'

describe('Property 3: Password validation correctness', () => {
  it(
    'isValid iff length >= 8 AND hasUppercase AND hasLowercase AND hasDigit',
    () => {
      fc.assert(
        fc.property(fc.string(), (password) => {
          const { isValid, errors } = validatePassword(password)

          const hasMinLength = password.length >= 8
          const hasUppercase = /[A-Z]/.test(password)
          const hasLowercase = /[a-z]/.test(password)
          const hasDigit = /[0-9]/.test(password)

          const expectedValid =
            hasMinLength && hasUppercase && hasLowercase && hasDigit

          return isValid === expectedValid
        }),
        { numRuns: 25 }
      )
    }
  )

  it(
    'each error appears in the set iff its corresponding rule is violated',
    () => {
      fc.assert(
        fc.property(fc.string(), (password) => {
          const { errors } = validatePassword(password)

          const hasMinLength = password.length >= 8
          const hasUppercase = /[A-Z]/.test(password)
          const hasLowercase = /[a-z]/.test(password)
          const hasDigit = /[0-9]/.test(password)

          // Min-length error present iff rule is violated
          if (!hasMinLength && !errors.has(ERROR_MIN_LENGTH)) return false
          if (hasMinLength && errors.has(ERROR_MIN_LENGTH)) return false

          // Uppercase error present iff rule is violated
          if (!hasUppercase && !errors.has(ERROR_UPPERCASE)) return false
          if (hasUppercase && errors.has(ERROR_UPPERCASE)) return false

          // Lowercase error present iff rule is violated
          if (!hasLowercase && !errors.has(ERROR_LOWERCASE)) return false
          if (hasLowercase && errors.has(ERROR_LOWERCASE)) return false

          // Digit error present iff rule is violated
          if (!hasDigit && !errors.has(ERROR_DIGIT)) return false
          if (hasDigit && errors.has(ERROR_DIGIT)) return false

          return true
        }),
        { numRuns: 25 }
      )
    }
  )

  it('error set is empty iff isValid is true', () => {
    fc.assert(
      fc.property(fc.string(), (password) => {
        const { isValid, errors } = validatePassword(password)

        if (isValid && errors.size !== 0) return false
        if (!isValid && errors.size === 0) return false

        return true
      }),
      { numRuns: 25 }
    )
  })
})

// Feature: web-buyer-app, Property 9: Address validation

import { validateAddress } from '@/lib/utils/validators'
import type { Address } from '@/types/user'

/**
 * Property 9: Address Validation
 *
 * For any address object where each of addressLine1, city, state, and pincode
 * is independently either empty, whitespace-only, or a valid non-empty string,
 * validateAddress(address) must return true if and only if all four fields are
 * non-empty and non-whitespace-only.
 *
 * Validates: Requirements 28.7
 */
describe('Property 9: Address validation', () => {
  // Produces one of: empty string, whitespace-only, or a valid non-empty string
  const fieldArb = fc.oneof(
    // empty
    fc.constant(''),
    // whitespace-only (spaces, tabs, newlines)
    fc.stringOf(fc.constantFrom(' ', '\t', '\n'), { minLength: 1, maxLength: 10 }),
    // valid: at least one non-whitespace character
    fc.string({ minLength: 1 }).filter((s) => s.trim().length > 0),
  )

  it(
    'returns true iff all four required fields are non-empty and non-whitespace-only',
    () => {
      fc.assert(
        fc.property(
          fieldArb, // addressLine1
          fieldArb, // city
          fieldArb, // state
          fieldArb, // pincode
          (addressLine1, city, state, pincode) => {
            const address: Partial<Address> = {
              addressLine1,
              city,
              state,
              pincode,
            }

            const result = validateAddress(address)

            const allValid =
              addressLine1.trim().length > 0 &&
              city.trim().length > 0 &&
              state.trim().length > 0 &&
              pincode.trim().length > 0

            return result === allValid
          },
        ),
        { numRuns: 25 },
      )
    },
  )

  it('returns false when any single required field is absent', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('addressLine1', 'city', 'state', 'pincode') as fc.Arbitrary<
          'addressLine1' | 'city' | 'state' | 'pincode'
        >,
        fc.string({ minLength: 1 }).filter((s) => s.trim().length > 0),
        fc.string({ minLength: 1 }).filter((s) => s.trim().length > 0),
        fc.string({ minLength: 1 }).filter((s) => s.trim().length > 0),
        fc.string({ minLength: 1 }).filter((s) => s.trim().length > 0),
        (missingField, v1, v2, v3, v4) => {
          const full: Record<string, string> = {
            addressLine1: v1,
            city: v2,
            state: v3,
            pincode: v4,
          }
          const address: Partial<Address> = { ...full }
          delete address[missingField]

          return validateAddress(address) === false
        },
      ),
      { numRuns: 25 },
    )
  })
})
