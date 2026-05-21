/**
 * Search Page — Next.js Server Component (route entry point).
 *
 * Owns generateMetadata so we can set robots/canonical per-request.
 * All interactive logic lives in SearchPageClient (a 'use client' component).
 *
 * SEO strategy:
 *  - Base /search (no query) → indexable. Browse mode is useful content.
 *  - /search?q=anything → noindex + canonical pointing to /search.
 *    Prevents thousands of thin duplicate pages (one per search query)
 *    from wasting Google's crawl budget. The canonical tells Google that
 *    /search is the authoritative URL regardless of query params.
 *
 * Requirements: 8.1–8.14, 21.3, 21.5
 */

import type { Metadata } from 'next'
import { SearchPageWrapper } from './SearchPageWrapper'

// ---------------------------------------------------------------------------
// Metadata — dynamic based on whether a query param is present
// ---------------------------------------------------------------------------

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}): Promise<Metadata> {
  const { q } = await searchParams
  const hasQuery = typeof q === 'string' && q.trim().length > 0

  if (hasQuery) {
    return {
      // noindex on parameterised search URLs — prevents duplicate content.
      // These pages have no unique value to index: the same products appear
      // across many different query strings.
      robots: {
        index: false,
        follow: true,
      },
      // Canonical always points to the base /search page so any link equity
      // accumulated by query-param URLs consolidates to one URL.
      alternates: {
        canonical: 'https://downxtown.com/search',
      },
      // Still set a useful title in case the page is shared or bookmarked
      title: `"${q.trim()}" — Search`,
    }
  }

  // Base /search page — fully indexable, describes the browse experience
  return {
    title: 'Search Brands & Products',
    description:
      'Search and discover D2C brands, fashion, footwear, cosmetics, electronics and accessories on Downxtown. Find products from local Indian brands near you.',
    robots: {
      index: true,
      follow: true,
    },
    alternates: {
      canonical: 'https://downxtown.com/search',
    },
    openGraph: {
      type: 'website',
      url: 'https://downxtown.com/search',
      title: 'Search Brands & Products — Downxtown',
      description: 'Discover D2C brands and products on Downxtown.',
    },
  }
}

// ---------------------------------------------------------------------------
// Page — delegates all rendering to the client component
// ---------------------------------------------------------------------------

export default function SearchPage() {
  return <SearchPageWrapper />
}
