/**
 * Store Profile page — Next.js Server Component (SSR).
 *
 * Fetches store data server-side for SEO, generates metadata with Open Graph
 * tags, canonical link, robots meta, and injects Schema.org LocalBusiness
 * JSON-LD structured data.
 *
 * Requirements: 9.1–9.13, 21.1, 21.5–21.7, 25.2
 */

import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Script from 'next/script'
import { buildStoreMetadata } from '@/lib/utils/metadata'
import type { StoreProfile } from '@/types/store'
import {
  StoreHeader,
  StoreProductGrid,
  StoreCategories,
  StoreReviews,
  StoreTabs,
} from '@/components/store'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface PageProps {
  params: Promise<{ storeUsername: string }>
}

// ---------------------------------------------------------------------------
// Data fetching
// ---------------------------------------------------------------------------

const API_BASE = 'https://api.downxtown.com'

async function fetchStoreProfile(
  storeUsername: string,
): Promise<StoreProfile | null> {
  try {
    const res = await fetch(`${API_BASE}/stores/by-username/${storeUsername}/profile`, {
      next: { revalidate: 60 },
    })

    if (res.status === 404) return null
    if (!res.ok) {
      // Don't call notFound for server errors — show error state instead
      console.error(`Store fetch failed: ${res.status} for username: ${storeUsername}`)
      return null
    }

    // Backend returns { success, storeProfile: StoreProfileData }
    const body = await res.json() as {
      success: boolean
      storeProfile?: {
        id: string
        storeName: string
        storeUsername: string
        storeLogo?: string
        storeBanner?: string
        storeDescription?: string
        storeRating: number
        productsCount: number
        followersCount: number
        phoneNumber?: string
        whatsappNumber?: string
        isFollowing?: boolean
      }
    }

    if (!body.success || !body.storeProfile) return null
    const s = body.storeProfile

    // Map to the StoreProfile type used by StoreHeader/StoreTabs
    const profile: StoreProfile = {
      id: s.id,
      storeName: s.storeName,
      storeUsername: s.storeUsername,
      logoImageId: s.storeLogo ?? '',
      bannerImageId: s.storeBanner,
      description: s.storeDescription,
      averageRating: s.storeRating,
      totalReviews: 0,
      isFollowing: s.isFollowing ?? false,
      followerCount: s.followersCount,
      productCount: s.productsCount,
      phoneNumber: s.phoneNumber,
      whatsappNumber: s.whatsappNumber,
    }
    return profile
  } catch {
    return null
  }
}

// ---------------------------------------------------------------------------
// generateMetadata — SSR Open Graph + SEO tags (Req 9.13, 21.1, 21.5–21.7)
// ---------------------------------------------------------------------------

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { storeUsername } = await params
  const store = await fetchStoreProfile(storeUsername)

  if (!store) {
    return {
      title: 'Store not found — DownXtown',
      robots: { index: false, follow: false },
    }
  }

  return buildStoreMetadata({
    storeName: store.storeName,
    storeUsername: store.storeUsername,
    description: store.description,
    logoImageId: store.logoImageId,
    bannerImageId: store.bannerImageId,
    averageRating: store.averageRating,
    city: store.city,
  })
}

// ---------------------------------------------------------------------------
// Schema.org LocalBusiness JSON-LD
// ---------------------------------------------------------------------------

function buildJsonLd(store: StoreProfile): string {
  const siteUrl = 'https://downxtown.com'
  const apiBase = 'https://api.downxtown.com'

  const jsonLd: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: store.storeName,
    url: `${siteUrl}/store/${store.storeUsername}`,
    ...(store.logoImageId
      ? { logo: `${apiBase}/get-display-image/${store.logoImageId}` }
      : {}),
    ...(store.description ? { description: store.description } : {}),
    ...(store.city ? { address: { '@type': 'PostalAddress', addressLocality: store.city } } : {}),
    ...(store.phoneNumber ? { telephone: store.phoneNumber } : {}),
    ...(store.averageRating > 0
      ? {
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: store.averageRating.toFixed(1),
            reviewCount: store.totalReviews,
            bestRating: '5',
            worstRating: '1',
          },
        }
      : {}),
  }

  return JSON.stringify(jsonLd)
}

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------

export default async function StorePage({ params }: PageProps) {
  const { storeUsername } = await params
  const store = await fetchStoreProfile(storeUsername)

  if (!store) {
    notFound()
  }

  return (
    <>
      {/* Schema.org LocalBusiness structured data (Req 21.7) */}
      <Script
        id="store-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: buildJsonLd(store) }}
      />

      <main className="min-h-screen bg-white">
        {/*
         * StoreHeader — collapsing banner + logo + name + @username + rating
         * + Follow/Unfollow + Message + Share + Contact buttons.
         * Logs store_click analytics event on mount (Req 25.2).
         */}
        <StoreHeader store={store} />

        {/*
         * Tab content — Products / Categories / Reviews.
         * StoreTabs is a client component that manages the active tab state
         * and renders the appropriate content panel.
         */}
        <StoreTabs
          storeId={store.id}
          storeUsername={store.storeUsername}
        />
      </main>
    </>
  )
}
