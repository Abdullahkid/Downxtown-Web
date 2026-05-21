/**
 * Home Page — Next.js Server Component (route entry point).
 *
 * Owns generateMetadata so the homepage gets proper OG tags, Twitter card,
 * and canonical URL distinct from the root layout defaults.
 * All interactive feed logic lives in FeedPageClient ('use client').
 *
 * Why homepage metadata matters:
 *  - When someone shares https://downxtown.com on WhatsApp/Instagram, the
 *    link preview uses these OG tags — the root layout defaults are a fallback,
 *    not a targeted homepage description.
 *  - Google's SERP snippet for the homepage uses <title> and <description>
 *    from this metadata, not the generic layout title.
 *
 * Requirements: 7.1–7.16, 21.1, 21.5, 21.6
 */

import type { Metadata } from 'next'
import { FeedPageClient } from './FeedPageClient'

const SITE_URL = 'https://downxtown.com'

// ---------------------------------------------------------------------------
// Metadata — homepage specific
// ---------------------------------------------------------------------------

export const metadata: Metadata = {
  // With the title template in root layout, this renders as:
  // "Downxtown — Discover & Follow Indian D2C Brands"
  // The template is overridden here because we want the brand name first
  // on the homepage (it IS the homepage, not a sub-page).
  title: {
    absolute: 'Downxtown — Discover & Follow Indian D2C Brands',
  },
  description:
    'Shop from India\'s best D2C brands. Follow fashion, footwear, cosmetics, electronics and accessories brands. Get their latest drops in your feed — only on Downxtown.',
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    type: 'website',
    url: SITE_URL,
    siteName: 'Downxtown',
    title: 'Downxtown — Discover & Follow Indian D2C Brands',
    description:
      'Follow Indian D2C brands and shop their latest drops. Fashion, footwear, cosmetics, electronics and accessories — all in one feed.',
    images: [
      {
        url: '/app-feed.png',
        width: 1200,
        height: 630,
        alt: 'Downxtown — Brand feed showing D2C stores and products from India',
      },
    ],
    locale: 'en_IN',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Downxtown — Discover & Follow Indian D2C Brands',
    description:
      'Follow Indian D2C brands and shop their latest drops in your feed.',
    images: ['/app-feed.png'],
  },
}

// ---------------------------------------------------------------------------
// Page — delegates all rendering to the client component
// ---------------------------------------------------------------------------

export default function HomePage() {
  return <FeedPageClient />
}
