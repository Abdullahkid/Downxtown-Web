/**
 * Store Collection Page — Next.js Server Component.
 *
 * Route: /store/{storeUsername}/collection/{categoryId}
 * Example: /store/bonkers-corner/collection/695d5a33429a7676c73332e1
 *
 * What this does for SEO:
 *  - Each store collection gets a dedicated, indexable URL
 *  - Server renders page 1 of products so Googlebot sees real content
 *  - generateMetadata produces: "Women Jackets — Bonkers Corner | Downxtown"
 *    → rankable for "women jackets bonkers corner", "jacket collection india" etc.
 *  - ItemList JSON-LD links each product back to its product page entity
 *  - BreadcrumbList: Downxtown → Store → Collection
 *
 * No new backend endpoints needed — uses existing:
 *  - GET /stores/{storeId}/categories/{categoryId} (category details)
 *  - GET /stores/{storeId}/categories/{categoryId}/products (products)
 *  - GET /stores/by-username/{username}/profile (store name for breadcrumb)
 */

import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ChevronRight } from 'lucide-react'
import { ImageLoader } from '@/lib/image/imageLoader'
import { buildProductUrl, formatPrice } from '@/lib/utils/urlBuilders'
import { CollectionProductsClient } from './CollectionProductsClient'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const API_BASE = 'https://api.downxtown.com'
const SITE_URL = 'https://downxtown.com'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface CollectionProduct {
  id: string
  name: string
  mainImageUrl: string
  sellingPrice: number
  mrp: number
  shopifyHandle?: string | null
}

interface CollectionData {
  storeId: string
  storeName: string
  categoryId: string
  categoryName: string
  categoryImageUrl?: string
  productCount: number
  products: CollectionProduct[]
  hasNextPage: boolean
}

// ---------------------------------------------------------------------------
// Data fetching
// ---------------------------------------------------------------------------

async function fetchCollectionData(
  storeUsername: string,
  categoryId: string,
): Promise<CollectionData | null> {
  try {
    // Fetch store profile (for storeId + storeName) and category products in parallel
    const [profileRes, productsRes] = await Promise.all([
      fetch(`${API_BASE}/stores/by-username/${storeUsername}/profile`, {
        next: { revalidate: 300 },
      }),
      // Can't fetch products yet — need storeId first. Fetch profile first.
    ] as const)

    if (!profileRes.ok) return null
    const profileBody = await profileRes.json() as {
      success: boolean
      storeProfile?: { id: string; storeName: string }
    }
    if (!profileBody.success || !profileBody.storeProfile) return null

    const storeId = profileBody.storeProfile.id
    const storeName = profileBody.storeProfile.storeName

    // Now fetch category details + products in parallel
    const [categoryRes, productPageRes] = await Promise.all([
      fetch(`${API_BASE}/stores/${storeId}/categories/${categoryId}`, {
        next: { revalidate: 300 },
      }),
      fetch(
        `${API_BASE}/stores/${storeId}/categories/${categoryId}/products?page=1&pageSize=20`,
        { next: { revalidate: 120 } },
      ),
    ])

    if (!categoryRes.ok || !productPageRes.ok) return null

    const categoryBody = await categoryRes.json() as {
      success: boolean
      data?: {
        id: string
        name: string
        imageUrl?: string
        productCount: number
      } | null
    }

    const productBody = await productPageRes.json() as {
      success: boolean
      data?: {
        category: { id: string; name: string; productCount: number }
        products: {
          items: Array<{
            id: string
            title?: string
            name?: string
            mainImageUrl?: string
            sellingPrice: number
            mrp?: number
            shopifyHandle?: string | null
          }>
          hasNextPage: boolean
          currentPage: number
        }
      } | null
    }

    if (!productBody.success || !productBody.data) return null

    const cat = categoryBody.data
    const products = productBody.data.products.items.map((p) => ({
      id: p.id,
      name: p.title ?? p.name ?? '',
      mainImageUrl: p.mainImageUrl ?? '',
      sellingPrice: p.sellingPrice,
      mrp: p.mrp ?? p.sellingPrice,
      shopifyHandle: p.shopifyHandle ?? null,
    }))

    return {
      storeId,
      storeName,
      categoryId,
      categoryName: cat?.name ?? productBody.data.category.name,
      categoryImageUrl: cat?.imageUrl,
      productCount: cat?.productCount ?? productBody.data.category.productCount,
      products,
      hasNextPage: productBody.data.products.hasNextPage,
    }
  } catch {
    return null
  }
}

// ---------------------------------------------------------------------------
// generateMetadata
// ---------------------------------------------------------------------------

