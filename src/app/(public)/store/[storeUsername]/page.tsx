/**
 * Store Profile page — Next.js Server Component (SSR).
 *
 * Fetches store data AND page 1 of products server-side for SEO.
 * Googlebot sees the actual product names, prices, and links in HTML —
 * this is what makes "/store/bonkers-corner" rankable for "Bonkers Corner"
 * branded queries instead of only product pages ranking.
 *
 * Requirements: 9.1–9.13, 21.1, 21.5–21.7, 25.2
 */

import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Script from 'next/script'
import { buildStoreMetadata } from '@/lib/utils/metadata'
import { buildProductUrl, formatPrice } from '@/lib/utils/urlBuilders'
import type { StoreProfile } from '@/types/store'
import type { MiniProduct } from '@/types/product'
import { StoreProfileClient } from '@/components/store/StoreProfileClient'

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
        city?: string
        state?: string
        // Brand SEO fields (new — nullable, backward compatible)
        ownerName?: string
        searchKeywords?: string[]
        trademarkStatus?: string
        instagramUrl?: string
        facebookUrl?: string
        socialLinks?: {
          instagram?: string
          facebook?: string
          twitter?: string
          youtube?: string
        }
      }
    }

    if (!body.success || !body.storeProfile) return null
    const s = body.storeProfile

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
      instagramUrl: s.instagramUrl ?? s.socialLinks?.instagram,
      facebookUrl: s.facebookUrl ?? s.socialLinks?.facebook,
      city: s.city,
      state: s.state,
      // Brand SEO fields
      ownerName: s.ownerName,
      searchKeywords: s.searchKeywords,
      trademarkStatus: s.trademarkStatus,
    }
    return profile
  } catch {
    return null
  }
}

// ---------------------------------------------------------------------------
// Data fetching — products page 1 (for SSR content)
// ---------------------------------------------------------------------------

/**
 * Fetches the first page of products for the store.
 * This is the critical function that makes the store page rankable:
 * product names, prices, and links appear in the server-rendered HTML
 * that Googlebot reads — not just after client-side JS runs.
 */
