'use client'

/**
 * OfflineBanner — shown only after the user has gone offline following
 * a confirmed online state. Avoids false positives on initial page load
 * in dev environments where navigator.onLine can be unreliable.
 *
 * Requirements: 18.2, 18.6, 26.6
 */

import { useState, useEffect } from 'react'
import { WifiOff } from 'lucide-react'

export function OfflineBanner() {
  // Start hidden — only show after we've confirmed online then gone offline
  const [show, setShow] = useState(false)

  useEffect(() => {
    // Only activate the banner after the browser fires an actual 'offline' event.
    // This prevents false positives on initial load.
    const handleOffline = () => setShow(true)
    const handleOnline = () => setShow(false)

    window.addEventListener('offline', handleOffline)
    window.addEventListener('online', handleOnline)

    return () => {
      window.removeEventListener('offline', handleOffline)
      window.removeEventListener('online', handleOnline)
    }
  }, [])

  if (!show) return null

  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      aria-label="No Internet Connection"
      className={[
        'fixed bottom-0 left-0 right-0 z-50',
        'flex items-center justify-center gap-2',
        'bg-gray-900 text-white text-sm font-medium',
        'px-4 py-3',
        'transition-transform duration-300 ease-in-out',
      ].join(' ')}
    >
      <WifiOff className="h-4 w-4 shrink-0" aria-hidden="true" />
      <span>No Internet Connection</span>
    </div>
  )
}
