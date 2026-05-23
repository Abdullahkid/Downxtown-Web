'use client'

import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'

interface NavigationFeedbackContextValue {
  beginNavigation: (href?: string) => void
}

const NavigationFeedbackContext = createContext<NavigationFeedbackContextValue | null>(null)

export function NavigationFeedbackProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isNavigating, setIsNavigating] = useState(false)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const clearPendingTimeout = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
  }, [])

  const beginNavigation = useCallback(() => {
    setIsNavigating(true)
    clearPendingTimeout()

    timeoutRef.current = setTimeout(() => {
      setIsNavigating(false)
      timeoutRef.current = null
    }, 8000)
  }, [clearPendingTimeout])

  useEffect(() => {
    if (!isNavigating) return

    clearPendingTimeout()
    setIsNavigating(false)
  }, [pathname, searchParams, isNavigating, clearPendingTimeout])

  useEffect(() => () => clearPendingTimeout(), [clearPendingTimeout])

  const value = useMemo(
    () => ({ beginNavigation }),
    [beginNavigation],
  )

  return (
    <NavigationFeedbackContext.Provider value={value}>
      <div
        aria-hidden="true"
        className={[
          'pointer-events-none fixed inset-x-0 top-0 z-[70] h-[3px] overflow-hidden',
          isNavigating ? 'opacity-100' : 'opacity-0',
          'transition-opacity duration-150',
        ].join(' ')}
      >
        <div
          className={[
            'h-full w-full origin-left bg-gradient-to-r from-brand via-brand-accent to-brand',
            isNavigating ? 'animate-route-progress scale-x-100' : 'scale-x-0',
          ].join(' ')}
        />
      </div>
      <div
        className={[
          'transition-[opacity,filter] duration-150',
          isNavigating ? 'opacity-[0.985] saturate-[0.98]' : 'opacity-100',
        ].join(' ')}
      >
        {children}
      </div>
    </NavigationFeedbackContext.Provider>
  )
}

export function useNavigationFeedback() {
  const context = useContext(NavigationFeedbackContext)
  if (!context) {
    throw new Error('useNavigationFeedback must be used within NavigationFeedbackProvider')
  }
  return context
}
