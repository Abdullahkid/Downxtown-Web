'use client'

/**
 * AppBar — sticky top bar.
 * - Height: 56px on mobile, 64px on desktop (md+)
 * - Left: logo ("Downxtown") links to /welcome, or back button when showBack=true
 * - Center: inline search bar shown on the feed page (pathname === "/")
 * - Right: optional notification bell
 * Requirements: 1.1, 1.3, 23.4, 23.8, 24.1, 24.2
 */

import React, { useState, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { ChevronLeft, Search, Bell, X, User } from 'lucide-react'

export interface AppBarProps {
  /** Page title shown in the center when a back button is present */
  title?: string
  /** Show a back button instead of the logo */
  showBack?: boolean
  /** Show the notification bell on the right */
  showNotification?: boolean
}

export function AppBar({
  title,
  showBack = false,
  showNotification = false,
}: AppBarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [query, setQuery] = useState('')

  // Show the inline search bar only on the feed page
  const showSearchBar = pathname === '/'

  const handleSearchSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      const trimmed = query.trim()
      if (!trimmed) return
      router.push(`/search?q=${encodeURIComponent(trimmed)}`)
    },
    [query, router],
  )

  return (
    <header
      className={[
        'fixed left-0 right-0 top-0 z-50',
        'flex items-center justify-between gap-3',
        'h-14 md:h-16',
        'border-b border-border bg-bg-2 px-3 md:px-4',
      ].join(' ')}
    >
      {/* ── Left side ── */}
      <div className="flex items-center gap-2 flex-shrink-0">
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
            className="flex items-center self-center group"
            aria-label="Downxtown home"
          >
            <Image
              src="/logo-black.png"
              alt="Downxtown"
              width={290}
              height={80}
              className="object-contain flex-shrink-0 block"
              priority
            />
          </Link>
        )}

        {/* Optional page title next to back button */}
        {showBack && title && (
          <h1 className="text-base font-semibold text-text-1 line-clamp-1">
            {title}
          </h1>
        )}
      </div>

      {/* ── Centre: inline search bar — capped width, not flex-1 ── */}
      {showSearchBar && (
        <form
          onSubmit={handleSearchSubmit}
          role="search"
          aria-label="Search stores and products"
          className="flex items-center flex-1 max-w-[600px]"
        >
          <div className="relative w-full">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-text-3 pointer-events-none"
              aria-hidden="true"
            />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search stores & products…"
              aria-label="Search stores and products"
              className={[
                'w-full h-9 pl-9 pr-8 rounded-full',
                'bg-bg-3 border border-border',
                'text-sm text-text-1 placeholder-text-3',
                'focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand/40',
                'transition-colors',
              ].join(' ')}
            />
            {query && (
              <button
                type="button"
                aria-label="Clear search"
                onClick={() => setQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-3 hover:text-text-1"
              >
                <X size={14} aria-hidden="true" />
              </button>
            )}
          </div>
        </form>
      )}

      {/* ── Right side: profile + optional bell ── */}
      <div className="flex items-center gap-1 flex-shrink-0">
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

        {/* Profile — always visible, right of search bar */}
        <Link
          href="/profile"
          aria-label="Your profile"
          className={[
            'flex items-center justify-center rounded-[10px]',
            'h-10 w-10 border border-border bg-bg-3',
            pathname === '/profile'
              ? 'text-brand-accent border-brand-accent/30 bg-brand-accent/5'
              : 'text-text-2 hover:bg-surface hover:text-text-1',
            'transition-colors',
          ].join(' ')}
        >
          <User size={20} aria-hidden="true" strokeWidth={pathname === '/profile' ? 2.5 : 1.75} />
        </Link>
      </div>
    </header>
  )
}
