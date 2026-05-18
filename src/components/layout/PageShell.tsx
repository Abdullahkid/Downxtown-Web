'use client'

/**
 * PageShell — wraps every page with:
 *   - Skip-navigation link (WCAG 2.4.1)
 *   - <main id="main-content"> with max-width 1440px and responsive padding
 *   - Bottom padding so content isn't hidden behind the BottomNav on mobile
 * Requirements: 1.1, 1.5, 23.4, 23.8, 24.1, 24.2, 24.3, 24.4
 */

import { type ReactNode } from 'react'

export interface PageShellProps {
  children: ReactNode
  className?: string
}

export function PageShell({ children, className = '' }: PageShellProps) {
  return (
    <>
      {/* Skip-navigation link — visible only on keyboard focus */}
      <a
        href="#main-content"
        className={[
          'sr-only focus:not-sr-only',
          'focus:fixed focus:left-4 focus:top-4 focus:z-[100]',
          'focus:rounded-md focus:bg-bg-2 focus:px-4 focus:py-2',
          'focus:text-sm focus:font-medium focus:text-text-1',
          'focus:shadow-lg focus:ring-2 focus:ring-[var(--brand-color,#6366f1)]',
          'focus:outline-none',
        ].join(' ')}
      >
        Skip to main content
      </a>

      <main
        id="main-content"
        tabIndex={-1}
        className={[
          // Max width + centering
          'mx-auto w-full max-w-[1440px]',
          // Responsive horizontal padding
          'px-2 md:px-4 lg:px-6 xl:px-8',
          // Top offset for sticky AppBar (56px mobile / 64px desktop)
          'pt-14 md:pt-16',
          // Bottom offset so content isn't hidden behind BottomNav on mobile
          'pb-20 lg:pb-6',
          className,
        ].join(' ')}
      >
        {children}
      </main>
    </>
  )
}
