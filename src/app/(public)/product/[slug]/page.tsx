/**
 * Product Page — Next.js Server Component (SSR).
 *
 * URL format: /product/{slug}-{objectId}
 *   e.g. /product/rockstar-stitch-oversized-t-shirt-1-695d5897429a7676c733204c
 *
 * The route param is named [slug] but the actual MongoDB ObjectId is always
 * the last 24 lowercase hex characters of the slug. This function extracts it
 * and calls the existing /api/v1/products/{productId}/page endpoint unchanged.
 * The backend never sees the slug — only the ObjectId — so Sigma2 (Android app)
 * is completely unaffected.
 *
 * REDIRECT BEHAVIOUR:
 * If a user (or internal link) arrives at the bare-ID form
 * (/product/695d5897429a7676c733204c), the page fetches the product, builds the
 * canonical slug URL, and issues a 308 permanent redirect to it. This means:
 *  - All existing links in the app (feed cards, search results, store grids, etc.)
 *    continue to work — they just get silently redirected to the slug URL.
 *  - Google receives a 308 and updates its index to the slug URL.
 *  - Users always see the pretty URL in the address bar.
 *
 * Legacy URLs (/product/{24-hex-objectId} with no slug prefix) are handled the
 * same way — the 24-char segment passes extractProductId, the product is fetched,
 * and then the redirect fires.
 *
 * Requirements: 10.1–10.14, 21.2, 21.5–21.7, 25.3, 29.2–29.3, 30.1–30.5
 */

import type { Metadata } from 'next'
import { notFound, permanentRedirect } from 'next/navigation'
import type { Product, MiniProduct, ImageGroup } from '@/types/product'
import { buildProductUrl, formatPrice } from '@/lib/utils/urlBuilders'
import { buildImageUrl } from '@/lib/image/imageUrls'
import { ProductPageClient } from './ProductPageClient'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const API_BASE = 'https://api.downxtown.com'
const SITE_URL = 'https://downxtown.com'

/** Truncates a slug to first MAX_WORDS words, with MAX_CHARS as a hard safety-net cap.
 *  Mirrors truncateSlug() in urlBuilders.ts and buildProductSlug() in SitemapRoutes.kt exactly.
 */
function truncateSlug(slug: string, maxWords = 6, maxChars = 75): string {
  const words = slug.split('-').filter(Boolean)
  const wordCapped = words.slice(0, maxWords).join('-')
  if (wordCapped.length <= maxChars) return wordCapped
  const truncated = wordCapped.substring(0, maxChars)
  const lastHyphen = truncated.lastIndexOf('-')
  return lastHyphen > 0 ? truncated.substring(0, lastHyphen) : truncated
}

/** MongoDB ObjectId is always exactly 24 lowercase hex characters. */
const OBJECT_ID_RE = /^[a-f0-9]{24}$/

// ---------------------------------------------------------------------------
// Slug → productId extraction
// ---------------------------------------------------------------------------

/**
 * Extracts the MongoDB ObjectId from a slug param.
 *
 * The slug is either:
 *  - "{human-readable-slug}-{24-hex-objectId}"  e.g. "rockstar-stitch-1-695d5897429a7676c733204c"
 *  - "{24-hex-objectId}"                        e.g. "695d5897429a7676c733204c"  (legacy)
 *
 * In both cases the ObjectId is the last 24 characters.
 */
function extractProductId(slug: string): string | null {
  const id = slug.slice(-24)
  return OBJECT_ID_RE.test(id) ? id : null
}

// ---------------------------------------------------------------------------
// Data fetching helpers
// ---------------------------------------------------------------------------

