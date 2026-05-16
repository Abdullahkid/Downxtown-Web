'use client'

/**
 * useOnlineStatus — returns `true` when the browser has network connectivity
 * and `false` when offline.
 *
 * Initialises from `navigator.onLine` and stays in sync by listening to the
 * `online` and `offline` events on `window`.
 *
 * Requirements: 18.6, 26.6
 */

import { useState, useEffect } from 'react'

export function useOnlineStatus(): boolean {
  // Initialise from the current browser state; default to true in SSR.
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true,
  )

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Sync once on mount in case the state changed between SSR and hydration.
    setIsOnline(navigator.onLine)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return isOnline
}
