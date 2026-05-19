'use client'

/**
 * AppInstallBanner — mobile-only sticky banner prompting users to install
 * the Downxtown Android app. Shown below the AppBar on small screens (< lg).
 *
 * Behaviour:
 *  - Only rendered on mobile (lg:hidden via parent, no JS UA sniffing needed)
 *  - Dismissed state persisted in localStorage so it doesn't reappear after close
 *  - Clicking the banner / "Get App" opens the Play Store in a new tab
 */

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { X } from 'lucide-react'

const STORAGE_KEY = 'dxt_app_banner_dismissed'
const PLAY_STORE_URL =
  'https://play.google.com/store/apps/details?id=com.downxtown.sigma2one'

export function AppInstallBanner() {
  const [visible, setVisible] = useState(false)

  // Delay check to after hydration to avoid SSR mismatch
  useEffect(() => {
    try {
      const dismissed = localStorage.getItem(STORAGE_KEY)
      if (!dismissed) setVisible(true)
    } catch {
      // localStorage unavailable (private mode etc.) — just show the banner
      setVisible(true)
    }
  }, [])

  const dismiss = (e: React.MouseEvent) => {
    e.stopPropagation()
    setVisible(false)
    try {
      localStorage.setItem(STORAGE_KEY, '1')
    } catch {
      // ignore
    }
  }

  if (!visible) return null

  return (
    <a
      href={PLAY_STORE_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Download Downxtown on Google Play"
      className={[
        // Mobile only — hidden on desktop where the full web app is preferred
        'lg:hidden',
        'flex items-center gap-3 px-3 py-2.5',
        'bg-bg-2 border-b border-border',
        // Sits right below the fixed AppBar
        'fixed left-0 right-0 z-40',
        'top-14 md:top-16',
        'cursor-pointer hover:bg-bg-3 transition-colors',
      ].join(' ')}
    >
      {/* App icon */}
      <Image
        src="/icons/icon-192.png"
        alt=""
        width={36}
        height={36}
        className="rounded-lg flex-shrink-0"
        aria-hidden="true"
      />

      {/* Text */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-text-1 leading-tight truncate">
          Install Downxtown App
        </p>
        <p className="text-xs text-text-3 leading-tight">
          Shop local stores — free on Google Play
        </p>
      </div>

      {/* CTA pill */}
      <span
        className={[
          'flex-shrink-0 rounded-full px-3 py-1',
          'bg-brand-accent text-white text-xs font-semibold',
          'pointer-events-none',
        ].join(' ')}
        aria-hidden="true"
      >
        Get App
      </span>

      {/* Dismiss button */}
      <button
        type="button"
        onClick={dismiss}
        aria-label="Dismiss app install banner"
        className={[
          'flex-shrink-0 flex items-center justify-center',
          'h-7 w-7 rounded-full text-text-3',
          'hover:bg-bg-3 hover:text-text-1 transition-colors',
        ].join(' ')}
      >
        <X size={14} aria-hidden="true" />
      </button>
    </a>
  )
}
