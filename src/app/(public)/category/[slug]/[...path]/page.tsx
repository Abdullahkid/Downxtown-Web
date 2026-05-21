/**
 * Taxonomy Product Page — Next.js Server Component.
 *
 * Handles all taxonomy sub-routes under /category/{root}/{...path}:
 *   /category/fashion/tops
 *   /category/fashion/tops/t-shirts
 *   /category/footwear/casual-shoes/sneakers
 *   /category/fashion/womens-ethnic-wear/kurtas-and-kurtis
 *   etc.
 *
 * The full path (root slug + rest-of-path) is looked up in TAXONOMY_MAP.
 * Unknown paths return 404. No backend call to resolve the slug.
 *
 * SEO strategy:
 *  - Server renders page 1 of products — Googlebot sees real content
 *  - generateMetadata produces node-specific titles and descriptions
 *    (e.g. "Buy Kurtas & Kurtis from Indian D2C Brands | Downxtown")
 *  - ItemList + BreadcrumbList JSON-LD per page
 *  - TaxonomyProductsClient handles pages 2+ and gender filter client-side
 *
 * Route: /category/[slug]/[...path]
 *  - [slug]    = root category (fashion | footwear | cosmetics)
 *  - [...path] = remaining segments (tops, tops/t-shirts, etc.)
 */

import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import React from 'react'
import Link from 'next/link'
import { ChevronRight, Star } from 'lucide-react'
import { ImageLoader } from '@/lib/image/imageLoader'
import { buildProductUrl, formatPrice } from '@/lib/utils/urlBuilders'
import { TAXONOMY_MAP, ROOT_CATEGORY_LABELS } from '@/lib/taxonomy/taxonomyMap'
import { TaxonomyProductsClient } from './TaxonomyProductsClient'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const API_BASE = 'https://api.downxtown.com'
const SITE_URL = 'https://downxtown.com'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface TaxonomyProduct {
  id: string
  title: string
  brandName: string
  mainImageUrl: string
  sellingPrice: number
  mrp: number
  averageRating: number
  shopifyHandle?: string | null
  storeUsername?: string | null
}

interface TaxonomyProductsApiResponse {
  products: TaxonomyProduct[]
  currentPage: number
  hasNextPage: boolean
  totalProducts: number
}

// ---------------------------------------------------------------------------
// Data fetching
// ---------------------------------------------------------------------------

async function fetchPage1(
  leafId: string | undefined,
  nodeId: string | undefined,
): Promise<{ products: TaxonomyProduct[]; hasNextPage: boolean; totalProducts: number }> {
  try {
    const params = new URLSearchParams({ page: '1', limit: '20' })
    if (leafId) params.set('leafId', leafId)
    else if (nodeId) params.set('nodeId', nodeId)

    const res = await fetch(`${API_BASE}/taxonomy/products?${params.toString()}`, {
      next: { revalidate: 300 }, // 5 min — product listings change moderately
    })
    if (!res.ok) return { products: [], hasNextPage: false, totalProducts: 0 }

    const data = (await res.json()) as TaxonomyProductsApiResponse
    return {
      products: data.products ?? [],
      hasNextPage: data.hasNextPage ?? false,
      totalProducts: data.totalProducts ?? 0,
    }
  } catch {
    return { products: [], hasNextPage: false, totalProducts: 0 }
  }
}

// ---------------------------------------------------------------------------
// generateMetadata
// ---------------------------------------------------------------------------

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; path: string[] }>
}): Promise<Metadata> {
  const { slug, path } = await params
  const fullPath = [slug, ...path].join('/')
  const node = TAXONOMY_MAP[fullPath]

  if (!node) {
    return { title: 'Category Not Found', robots: { index: false, follow: false } }
  }

  const rootLabel = ROOT_CATEGORY_LABELS[slug] ?? slug
  const pageUrl = `${SITE_URL}/category/${fullPath}`
  const count = node.estimatedCount ? ` ${node.estimatedCount.toLocaleString('en-IN')}+` : ''

  const title = `Buy ${node.label} from Indian D2C Brands`
  const description =
    node.description ??
    `Shop${count} ${node.label} products from India's best D2C brands on Downxtown. Authentic brands, direct prices, fast delivery.`

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
      locale: 'en_IN',
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
  fullPath: string,
  node: (typeof TAXONOMY_MAP)[string],
  products: TaxonomyProduct[],
  totalProducts: number,
): string {
  const pageUrl = `${SITE_URL}/category/${fullPath}`
  const segments = fullPath.split('/')

  // Build breadcrumb items from path segments
  const breadcrumbItems = segments.map((seg, idx) => {
    const partialPath = segments.slice(0, idx + 1).join('/')
    const segNode = TAXONOMY_MAP[partialPath]
    const rootLabel = ROOT_CATEGORY_LABELS[seg]
    return {
      '@type': 'ListItem',
      position: idx + 2, // starts at 2 (1 is Downxtown home)
      name: segNode?.label ?? rootLabel ?? seg,
      item: `${SITE_URL}/category/${partialPath}`,
    }
  })

  return JSON.stringify({
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        '@id': `${pageUrl}#collection`,
        name: `${node.label} — Indian D2C Brands | Downxtown`,
        description:
          node.description ??
          `Shop ${node.label} from India's best D2C brands on Downxtown.`,
        url: pageUrl,
        numberOfItems: totalProducts,
        mainEntity: {
          '@type': 'ItemList',
          numberOfItems: Math.min(products.length, 20),
          itemListElement: products.slice(0, 20).map((product, idx) => ({
            '@type': 'ListItem',
            position: idx + 1,
            url: `${SITE_URL}${buildProductUrl(product.id, product.shopifyHandle)}`,
            name: product.title,
          })),
        },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Downxtown', item: SITE_URL },
          ...breadcrumbItems,
        ],
      },
    ],
  })
}

