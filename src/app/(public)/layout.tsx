/**
 * Public layout â€” shell for all publicly accessible routes:
 *   / (feed), /search, /store/[username], /product/[id]
 *
 * These pages are visible to everyone â€” logged in or not.
 * Renders the same navigation chrome as the app layout so the experience
 * is seamless whether the user is authenticated or not.
 *
 * Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.7, 3.1
 */

import Link from 'next/link'
import { AppBar, BottomNav, SideRail, PageShell } from '@/components/layout'
import { ToastContainer } from '@/components/shared'

// Public pages use Firebase auth state, IndexedDB (offline queue), and
// real-time API data — none of which are available during static prerendering.
export const dynamic = 'force-dynamic'

/**
 * Slim site-wide footer â€” visible on all public pages.
 * Links to the marketing landing page and legal pages so users can always
 * navigate to /welcome, /privacy, /terms, /cookies from anywhere in the app.
 */
function SiteFooter() {
  return (
    <footer className="border-t border-border bg-bg-2">
      <div className="max-w-7xl mx-auto px-4 py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-text-3">
          <Link
            href="/welcome"
            className="hover:text-brand-accent transition-colors font-medium text-text-2"
          >
            About Downxtown
          </Link>
          <Link href="/privacy" className="hover:text-brand-accent transition-colors">
            Privacy
          </Link>
          <Link href="/terms" className="hover:text-brand-accent transition-colors">
            Terms
          </Link>
          <Link href="/cookies" className="hover:text-brand-accent transition-colors">
            Cookies
          </Link>
          <a
            href="mailto:hello@downxtown.com"
            className="hover:text-brand-accent transition-colors"
          >
            Contact
          </a>
        </div>
        <p className="text-xs text-text-3 shrink-0">
          © {new Date().getFullYear()} Downxtown
        </p>
      </div>
    </footer>
  )
}

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background text-text-1">
      {/* Top app bar â€” fixed, z-50, full width */}
      <AppBar />

      {/* Side rail â€” fixed left sidebar, hidden on mobile (lg:flex) */}
      <SideRail />

      {/* Main content area â€” offset left to clear SideRail on desktop */}
      <div className="lg:pl-16 xl:pl-56">
        <PageShell>{children}</PageShell>
        {/* Site footer â€” sits above the BottomNav padding on mobile */}
        <SiteFooter />
      </div>

      {/* Bottom nav â€” fixed, mobile only (lg:hidden) */}
      <BottomNav />

      {/* Toast notifications */}
      <ToastContainer />
    </div>
  )
}