async function fetchProduct(productId: string): Promise<Product | null> {
  try {
    const res = await fetch(`${API_BASE}/api/v1/products/${productId}/page`, {
      // SSR: revalidate every 60 seconds so price/inventory stays fresh
      next: { revalidate: 60 },
    })
    if (res.status === 404) return null
    if (!res.ok) throw new Error(`Failed to fetch product: ${res.status}`)

    // Backend returns ProductPageDetailsDto — map to our Product type
    const dto = await res.json() as {
      id: string
      title: string
      brandName?: string
      description: string
      keyFeatures: string[]
      imageGroups: Array<{ id: string; name: string; images: string[]; groupType: string; color?: string }>
      variants: Array<{
        variantId: string
        imageGroupId?: string
        attributes: Record<string, string>
        mrp?: number
        sellingPrice: number
        inventory: number
        status: string
      }>
      mrp?: number
      sellingPrice: number
      isReturnable: boolean
      isCodAllowed: boolean
      estimatedDeliveryDays?: { min: number; max: number }
      shippingCost?: { amount: number }
      averageRating: number
      storeInfo: {
        businessId: string
        storeUsername: string
        storeName: string
        managedBy?: string
        websiteUrl?: string | null
      }
      shopifyHandle?: string | null
    }

    // Map to the Product type used by ProductPageClient
    const product: Product = {
      id: dto.id,
      businessId: dto.storeInfo.businessId,
      name: dto.title,
      brandName: dto.brandName ?? '',
      description: dto.description,
      keyFeatures: dto.keyFeatures,
      imageGroups: (dto.imageGroups ?? []) as ImageGroup[],
      variants: dto.variants.map(v => ({
        id: v.variantId,
        attributes: v.attributes,
        sellingPrice: v.sellingPrice,
        mrp: v.mrp ?? v.sellingPrice,
        inventory: v.inventory,
        imageGroupId: v.imageGroupId ?? '',
        status: v.status as 'AVAILABLE' | 'OUT_OF_STOCK' | 'DISCONTINUED',
      })),
      mainCategory: '',
      shippingCost: dto.shippingCost?.amount ?? 0,
      estimatedDeliveryDays: dto.estimatedDeliveryDays?.max ?? 7,
      isCodAllowed: dto.isCodAllowed,
      isReturnable: dto.isReturnable,
      returnWindowDays: 7,
      averageRating: dto.averageRating,
      // Store username for navigation — use storeUsername not businessId
      storeUsername: dto.storeInfo.storeUsername,
      // Admin/Shopify store fields — used to route Buy Now to external cart
      managedBy: (dto.storeInfo.managedBy as 'ADMIN' | 'SELLER' | undefined) ?? 'SELLER',
      shopifyHandle: dto.shopifyHandle ?? null,
      storeWebsiteUrl: dto.storeInfo.websiteUrl ?? null,
    }

    return product
  } catch {
    return null
  }
}

async function fetchRelatedProducts(_productId: string): Promise<MiniProduct[]> {
  // No related products endpoint exists in the backend yet
  return []
}

// ---------------------------------------------------------------------------
// generateMetadata — SSR Open Graph + Twitter Card + canonical + robots
// Requirements: 21.2, 21.3, 21.5, 21.6
// ---------------------------------------------------------------------------

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const productId = extractProductId(slug)

  if (!productId) {
    return {
      title: 'Product Not Found — Downxtown',
      robots: { index: false, follow: false },
    }
  }

  const product = await fetchProduct(productId)

  if (!product) {
    return {
      title: 'Product Not Found — Downxtown',
      robots: { index: false, follow: false },
    }
  }

  // Use the first image of the first imageGroup as the OG image
  const firstImageGroup = product.imageGroups[0]
  const firstImageId = firstImageGroup?.images[0]
  const ogImageUrl = firstImageId
    ? buildImageUrl('detail', firstImageId)
    : undefined

  // Canonical URL always uses the SEO slug form so all links converge to one URL
  const canonicalUrl = `${SITE_URL}${buildProductUrl(productId, product.shopifyHandle)}`

  const defaultVariant = product.variants[0]
  const price = defaultVariant
    ? formatPrice(defaultVariant.sellingPrice)
    : undefined

  const description = [
    product.description.slice(0, 150),
    price ? `Starting from ${price}` : '',
  ]
    .filter(Boolean)
    .join(' — ')

  return {
    title: `${product.name} — Downxtown`,
    description,
    // Req 21.3 — index, follow on public product pages
    robots: {
      index: true,
      follow: true,
    },
    // Req 21.5 — canonical link always points to the slug URL
    alternates: {
      canonical: canonicalUrl,
    },
    // Req 21.6 — Open Graph
    // Next.js Metadata API doesn't support og:type "product" directly.
    // Product pricing surfaces via og:price:amount / og:price:currency in the
    // `other` field below — Facebook and WhatsApp both read these for rich previews.
    openGraph: {
      type: 'website',
      url: canonicalUrl,
      title: product.name,
      description,
      siteName: 'Downxtown',
      images: ogImageUrl
        ? [
            {
              url: ogImageUrl,
              width: 800,
              height: 800,
              alt: product.name,
            },
          ]
        : undefined,
    },
    // Req 21.6 — Twitter Card
    twitter: {
      card: 'summary_large_image',
      title: product.name,
      description,
      images: ogImageUrl ? [ogImageUrl] : undefined,
    },
    // Product-specific Open Graph tags — Facebook and WhatsApp use these to
    // display price and availability directly in link preview cards.
    other: {
      'og:type': 'product',
      ...(defaultVariant
        ? {
            'product:price:amount': defaultVariant.sellingPrice.toFixed(2),
            'product:price:currency': 'INR',
            'product:availability': defaultVariant.status === 'AVAILABLE' ? 'in stock' : 'out of stock',
          }
        : {}),
      ...(product.brandName ? { 'product:brand': product.brandName } : {}),
    },
  }
}

// ---------------------------------------------------------------------------
// JSON-LD structured data helper
// Requirements: 21.2 — Schema.org Product + Offer
// ---------------------------------------------------------------------------

