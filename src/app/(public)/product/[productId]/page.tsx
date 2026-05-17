/**
 * Product Page — Next.js Server Component (SSR).
 *
 * Responsibilities:
 *  - Fetch product data server-side for SEO
 *  - Generate <head> metadata: title, description, Open Graph, Twitter Card,
 *    canonical link, robots meta
 *  - Inject Schema.org Product + Offer JSON-LD structured data
 *  - Render the full product page layout with client components for
 *    interactivity (ImageGallery, VariantSelector, ProductReview, video player,
 *    wishlist button, related products)
 *
 * Requirements: 10.1–10.14, 21.2, 21.5–21.7, 25.3, 29.2–29.3, 30.1–30.5
 */

import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import type { Product, MiniProduct, ImageGroup } from '@/types/product'
import { buildProductUrl, formatPrice } from '@/lib/utils/urlBuilders'
import { buildImageUrl } from '@/lib/image/imageUrls'
import { ProductPageClient } from './ProductPageClient'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const API_BASE = 'https://api.downxtown.com'
const SITE_URL = 'https://downxtown.com'

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
      storeInfo: { businessId: string; storeUsername: string; storeName: string }
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
  params: Promise<{ productId: string }>
}): Promise<Metadata> {
  const { productId } = await params
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

  const canonicalUrl = `${SITE_URL}${buildProductUrl(productId)}`
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
    // Req 21.5 — canonical link
    alternates: {
      canonical: canonicalUrl,
    },
    // Req 21.6 — Open Graph
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

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    brand: {
      '@type': 'Brand',
      name: product.brandName,
    },
    image: imageUrl ? [imageUrl] : undefined,
    url: `${SITE_URL}${buildProductUrl(productId)}`,
    aggregateRating:
      product.averageRating > 0
        ? {
            '@type': 'AggregateRating',
            ratingValue: product.averageRating.toFixed(1),
            bestRating: '5',
            worstRating: '1',
          }
        : undefined,
    offers: defaultVariant
      ? {
          '@type': 'Offer',
          priceCurrency: 'INR',
          price: defaultVariant.sellingPrice.toFixed(2),
          availability,
          url: `${SITE_URL}${buildProductUrl(productId)}`,
          priceValidUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split('T')[0],
        }
      : undefined,
  }

  return JSON.stringify(jsonLd)
}

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------

interface ProductPageProps {
  params: Promise<{ productId: string }>
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { productId } = await params

  // Fetch product and related products in parallel
  const [product, relatedProducts] = await Promise.all([
    fetchProduct(productId),
    fetchRelatedProducts(productId),
  ])

  if (!product) {
    notFound()
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
