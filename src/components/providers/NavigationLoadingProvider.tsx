'use client'

/**
 * NavigationLoadingProvider — provides instant visual feedback during navigation.
 *
 * Uses Next.js router events to detect when navigation starts and sets a
 * global loading state that can be consumed by any component.
 *
 * This solves the "loading feels slow" problem by showing feedback immediately
 * on click, not after the page starts rendering.
 *
 * Requirements: Navigation feedback
 */

import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'

interface NavigationLoadingContextType {
  isNavigating: boolean
}

const NavigationLoadingContext = createContext<NavigationLoadingContextType | undefined>(undefined)

export function NavigationLoadingProvider({ children }: { children: React.ReactNode }) {
  const [isNavigating, setIsNavigating] = useState(false)
  const router = useRouter()

  // Track navigation start/end using router events
  useEffect(() => {
    const handleStart = () => setIsNavigating(true)
    const handleComplete = () => setIsNavigating(false)

    // Listen to router events
    const unlisten = router.events.on('routeChangeStart', handleStart)
    const unlistenComplete = router.events.on('routeChangeComplete', handleComplete)
    const unlistenError = router.events.on('routeChangeError', handleComplete)

    return () => {
      unlisten()
      unlistenComplete()
      unlistenError()
    }
  }, [router.events])

  return (
    <NavigationLoadingContext.Provider value={{ isNavigating }}>
      {children}
    </NavigationLoadingContext.Provider>
  )
}

export function useNavigationLoading() {
  const context = useContext(NavigationLoadingContext)
  if (context === undefined) {
    // Fallback for when used outside provider (shouldn't happen in production)
    return { isNavigating: false }
  }
  return context
}
