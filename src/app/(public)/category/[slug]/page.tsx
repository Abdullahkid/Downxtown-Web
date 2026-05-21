/**
 * Category Page — Next.js Server Component.
 *
 * Routes: /category/fashion, /category/footwear, /category/electronics,
 *         /category/cosmetics, /category/accessories
 *
 * SEO strategy:
 *  - Server-renders page 1 of the category feed so Googlebot sees real content
 *    without waiting for JavaScript. This is what makes the page rankable.
 *  - generateMetadata provides category-specific <title>, <description>,
 *    Open Graph tags, and canonical URL.
 *  - Schema.org CollectionPage JSON-LD declares each route as a curated
 *    collection of local businesses, which is exactly what it is.
 *  - CategoryFeedClient takes over from page 2 onwards (client-side infinite scroll).
 *
 * Unknown slugs (e.g. /category/xyz) return 404 immediately.
 *
 * Requirements: 7.1–7.16, 21.1–21.7
 */

import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { FeedStoreCard } from '@/components/feed/FeedStoreCard'
import { CategoryFeedClient } from './CategoryFeedClient'
import { CATEGORY_CONFIG } from './categoryConfig'
import type { PaginatedFeedResponse, ApiResponse, FeedStore } from '@/types/feed'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const API_BASE = 'https://api.downxtown.com'
const SITE_URL = 'https://downxtown.com'

// ---------------------------------------------------------------------------
// Data fetching
// ---------------------------------------------------------------------------

async function fetchCategoryFeedPage1(
  apiValue: string,
): Promise<{ stores: FeedStore[]; hasNextPage: boolean }> {
  try {
    const params = new URLSearchParams({
      page: '1',
      limit: '10',
      productsPerStore: '5',
    })
    const res = await fetch(
      `${API_BASE}/feed/filtered?category=${apiValue}&${params.toString()}`,
      {
        // Revalidate every 10 minutes — category feeds change less frequently
        // than individual product/store pages
        next: { revalidate: 600 },
      },
    )
    if (!res.ok) return { stores: [], hasNextPage: false }

    const wrapped = (await res.json()) as ApiResponse<PaginatedFeedResponse>
    if (!wrapped.success || !wrapped.data) return { stores: [], hasNextPage: false }

    return {
      stores: wrapped.data.stores,
      hasNextPage: wrapped.data.hasNextPage,
    }
  } catch {
    return { stores: [], hasNextPage: false }
  }
}

// ---------------------------------------------------------------------------
// generateMetadata
// ---------------------------------------------------------------------------

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const config = CATEGORY_CONFIG[slug]

  if (!config) {
    return {
      title: 'Category Not Found',
      robots: { index: false, follow: false },
    }
  }

  const pageUrl = `${SITE_URL}/category/${slug}`

  return {
    title: config.title,
    description: config.description,
    alternates: { canonical: pageUrl },
    robots: { index: true, follow: true },
    openGraph: {
      type: 'website',
      url: pageUrl,
      siteName: 'Downxtown',
      title: `${config.title} — Downxtown`,
      description: config.description,
      images: [
        {
          url: '/app-feed.png',
          width: 1200,
          height: 630,
          alt: `${config.label} brands on Downxtown`,
        },
      ],
      locale: 'en_IN',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${config.title} — Downxtown`,
      description: config.description,
      images: ['/app-feed.png'],
    },
  }
}

// ---------------------------------------------------------------------------
// Schema.org JSON-LD — CollectionPage
// ---------------------------------------------------------------------------

function buildJsonLd(
  slug: string,
  config: (typeof CATEGORY_CONFIG)[string],
  stores: FeedStore[],
): string {
  const pageUrl = `${SITE_URL}/category/${slug}`

  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': `${pageUrl}#collection`,
    name: `${config.label} Brands — Downxtown`,
    description: config.description,
    url: pageUrl,
    // hasPart links the collection to each store entity on the page.
    // Google uses this to understand the relationship between the category
    // page and the individual store pages it lists.
    hasPart: stores.slice(0, 10).map((store) => ({
      '@type': 'LocalBusiness',
      '@id': `${SITE_URL}/store/${store.storeUsername}#business`,
      name: store.storeName,
      url: `${SITE_URL}/store/${store.storeUsername}`,
    })),
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Downxtown', item: SITE_URL },
        { '@type': 'ListItem', position: 2, name: config.label, item: pageUrl },
      ],
    },
  })
}

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------

interface CategoryPageProps {
  params: Promise<{ slug: string }>
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params
  const config = CATEGORY_CONFIG[slug]

  if (!config) notFound()

  const { stores, hasNextPage } = await fetchCategoryFeedPage1(config.apiValue)

  const jsonLd = buildJsonLd(slug, config, stores)

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd }}
      />

      <main className="min-h-screen bg-background">
        <div className="max-w-[1320px] mx-auto px-2 md:px-4 xl:px-6 pb-24 space-y-5">

          {/* ---------------------------------------------------------------- */}
          {/* Page header — crawlable H1 + category context                    */}
          {/* ---------------------------------------------------------------- */}
          <header className="flex items-center gap-4 pt-4">
            <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-2xl">
              <Image
                src={config.imageSrc}
                alt={config.label}
                fill
                sizes="56px"
                className="object-cover"
                priority
              />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-text-1">{config.h1}</h1>
              <p className="text-sm text-text-3 mt-0.5">
                Discover Indian D2C brands on Downxtown
              </p>
            </div>
          </header>

          {/* ---------------------------------------------------------------- */}
          {/* Category nav strip — links between categories, all crawlable     */}
          {/* ---------------------------------------------------------------- */}
          <nav aria-label="Browse other categories">
            <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
              {Object.entries(CATEGORY_CONFIG).map(([catSlug, cat]) => (
                <Link
                  key={catSlug}
                  href={`/category/${catSlug}`}
                  aria-current={catSlug === slug ? 'page' : undefined}
                  className={[
                    'flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors',
                    'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand',
                    catSlug === slug
                      ? 'bg-brand text-white'
                      : 'bg-bg-3 border border-border text-text-2 hover:text-text-1 hover:bg-surface',
                  ].join(' ')}
                >
                  {cat.label}
                </Link>
              ))}
            </div>
          </nav>

          {/* ---------------------------------------------------------------- */}
          {/* SSR page 1 stores — Google sees these without JS                 */}
          {/* ---------------------------------------------------------------- */}
          {stores.length > 0 && (
            <section
              aria-label={`${config.label} stores — page 1`}
              className="space-y-4 md:grid md:grid-cols-2 md:gap-4 xl:gap-5 md:space-y-0"
            >
              {stores.map((store) => (
                <div key={store.businessId}>
                  <FeedStoreCard store={store} />
                </div>
              ))}
            </section>
          )}

          {/* ---------------------------------------------------------------- */}
          {/* Client: gender tabs + pages 2+ infinite scroll                   */}
          {/* ---------------------------------------------------------------- */}
          <CategoryFeedClient
            apiValue={config.apiValue}
            initialStores={[]}
            hasMorePages={hasNextPage}
            showGenderTabs={slug !== 'electronics'}
          />

        </div>
      </main>
    </>
  )
}