function buildJsonLd(product: Product, productId: string): string {
  const defaultVariant = product.variants[0]
  const firstImageGroup = product.imageGroups[0]
  const firstImageId = firstImageGroup?.images[0]
  const imageUrl = firstImageId ? buildImageUrl('detail', firstImageId) : undefined

  const availability =
    defaultVariant && defaultVariant.status === 'AVAILABLE'
      ? 'https://schema.org/InStock'
      : 'https://schema.org/OutOfStock'

  // Canonical product URL with SEO slug
  const productUrl = `${SITE_URL}${buildProductUrl(productId, product.shopifyHandle)}`
  const storeUrl = product.storeUsername
    ? `${SITE_URL}/store/${product.storeUsername}`
    : undefined

  // Product entity
  const productSchema: Record<string, unknown> = {
    '@type': 'Product',
    '@id': `${productUrl}#product`,
    name: product.name,
    description: product.description,
    brand: {
      '@type': 'Brand',
      name: product.brandName || undefined,
    },
    image: imageUrl ? [imageUrl] : undefined,
    url: productUrl,
    // seller links the product to the store entity on Downxtown.
    // Google uses this to build Knowledge Graph connections between products
    // and brands — eventually surfacing Downxtown store pages in branded
    // product searches (e.g. "Bonkers Corner tshirt").
    ...(storeUrl
      ? {
          seller: {
            '@type': 'Organization',
            '@id': `${storeUrl}#business`,
            url: storeUrl,
          },
        }
      : {}),
    aggregateRating:
      product.averageRating > 0
        ? {
            '@type': 'AggregateRating',
            ratingValue: product.averageRating.toFixed(1),
            bestRating: '5',
            worstRating: '1',
            // reviewCount is intentionally omitted here — the backend does not
            // currently return a review count on the product page endpoint.
            // Once the backend includes it, add: reviewCount: product.reviewCount
          }
        : undefined,
    offers: defaultVariant
      ? {
          '@type': 'Offer',
          priceCurrency: 'INR',
          price: defaultVariant.sellingPrice.toFixed(2),
          availability,
          url: productUrl,
          seller: storeUrl
            ? { '@type': 'Organization', '@id': `${storeUrl}#business` }
            : undefined,
          priceValidUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split('T')[0],
        }
      : undefined,
  }

  // BreadcrumbList — shown as a breadcrumb trail under the URL in SERPs.
  // Increases click-through rate by showing users where the page sits in the
  // site hierarchy before they click.
  // Structure: Downxtown → Store Name → Product Name
  const breadcrumb: Record<string, unknown> = {
    '@type': 'BreadcrumbList',
    '@id': `${productUrl}#breadcrumb`,
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Downxtown',
        item: SITE_URL,
      },
      ...(storeUrl && product.storeUsername
        ? [
            {
              '@type': 'ListItem',
              position: 2,
              name: product.brandName || product.storeUsername,
              item: storeUrl,
            },
            {
              '@type': 'ListItem',
              position: 3,
              name: product.name,
              item: productUrl,
            },
          ]
        : [
            {
              '@type': 'ListItem',
              position: 2,
              name: product.name,
              item: productUrl,
            },
          ]),
    ],
  }

  return JSON.stringify({
    '@context': 'https://schema.org',
    '@graph': [productSchema, breadcrumb],
  })
}

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------

interface ProductPageProps {
  params: Promise<{ slug: string }>
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params

  // Extract MongoDB ObjectId from the slug — 404 if the slug is malformed
  const productId = extractProductId(slug)
  if (!productId) {
    notFound()
  }

  // Fetch product and related products in parallel
  const [product, relatedProducts] = await Promise.all([
    fetchProduct(productId),
    fetchRelatedProducts(productId),
  ])

  if (!product) {
    notFound()
  }

  // -------------------------------------------------------------------------
  // Canonical redirect — 308 Permanent
  //
  // If the current slug is not already the canonical form, redirect to it.
  // This covers:
  //  1. Bare-ID links: /product/695d5897429a7676c733204c
  //     → /product/rockstar-stitch-oversized-t-shirt-1-695d5897429a7676c733204c
  //  2. Any stale slug that differs from the current shopifyHandle
  //
  // The canonical slug is "{shopifyHandle}-{id}" (or bare id if no handle).
  // We compare the incoming slug to the canonical form so we don't redirect
  // on every request — only when the slug is wrong or missing.
  // -------------------------------------------------------------------------
  const canonicalSlug = product.shopifyHandle
    ? `${truncateSlug(product.shopifyHandle)}-${productId}`
    : productId

  if (slug !== canonicalSlug) {
    permanentRedirect(`/product/${canonicalSlug}`)
  }

  const jsonLd = buildJsonLd(product, productId)

  return (
    <>
      {/* Schema.org JSON-LD — Req 21.2 */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd }}
      />

      {/* Client-side interactive product page */}
      <ProductPageClient
        product={product}
        productId={productId}
        relatedProducts={relatedProducts}
      />
    </>
  )
}