// ---------------------------------------------------------------------------
// SSR Product Card (no client JS needed for page 1)
// ---------------------------------------------------------------------------

function SSRProductCard({ product }: { product: TaxonomyProduct }) {
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
      aria-label={`${product.title}, ${formatPrice(product.sellingPrice)}`}
    >
      <div className="relative aspect-square w-full overflow-hidden bg-gray-50">
        <ImageLoader
          imageId={product.mainImageUrl}
          endpoint="detail"
          alt={product.title}
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
        {product.brandName && (
          <p className="text-[10px] font-semibold text-brand-accent uppercase tracking-wide truncate">
            {product.brandName}
          </p>
        )}
        <p className="line-clamp-2 text-xs font-medium text-gray-800 leading-snug">
          {product.title}
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
        {product.averageRating > 0 && (
          <div className="flex items-center gap-0.5 mt-0.5">
            <Star size={10} className="fill-amber-400 text-amber-400" aria-hidden="true" />
            <span className="text-[10px] text-gray-500">{product.averageRating.toFixed(1)}</span>
          </div>
        )}
      </div>
    </Link>
  )
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

interface PageProps {
  params: Promise<{ slug: string; path: string[] }>
}

export default async function TaxonomyProductPage({ params }: PageProps) {
  const { slug, path } = await params
  const fullPath = [slug, ...path].join('/')
  const node = TAXONOMY_MAP[fullPath]

  if (!node) notFound()

  const { products, hasNextPage, totalProducts } = await fetchPage1(node.leafId, node.nodeId)

  const jsonLd = buildJsonLd(fullPath, node, products, totalProducts)

  // Build breadcrumb trail from path segments
  const segments = fullPath.split('/')
  const breadcrumbs: { label: string; href: string }[] = [
    { label: 'Home', href: '/' },
    { label: ROOT_CATEGORY_LABELS[slug] ?? slug, href: `/category/${slug}` },
    ...segments.slice(1).map((_, idx) => {
      const partialPath = segments.slice(0, idx + 2).join('/')
      const segNode = TAXONOMY_MAP[partialPath]
      return {
        label: segNode?.label ?? segments[idx + 1],
        href: `/category/${partialPath}`,
      }
    }),
  ]

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd }}
      />

      <main className="min-h-screen bg-white">
        <div className="max-w-5xl mx-auto px-4 pb-24">

          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="flex items-center gap-1 py-3 text-xs text-gray-400 flex-wrap">
            {breadcrumbs.map((crumb, idx) => (
              <React.Fragment key={crumb.href}>
                {idx > 0 && <ChevronRight size={11} aria-hidden="true" className="flex-shrink-0" />}
                {idx === breadcrumbs.length - 1 ? (
                  <span className="text-gray-700 font-medium" aria-current="page">
                    {crumb.label}
                  </span>
                ) : (
                  <Link href={crumb.href} className="hover:text-brand transition-colors">
                    {crumb.label}
                  </Link>
                )}
              </React.Fragment>
            ))}
          </nav>

          {/* Page header */}
          <header className="pb-5 border-b border-gray-100">
            <h1 className="text-2xl font-bold text-gray-900">{node.label}</h1>
            <p className="text-sm text-gray-400 mt-1">
              {totalProducts > 0
                ? `${totalProducts.toLocaleString('en-IN')} products from Indian D2C brands`
                : 'Products from Indian D2C brands'}
            </p>
          </header>

          {/* SSR page 1 products — Googlebot sees these */}
          {products.length > 0 ? (
            <section
              aria-label={`${node.label} products`}
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 pt-5"
            >
              {products.map((product) => (
                <SSRProductCard key={product.id} product={product} />
              ))}
            </section>
          ) : (
            <p className="text-center text-gray-400 py-16 text-sm">
              No products available in this category yet.
            </p>
          )}

          {/* Client: gender tabs + pages 2+ */}
          <div className="mt-5">
            <TaxonomyProductsClient
              leafId={node.leafId}
              nodeId={node.nodeId}
              hasMorePages={hasNextPage}
            />
          </div>

        </div>
      </main>
    </>
  )
}