async function fetchStoreProducts(
  storeId: string,
): Promise<{ products: MiniProduct[]; hasNextPage: boolean }> {
  try {
    const res = await fetch(
      `${API_BASE}/stores/${storeId}/products?page=1&limit=12&sortBy=RECENT`,
      { next: { revalidate: 60 } },
    )
    if (!res.ok) return { products: [], hasNextPage: false }

    const body = await res.json() as {
      success: boolean
      data?: {
        products: Array<{
          id: string
          name?: string
          title?: string
          mainImageUrl?: string
          sellingPrice: number
          mrp?: number
          averageRating?: number
          storeUsername?: string
          businessId?: string
          mainCategory?: string
          shopifyHandle?: string | null
        }>
        hasNextPage: boolean
      } | null
    }

    if (!body.success || !body.data) return { products: [], hasNextPage: false }

    const products: MiniProduct[] = body.data.products.map((p) => ({
      id: p.id,
      businessId: p.businessId ?? '',
      name: p.name ?? p.title ?? '',
      mainImageUrl: p.mainImageUrl ?? '',
      sellingPrice: p.sellingPrice,
      mrp: p.mrp ?? p.sellingPrice,
      averageRating: p.averageRating ?? 0,
      mainCategory: p.mainCategory ?? '',
      storeName: '',
      storeUsername: p.storeUsername ?? '',
    }))

    return { products, hasNextPage: body.data.hasNextPage }
  } catch {
    return { products: [], hasNextPage: false }
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

  // Build a keyword-rich description using searchKeywords if available
  // e.g. "Sassafras — Indian Women's Fashion Brand | Dresses, Co-ord Sets, Fusion Wear on Downxtown"
  const topKeywords = store.searchKeywords?.slice(0, 4).join(', ')
  const locationStr = store.city ? `Based in ${store.city}` : ''
  const keywordDescription = topKeywords
    ? `${store.storeName} on Downxtown — Shop ${topKeywords}${locationStr ? `. ${locationStr}` : ''}.`
    : undefined

  return buildStoreMetadata({
    storeName: store.storeName,
    storeUsername: store.storeUsername,
    description: keywordDescription ?? store.description,
    logoImageId: store.logoImageId,
    bannerImageId: store.bannerImageId,
    averageRating: store.averageRating,
    city: store.city,
    searchKeywords: store.searchKeywords,
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
function buildJsonLd(store: StoreProfile, products: MiniProduct[]): string {
  const siteUrl = 'https://downxtown.com'
  const apiBase = 'https://api.downxtown.com'
  const storeUrl = `${siteUrl}/store/${store.storeUsername}`
  const logoUrl = store.logoImageId
    ? `${apiBase}/get-display-image/${store.logoImageId}`
    : undefined

  const sameAs: string[] = []
  if (store.instagramUrl) sameAs.push(store.instagramUrl)
  if (store.facebookUrl) sameAs.push(store.facebookUrl)
  if (store.websiteUrl) sameAs.push(store.websiteUrl)
  if (store.whatsappNumber) {
    sameAs.push(`https://wa.me/${store.whatsappNumber.replace(/\D/g, '')}`)
  }

  // Extract founding year from storeDescription if present ("Launched in 2015...")
  const foundingYearMatch = store.description?.match(/(?:launched|founded|established|started)\s+in\s+(\d{4})/i)
  const foundingDate = foundingYearMatch?.[1]

  const localBusiness: Record<string, unknown> = {
    '@type': 'Organization',   // Organization is more appropriate than LocalBusiness for D2C brands
    '@id': `${storeUrl}#business`,
    name: store.storeName,
    url: storeUrl,
    parentOrganization: { '@id': 'https://downxtown.com/#organization' },
    ...(logoUrl ? { logo: logoUrl, image: logoUrl } : {}),
    ...(store.description ? { description: store.description } : {}),
    ...(store.city
      ? {
          address: {
            '@type': 'PostalAddress',
            addressLocality: store.city,
            ...(store.state ? { addressRegion: store.state } : {}),
            addressCountry: 'IN',
          },
          location: {
            '@type': 'Place',
            name: [store.city, store.state].filter(Boolean).join(', '),
          },
        }
      : {}),
    areaServed: 'IN',
    // knowsAbout maps brand keywords to topical expertise — helps Google
    // understand what this brand is authoritative about
    ...(store.searchKeywords?.length
      ? { knowsAbout: store.searchKeywords.slice(0, 10) }
      : {}),
    // founder signals this is a real entity with a human behind it
    ...(store.ownerName
      ? {
          founder: {
            '@type': 'Person',
            name: store.ownerName,
          },
        }
      : {}),
    ...(foundingDate ? { foundingDate } : {}),
    ...(store.phoneNumber ? { telephone: store.phoneNumber } : {}),
    ...(sameAs.length > 0 ? { sameAs } : {}),
    ...(store.averageRating > 0 && store.totalReviews > 0
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

  const profilePage: Record<string, unknown> = {
    '@type': 'ProfilePage',
    '@id': `${storeUrl}#profile`,
    url: storeUrl,
    name: `${store.storeName} (@${store.storeUsername})`,
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

  // FAQ schema — auto-generated from available data
  // Targets "what is X brand", "where is X from", "who founded X" queries
  const faqItems: Array<{ question: string; answer: string }> = []

  if (store.description) {
    faqItems.push({
      question: `What is ${store.storeName}?`,
      answer: store.description.slice(0, 300),
    })
  }
  if (store.city) {
    faqItems.push({
      question: `Where is ${store.storeName} from?`,
      answer: `${store.storeName} is an Indian brand${store.city ? ` based in ${store.city}${store.state ? `, ${store.state}` : ''}` : ''}.`,
    })
  }
  if (store.ownerName) {
    faqItems.push({
      question: `Who founded ${store.storeName}?`,
      answer: `${store.storeName} was founded by ${store.ownerName}.`,
    })
  }
  if (store.searchKeywords?.length) {
    const keywordStr = store.searchKeywords.slice(0, 5).join(', ')
    faqItems.push({
      question: `What does ${store.storeName} sell?`,
      answer: `${store.storeName} sells ${keywordStr} and more. Shop their full collection on Downxtown.`,
    })
  }

  const faqSchema = faqItems.length > 0
    ? [{
        '@type': 'FAQPage',
        mainEntity: faqItems.map(({ question, answer }) => ({
          '@type': 'Question',
          name: question,
          acceptedAnswer: { '@type': 'Answer', text: answer },
        })),
      }]
    : []

  return JSON.stringify({
    '@context': 'https://schema.org',
    '@graph': [
      profilePage,
      localBusiness,
      ...faqSchema,
      ...(products.length > 0
        ? [
            {
              '@type': 'ItemList',
              name: `Products from ${store.storeName}`,
              url: storeUrl,
              numberOfItems: store.productCount,
              itemListElement: products.slice(0, 12).map((product, idx) => ({
                '@type': 'ListItem',
                position: idx + 1,
                url: `${siteUrl}${buildProductUrl(product.id)}`,
                name: product.name,
              })),
            },
          ]
        : []),
    ],
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

  const { products: ssrProducts, hasNextPage: ssrHasNextPage } = await fetchStoreProducts(store.id)

  return (
    <>
      <Script
        id="store-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: buildJsonLd(store, ssrProducts) }}
      />

      <main className="min-h-screen bg-white">
        <StoreProfileClient
          store={store}
          ssrProducts={ssrProducts}
          ssrHasNextPage={ssrHasNextPage}
        />
      </main>
    </>
  )
}
