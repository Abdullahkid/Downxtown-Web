'use client'

/**
 * AppBar — sticky top bar.
 * - Height: 56px on mobile, 64px on desktop (md+)
 * - Left: logo ("Downxtown") links to /welcome, or back button when showBack=true
 * - Right: optional search icon and notification bell
 * Requirements: 1.1, 1.3, 23.4, 23.8, 24.1, 24.2
 */

import Image from 'next/image'
import Link from 'next/link'
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
        'border-b border-border bg-bg-2 px-4',
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
              'flex items-center justify-center rounded-[10px]',
              'h-10 w-10 text-text-2 border border-border bg-bg-3',
              'hover:bg-surface hover:text-text-1 active:bg-surface-2',
              'transition-colors',
            ].join(' ')}
          >
            <ChevronLeft size={24} aria-hidden="true" />
          </button>
        ) : (
          <Link
            href="/welcome"
            className="flex items-center gap-2 group"
            aria-label="Downxtown home"
          >
            <Image
              src="/logo-light.svg"
              alt="Downxtown logo"
              width={70}
              height={70}
              className="object-contain flex-shrink-0"
              priority
            />
            <span className="font-archivo font-bold text-[22px] tracking-tight text-text-1 transition-colors group-hover:text-brand">
              Downxtown
            </span>
          </Link>
        )}

        {/* Optional page title (shown next to back button) */}
        {showBack && title && (
          <h1 className="text-base font-semibold text-text-1 line-clamp-1">
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
                'flex items-center justify-center rounded-[10px]',
                'h-10 w-10 text-text-2 border border-border bg-bg-3',
                'hover:bg-surface hover:text-text-1 active:bg-surface-2',
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
                'flex items-center justify-center rounded-[10px]',
                'h-10 w-10 text-text-2 border border-border bg-bg-3',
                'hover:bg-surface hover:text-text-1 active:bg-surface-2',
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
