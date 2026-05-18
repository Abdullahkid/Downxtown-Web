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
        websiteUrl?: string
        socialLinks?: {
          instagram?: string
          facebook?: string
          twitter?: string
          youtube?: string
        }
        city?: string
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
      websiteUrl: s.websiteUrl,
      instagramUrl: s.socialLinks?.instagram,
      facebookUrl: s.socialLinks?.facebook,
      city: s.city,
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
      title: 'Store not found — Downxtown',
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
// Schema.org JSON-LD — two graphs: ProfilePage + LocalBusiness
// ---------------------------------------------------------------------------

/**
 * Builds a JSON-LD script with two linked Schema.org entities:
 *
 * 1. ProfilePage — tells Google this URL is a profile page for a named entity.
 *    This is the same schema Instagram, LinkedIn, and Twitter use, and is what
 *    triggers the "profile card" appearance in Google Search results.
 *
 * 2. LocalBusiness — describes the store as a real-world business entity with
 *    name, address, phone, rating, and logo. Google uses this for Knowledge
 *    Panel and local search features.
 *
 * The two entities are linked via mainEntity / mainEntityOfPage so Google
 * understands they describe the same thing.
 */
function buildJsonLd(store: StoreProfile): string {
  const siteUrl = 'https://downxtown.com'
  const apiBase = 'https://api.downxtown.com'
  const storeUrl = `${siteUrl}/store/${store.storeUsername}`
  const logoUrl = store.logoImageId
    ? `${apiBase}/get-display-image/${store.logoImageId}`
    : undefined

  // Build sameAs array — links this entity to other known identifiers.
  // Google uses sameAs to connect the entity across the web.
  // Including Instagram is critical: when Google sees the same brand name
  // on both Instagram and Downxtown linked via sameAs, it treats them as
  // the same entity — which is how Downxtown store pages surface alongside
  // the brand's Instagram in search results.
  const sameAs: string[] = []
  if (store.instagramUrl) sameAs.push(store.instagramUrl)
  if (store.facebookUrl) sameAs.push(store.facebookUrl)
  if (store.websiteUrl) sameAs.push(store.websiteUrl)
  if (store.whatsappNumber) {
    sameAs.push(`https://wa.me/${store.whatsappNumber.replace(/\D/g, '')}`)
  }

  // LocalBusiness entity — the store itself
  const localBusiness: Record<string, unknown> = {
    '@type': 'LocalBusiness',
    '@id': `${storeUrl}#business`,
    name: store.storeName,
    url: storeUrl,
    ...(logoUrl ? { logo: logoUrl, image: logoUrl } : {}),
    ...(store.description ? { description: store.description } : {}),
    ...(store.city
      ? { address: { '@type': 'PostalAddress', addressLocality: store.city } }
      : {}),
    ...(store.phoneNumber ? { telephone: store.phoneNumber } : {}),
    ...(sameAs.length > 0 ? { sameAs } : {}),
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

  // ProfilePage entity — the web page that represents the store's profile.
  // This is the key schema that triggers the Instagram-style card in Google.
  const profilePage: Record<string, unknown> = {
    '@type': 'ProfilePage',
    '@id': `${storeUrl}#profile`,
    url: storeUrl,
    name: `${store.storeName} (@${store.storeUsername})`,
    // mainEntity links the ProfilePage to the LocalBusiness it describes
    mainEntity: { '@id': `${storeUrl}#business` },
    ...(logoUrl
      ? {
          image: {
            '@type': 'ImageObject',
            url: logoUrl,
            description: `${store.storeName} logo`,
          },
        }
      : {}),
  }

  return JSON.stringify({
    '@context': 'https://schema.org',
    '@graph': [profilePage, localBusiness],
  })
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
