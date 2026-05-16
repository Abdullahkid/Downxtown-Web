/**
 * App shell layout — wraps all auth-gated routes:
 *   /chat, /orders, /profile, /checkout, /search, /nearby, /
 *
 * Marks every route in this group as noindex so search engines do not
 * index private, personalised, or auth-gated pages (Req 21.3).
 *
 * Navigation components (BottomNav, SideRail, AppBar) will be added in
 * Task 6.2 once those components are implemented.
 */

import type { Metadata } from 'next'

/**
 * Instruct search engines not to index any page in the (app) route group.
 * These are either auth-gated (orders, chat, profile, checkout) or
 * personalised (feed, search, nearby) and have no SEO value.
 *
 * Requirements: 21.3
 */
export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
}

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