export async function generateMetadata({
  params,
}: {
  params: Promise<{ storeUsername: string; categoryId: string }>
}): Promise<Metadata> {
  const { storeUsername, categoryId } = await params
  const data = await fetchCollectionData(storeUsername, categoryId)

  if (!data) {
    return {
      title: 'Collection Not Found',
      robots: { index: false, follow: false },
    }
  }

  const pageUrl = `${SITE_URL}/store/${storeUsername}/collection/${categoryId}`
  const title = `${data.categoryName} — ${data.storeName}`
  const description = `Shop ${data.categoryName} from ${data.storeName} on Downxtown. ${data.productCount} products available.`

  return {
    title,
    description,
    alternates: { canonical: pageUrl },
    robots: { index: true, follow: true },
    openGraph: {
      type: 'website',
      url: pageUrl,
      siteName: 'Downxtown',
      title: `${title} | Downxtown`,
      description,
      ...(data.categoryImageUrl
        ? {
            images: [
              {
                url: data.categoryImageUrl,
                width: 800,
                height: 800,
                alt: data.categoryName,
              },
            ],
          }
        : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | Downxtown`,
      description,
    },
  }
}

// ---------------------------------------------------------------------------
// JSON-LD
// ---------------------------------------------------------------------------

function buildJsonLd(
  storeUsername: string,
  categoryId: string,
  data: CollectionData,
): string {
  const pageUrl = `${SITE_URL}/store/${storeUsername}/collection/${categoryId}`
  const storeUrl = `${SITE_URL}/store/${storeUsername}`

  return JSON.stringify({
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        '@id': `${pageUrl}#collection`,
        name: `${data.categoryName} — ${data.storeName}`,
        description: `${data.categoryName} collection from ${data.storeName}`,
        url: pageUrl,
        isPartOf: { '@id': `${storeUrl}#business` },
        // ItemList links this collection to each product entity
        mainEntity: {
          '@type': 'ItemList',
          numberOfItems: data.productCount,
          itemListElement: data.products.slice(0, 10).map((product, idx) => ({
            '@type': 'ListItem',
            position: idx + 1,
            url: `${SITE_URL}${buildProductUrl(product.id, product.shopifyHandle)}`,
            name: product.name,
          })),
        },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Downxtown', item: SITE_URL },
          { '@type': 'ListItem', position: 2, name: data.storeName, item: storeUrl },
          { '@type': 'ListItem', position: 3, name: data.categoryName, item: pageUrl },
        ],
      },
    ],
  })
}

// ---------------------------------------------------------------------------
// Product card (SSR — no client JS needed for page 1)
// ---------------------------------------------------------------------------

function SSRProductCard({ product }: { product: CollectionProduct }) {
  const discount =
    product.mrp > product.sellingPrice
      ? Math.round(((product.mrp - product.sellingPrice) / product.mrp) * 100)
      : 0

  return (
    <Link
      href={buildProductUrl(product.id, product.shopifyHandle)}
      className={[
        'group flex flex-col overflow-hidden rounded-xl border border-gray-100 bg-white',
        'shadow-sm hover:shadow-md active:scale-[0.98] transition-all duration-150',
        'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2',
        'focus-visible:outline-[var(--brand-color,#6366f1)]',
      ].join(' ')}
      aria-label={`${product.name}, ${formatPrice(product.sellingPrice)}`}
    >
      <div className="relative aspect-square w-full overflow-hidden bg-gray-50">
        <ImageLoader
          imageId={product.mainImageUrl}
          endpoint="detail"
          alt={product.name}
          fill
          imageContext="product"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="transition-transform duration-200 group-hover:scale-105"
        />
        {discount > 0 && (
          <span className="absolute left-2 top-2 rounded-full bg-green-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
            {discount}% off
          </span>
        )}
      </div>
      <div className="flex flex-col gap-0.5 p-2.5">
        <p className="line-clamp-2 text-xs font-medium text-gray-800 leading-snug">
          {product.name}
        </p>
        <div className="flex items-baseline gap-1.5 mt-1">
          <span className="text-sm font-bold text-gray-900">
            {formatPrice(product.sellingPrice)}
          </span>
          {product.mrp > product.sellingPrice && (
            <span className="text-xs text-gray-400 line-through">
              {formatPrice(product.mrp)}
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

interface PageProps {
  params: Promise<{ storeUsername: string; categoryId: string }>
}

export default async function CollectionPage({ params }: PageProps) {
  const { storeUsername, categoryId } = await params
  const data = await fetchCollectionData(storeUsername, categoryId)

  if (!data) notFound()

  const jsonLd = buildJsonLd(storeUsername, categoryId, data)

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd }}
      />

      <main className="min-h-screen bg-white">
        <div className="max-w-5xl mx-auto px-4 pb-24">

          {/* Breadcrumb */}
          <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-1.5 py-3 text-xs text-gray-400 flex-wrap"
          >
            <Link href="/" className="hover:text-brand transition-colors">Home</Link>
            <ChevronRight size={12} aria-hidden="true" />
            <Link
              href={`/store/${storeUsername}`}
              className="hover:text-brand transition-colors"
            >
              {data.storeName}
            </Link>
            <ChevronRight size={12} aria-hidden="true" />
            <span className="text-gray-700 font-medium" aria-current="page">
              {data.categoryName}
            </span>
          </nav>

          {/* Header */}
          <header className="flex items-center gap-4 pb-5 border-b border-gray-100">
            {data.categoryImageUrl && (
              <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-2xl border border-gray-100">
                <Image
                  src={data.categoryImageUrl}
                  alt={data.categoryName}
                  fill
                  sizes="64px"
                  className="object-cover"
                  unoptimized={data.categoryImageUrl.startsWith('https://cdn.shopify.com')}
                  priority
                />
              </div>
            )}
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{data.categoryName}</h1>
              <p className="text-sm text-gray-400 mt-0.5">
                {data.productCount} product{data.productCount !== 1 ? 's' : ''} ·{' '}
                <Link
                  href={`/store/${storeUsername}`}
                  className="text-brand hover:underline"
                >
                  {data.storeName}
                </Link>
              </p>
            </div>
          </header>

          {/* SSR page 1 products — Googlebot sees these */}
          <section
            aria-label={`${data.categoryName} products`}
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 pt-5"
          >
            {data.products.map((product) => (
              <SSRProductCard key={product.id} product={product} />
            ))}
          </section>

          {/* Client: pages 2+ infinite scroll */}
          <div className="mt-3">
            <CollectionProductsClient
              storeId={data.storeId}
              categoryId={categoryId}
              hasMorePages={data.hasNextPage}
            />
          </div>

        </div>
      </main>
    </>
  )
}
