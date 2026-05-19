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
import { DM_Sans, Bebas_Neue, DM_Serif_Display, Archivo } from 'next/font/google'
import { QueryProvider } from '@/components/providers/QueryProvider'
import { AuthProvider } from '@/components/providers/AuthProvider'
import { ErrorBoundary } from '@/components/providers/ErrorBoundary'
import { OfflineBanner } from '@/components/shared/OfflineBanner'
import './globals.css'

// ---------------------------------------------------------------------------
// Fonts
// ---------------------------------------------------------------------------

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-dm-sans',
  display: 'swap',
})

const bebasNeue = Bebas_Neue({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-bebas-neue',
  display: 'swap',
})

const dmSerifDisplay = DM_Serif_Display({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-dm-serif',
  display: 'swap',
})

// Archivo — used by the landing page (Downxtown-Website brand font)
const archivo = Archivo({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-archivo',
  display: 'swap',
})

// ---------------------------------------------------------------------------
// PWA + SEO metadata
// ---------------------------------------------------------------------------

export const metadata: Metadata = {
  title: 'Downxtown',
  description: 'Discover local stores and products near you',
  // Links <link rel="manifest" href="/manifest.json"> in the <head>
  manifest: '/manifest.json',
  icons: {
    // favicon.ico in src/app/ is auto-served by Next.js at /favicon.ico
    // Google picks up the 32x32 PNG as the search result favicon
    icon: [
      { url: '/icons/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/icons/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icons/icon-192.png',      sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512.png',      sizes: '512x512', type: 'image/png' },
    ],
    // Apple home screen icon
    apple: [
      { url: '/icons/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    shortcut: '/icons/favicon-32x32.png',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Downxtown',
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
    <html lang="en" className={`${dmSans.variable} ${bebasNeue.variable} ${dmSerifDisplay.variable} ${archivo.variable}`}>
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
