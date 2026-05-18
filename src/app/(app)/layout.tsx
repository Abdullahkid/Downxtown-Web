/**
 * AppLayout — shell for auth-required routes only:
 *   /orders, /profile, /checkout, /chat, /nearby
 *
 * The feed (/) and search (/search) have moved to the (public) route group
 * and are accessible without login.
 *
 * Renders the persistent navigation chrome (AppBar, SideRail, BottomNav),
 * wraps page content in PageShell for correct insets, and mounts the
 * ToastContainer so notifications are visible on every page.
 *
 * Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.7, 3.1, 10.11, 10.12
 */

import type { Metadata } from 'next'
import { AppBar, BottomNav, SideRail, PageShell } from '@/components/layout'
import { ToastContainer } from '@/components/shared'

// All pages under (app) are auth-gated and use browser APIs (IndexedDB via idb,
// WebSocket, Firebase). Never statically prerender them — always SSR on-demand.
export const dynamic = 'force-dynamic'

/**
 * Auth-gated pages (orders, profile, checkout, chat) have no SEO value
 * and should not be indexed.
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
  return (
    <div className="min-h-screen bg-background text-text-1">
      {/* Top app bar — fixed, z-50, full width */}
      <AppBar />

      {/* Side rail — fixed left sidebar, hidden on mobile (lg:flex) */}
      <SideRail />

      {/* Main content area — offset left to clear SideRail on desktop */}
      {/* lg:pl-16 = 64px (icon-only rail), xl:pl-56 = 224px (rail with labels) */}
      <div className="lg:pl-16 xl:pl-56">
        <PageShell>{children}</PageShell>
      </div>

      {/* Bottom nav — fixed, mobile only (lg:hidden) */}
      <BottomNav />

      {/* Toast notifications — fixed, rendered above all content */}
      <ToastContainer />
    </div>
  )
}
