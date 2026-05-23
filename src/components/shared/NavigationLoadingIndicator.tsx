'use client'

/**
 * NavigationLoadingIndicator — shows instant visual feedback during navigation.
 *
 * Uses the NavigationLoadingProvider to detect when navigation starts and
 * shows a subtle loading indicator that appears immediately on click.
 *
 * This solves the "loading feels slow" problem by providing feedback
 * before the page content starts rendering.
 *
 * Requirements: Navigation feedback
 */

import { useEffect } from 'react'
import { useNavigationLoading } from '@/components/providers/NavigationLoadingProvider'
import { Loader2 } from 'lucide-react'

export function NavigationLoadingIndicator() {
  const { isNavigating } = useNavigationLoading()

  // Log navigation state for debugging
  useEffect(() => {
    if (isNavigating) {
      console.log('NavigationLoadingIndicator: Navigation started')
    } else {
      console.log('NavigationLoadingIndicator: Navigation complete')
    }
  }, [isNavigating])

  if (!isNavigating) return null

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-white/50 backdrop-blur-[1px]"
      role="status"
      aria-live="polite"
      aria-label="Loading..."
    >
      <div className="flex flex-col items-center gap-3">
        <Loader2 size={32} className="animate-spin text-brand" aria-hidden="true" />
        <span className="text-sm font-medium text-brand">Loading...</span>
      </div>
    </div>
  )
}
