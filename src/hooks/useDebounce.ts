'use client'

/**
 * useDebounce — returns a debounced copy of `value` that only updates after
 * `delay` milliseconds of inactivity.
 *
 * Requirements: 18.2
 *
 * @example
 * const debouncedQuery = useDebounce(searchQuery, 300)
 */

import { useState, useEffect } from 'react'

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    // Cancel the previous timer if value or delay changes before it fires.
    return () => {
      clearTimeout(timer)
    }
  }, [value, delay])

  return debouncedValue
}
