/**
 * Root layout — Server Component.
 *
 * Responsibilities:
 *  - PWA meta tags (manifest, theme-color, apple-mobile-web-app-capable, viewport)
 *  - Wraps the entire app in:
 *      ErrorBoundary → QueryProvider → AuthProvider → {children}
 *
 * Requirements: 1.1, 24.7, 24.8, 26.4, 27.7
 */

import type { Metadata, Viewport } from 'next'
import { QueryProvider } from '@/components/providers/QueryProvider'
import { AuthProvider } from '@/components/providers/AuthProvider'
import { ErrorBoundary } from '@/components/providers/ErrorBoundary'
import { OfflineBanner } from '@/components/shared/OfflineBanner'
import './globals.css'

// ---------------------------------------------------------------------------
// PWA + SEO metadata
// ---------------------------------------------------------------------------

export const metadata: Metadata = {
  title: 'DownXtown',
  description: 'Discover local stores and products near you',
  // Links <link rel="manifest" href="/manifest.json"> in the <head>
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'DownXtown',
  },
}

export const viewport: Viewport = {
  themeColor: '#000000',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

// ---------------------------------------------------------------------------
// Root layout
// ---------------------------------------------------------------------------

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>
        {/*
         * ErrorBoundary is outermost so it catches errors from any provider
         * or page component. It is a client component (class-based) but can
         * be rendered inside a Server Component — Next.js handles the
         * client/server boundary automatically.
         */}
        <ErrorBoundary>
          <QueryProvider>
            <AuthProvider>
              {children}
              {/*
               * OfflineBanner is rendered inside AuthProvider so it has
               * access to the same client boundary, but outside {children}
               * so it overlays every page without being re-mounted on
               * navigation. It is a fixed-position element and does not
               * affect document flow.
               */}
              <OfflineBanner />
            </AuthProvider>
          </QueryProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
}
