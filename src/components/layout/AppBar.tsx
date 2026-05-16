'use client'

/**
 * AppBar — sticky top bar.
 * - Height: 56px on mobile, 64px on desktop (md+)
 * - Left: logo ("DownXtown") or back button when showBack=true
 * - Right: optional search icon and notification bell
 * Requirements: 1.1, 1.3, 23.4, 23.8, 24.1, 24.2
 */

import { useRouter } from 'next/navigation'
import { ChevronLeft, Search, Bell } from 'lucide-react'

export interface AppBarProps {
  /** Page title shown in the center when a back button is present */
  title?: string
  /** Show a back button instead of the logo */
  showBack?: boolean
  /** Show the search icon on the right */
  showSearch?: boolean
  /** Show the notification bell on the right */
  showNotification?: boolean
}

export function AppBar({
  title,
  showBack = false,
  showSearch = false,
  showNotification = false,
}: AppBarProps) {
  const router = useRouter()

  return (
    <header
      className={[
        'fixed left-0 right-0 top-0 z-50',
        'flex items-center justify-between',
        'h-14 md:h-16',          // 56px / 64px
        'border-b border-gray-200 bg-white px-4',
      ].join(' ')}
    >
      {/* ── Left side ── */}
      <div className="flex items-center gap-2">
        {showBack ? (
          <button
            type="button"
            onClick={() => router.back()}
            aria-label="Go back"
            className={[
              'flex items-center justify-center rounded-full',
              'h-10 w-10 text-gray-700',
              'hover:bg-gray-100 active:bg-gray-200',
              'transition-colors',
            ].join(' ')}
          >
            <ChevronLeft size={24} aria-hidden="true" />
          </button>
        ) : (
          <span
            className="text-xl font-bold tracking-tight text-[var(--brand-color,#6366f1)]"
            aria-label="DownXtown home"
          >
            DownXtown
          </span>
        )}

        {/* Optional page title (shown next to back button) */}
        {showBack && title && (
          <h1 className="text-base font-semibold text-gray-900 line-clamp-1">
            {title}
          </h1>
        )}
      </div>

      {/* ── Right side ── */}
      {(showSearch || showNotification) && (
        <div className="flex items-center gap-1">
          {showSearch && (
            <button
              type="button"
              aria-label="Open search"
              onClick={() => router.push('/search')}
              className={[
                'flex items-center justify-center rounded-full',
                'h-10 w-10 text-gray-700',
                'hover:bg-gray-100 active:bg-gray-200',
                'transition-colors',
              ].join(' ')}
            >
              <Search size={20} aria-hidden="true" />
            </button>
          )}

          {showNotification && (
            <button
              type="button"
              aria-label="Notifications"
              className={[
                'flex items-center justify-center rounded-full',
                'h-10 w-10 text-gray-700',
                'hover:bg-gray-100 active:bg-gray-200',
                'transition-colors',
              ].join(' ')}
            >
              <Bell size={20} aria-hidden="true" />
            </button>
          )}
        </div>
      )}
    </header>
  )
}
