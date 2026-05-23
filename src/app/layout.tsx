/**
 * Root layout — Server Component.
 *
 * Responsibilities:
 *  - Global SEO: title template, default OG metadata, Organization + WebSite JSON-LD
 *  - PWA meta tags (manifest, theme-color, apple-mobile-web-app-capable, viewport)
 *  - Wraps the entire app in:
 *      ErrorBoundary → QueryProvider → AuthProvider → {children}
 *
 * Requirements: 1.1, 24.7, 24.8, 26.4, 27.7
 */

import type { Metadata, Viewport } from 'next'
import Script from 'next/script'
import { DM_Sans, Bebas_Neue, DM_Serif_Display, Archivo } from 'next/font/google'
import { QueryProvider } from '@/components/providers/QueryProvider'
import { AuthProvider } from '@/components/providers/AuthProvider'
import { ErrorBoundary } from '@/components/providers/ErrorBoundary'
import { OfflineBanner } from '@/components/shared/OfflineBanner'
import './globals.css'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const SITE_URL = 'https://downxtown.com'

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
// SEO metadata
// ---------------------------------------------------------------------------

/**
 * Root metadata is the fallback for every page in the app.
 *
 * Title template:
 *   - Pages that export their own title (e.g. "Rockstar Stitch T-Shirt") get:
 *     "Rockstar Stitch T-Shirt — Downxtown"
 *   - Pages that don't export a title fall back to the `default` string.
 *
 * OpenGraph / Twitter:
 *   - Shared across every page as a baseline.
 *   - Individual pages (product, store) override these via generateMetadata.
 *
 * OG image: /public/app-feed.png — the app feed screenshot is the best
 * representation of the platform for social link previews.
 * Recommended dimensions: 1200×630px. Replace this file with a properly
 * designed 1200×630 graphic when one is available.
 */
export const metadata: Metadata = {
  // Title template — child pages set their own title and get "… — Downxtown" appended.
  // The default is shown when no child page sets a title (e.g. /auth/* routes).
  title: {
    default: 'Downxtown — Discover & Follow Indian D2C Brands',
    template: '%s — Downxtown',
  },
  description:
    'Shop from India\'s best D2C brands. Follow brands, get their latest drops in your feed, and discover local stores near you — only on Downxtown.',

  // Canonical base URL — Next.js appends the page path automatically
  metadataBase: new URL(SITE_URL),

  // Tells Google this site targets Indian users
  // Open Graph — baseline for all pages
  openGraph: {
    type: 'website',
    siteName: 'Downxtown',
    url: SITE_URL,
    title: 'Downxtown — Discover & Follow Indian D2C Brands',
    description:
      'Shop from India\'s best D2C brands. Follow brands, get their latest drops in your feed, and discover local stores near you.',
    images: [
      {
        // /public/app-feed.png — replace with a 1200×630 branded OG image
        url: '/app-feed.png',
        width: 1200,
        height: 630,
        alt: 'Downxtown — Brand feed showing D2C stores and products',
      },
    ],
    locale: 'en_IN',
  },

  // Twitter / X Card — shown when sharing any Downxtown link on X or other platforms
  // that read twitter: meta tags (WhatsApp, Telegram, Slack all do).
  // twitter:site is omitted — no X account exists yet. Add it when one is created.
  twitter: {
    card: 'summary_large_image',
    title: 'Downxtown — Discover & Follow Indian D2C Brands',
    description:
      'Shop from India\'s best D2C brands. Follow brands, get their latest drops in your feed.',
    images: ['/app-feed.png'],
  },

  // PWA
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/icons/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/icons/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icons/icon-192.png',      sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512.png',      sizes: '512x512', type: 'image/png' },
    ],
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
// Structured data — Organization + WebSite (site-wide, rendered once)
// ---------------------------------------------------------------------------

/**
 * Two Schema.org entities declared at the root level:
 *
 * 1. Organization — declares Downxtown as a named entity. This is what
 *    eventually gets Google to show a Knowledge Panel for the platform itself,
 *    and links all store entities back to it via the platform's @id.
 *
 * 2. WebSite + SearchAction — enables Google's Sitelinks Searchbox feature.
 *    When Google shows downxtown.com in search results, users can type a search
 *    query directly in the SERP and land on /search?q={query}.
 *
 * Both use @graph so they share a single <script> tag.
 */
const organizationJsonLd = JSON.stringify({
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': `${SITE_URL}/#organization`,
      name: 'Downxtown',
      url: SITE_URL,
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_URL}/icons/icon-512.png`,
        width: 512,
        height: 512,
      },
      description:
        'Brand commerce platform connecting Indian D2C brands with customers. Discover, follow, and shop from local brands.',
      foundingLocation: {
        '@type': 'Place',
        name: 'Lucknow, Uttar Pradesh, India',
      },
      areaServed: 'IN',
      // sameAs links this entity to Downxtown's known social profiles.
      // Add more entries (LinkedIn, Twitter/X, YouTube) when accounts exist.
      sameAs: [
        'https://www.instagram.com/downxtown_007',
      ],
    },
    {
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      url: SITE_URL,
      name: 'Downxtown',
      publisher: { '@id': `${SITE_URL}/#organization` },
      // SearchAction enables Google's Sitelinks Searchbox in SERPs.
      // Users can search downxtown.com directly from the search result.
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: `${SITE_URL}/search?q={search_term_string}`,
        },
        'query-input': 'required name=search_term_string',
      },
    },
  ],
})

// ---------------------------------------------------------------------------
// Root layout
// ---------------------------------------------------------------------------

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    // lang="en-IN" — signals to Google that this is English content targeting
    // Indian users, improving geo-relevance for Tier 2/3 city queries.
    <html lang="en-IN" className={`${dmSans.variable} ${bebasNeue.variable} ${dmSerifDisplay.variable} ${archivo.variable}`}>
      <body suppressHydrationWarning>
        {/* Google Analytics 4 — loads after page is interactive (afterInteractive)
            so it never blocks rendering or Core Web Vitals scores. */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-BWTTKBF253"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-BWTTKBF253');
          `}
        </Script>
        {/*
         * Organization + WebSite JSON-LD — injected once at the root level.
         * Uses next/script with strategy="beforeInteractive" so it's present
         * in the initial HTML that Googlebot receives, not deferred.
         */}
        <Script
          id="org-jsonld"
          type="application/ld+json"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: organizationJsonLd }}
        />

        <ErrorBoundary>
          <QueryProvider>
            <AuthProvider>
              {children}
              <OfflineBanner />
            </AuthProvider>
          </QueryProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
}
