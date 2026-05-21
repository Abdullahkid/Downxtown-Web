/**
 * Category page configuration — single source of truth for all 5 master
 * categories. Used by generateMetadata, JSON-LD, and the page header.
 *
 * apiValue must match exactly what the backend /feed/filtered?category=X expects.
 */

export interface CategoryConfig {
  /** Value sent to the backend API (uppercase) */
  apiValue: string
  /** Human-readable label */
  label: string
  /** Local image path for the category icon */
  imageSrc: string
  /** <title> tag content (template appends "— Downxtown") */
  title: string
  /** Meta description — keyword-rich, describes the category browse experience */
  description: string
  /** H1 text on the page */
  h1: string
}

export const CATEGORY_CONFIG: Record<string, CategoryConfig> = {
  fashion: {
    apiValue: 'FASHION',
    label: 'Fashion',
    imageSrc: '/categories/fashion.webp',
    title: 'D2C Fashion Brands India',
    description:
      'Discover India\'s best D2C fashion brands on Downxtown. Shop kurtas, ethnic wear, western wear, streetwear and more from authentic Indian brands you won\'t find on Myntra or Amazon.',
    h1: 'Fashion Brands',
  },
  footwear: {
    apiValue: 'FOOTWEAR',
    label: 'Footwear',
    imageSrc: '/categories/footwear.webp',
    title: 'D2C Footwear Brands India',
    description:
      'Shop from India\'s best D2C footwear brands on Downxtown. Sneakers, sports shoes, casual wear, and more from authentic local footwear brands with direct-to-consumer pricing.',
    h1: 'Footwear Brands',
  },
  electronics: {
    apiValue: 'ELECTRONICS',
    label: 'Electronics',
    imageSrc: '/categories/electronics.webp',
    title: 'D2C Electronics Brands India',
    description:
      'Discover Indian D2C electronics brands on Downxtown. Gadgets, accessories, smart devices, and more from authentic local tech brands delivering direct to your door.',
    h1: 'Electronics Brands',
  },
  cosmetics: {
    apiValue: 'COSMETICS',
    label: 'Beauty & Cosmetics',
    imageSrc: '/categories/cosmetics.webp',
    title: 'D2C Beauty & Cosmetics Brands India',
    description:
      'Discover India\'s best D2C beauty and cosmetics brands on Downxtown. Skincare, makeup, hair care and wellness products from authentic Indian brands — clean, cruelty-free, and direct.',
    h1: 'Beauty & Cosmetics Brands',
  },
  accessories: {
    apiValue: 'ACCESSORIES',
    label: 'Accessories',
    imageSrc: '/categories/accessories.webp',
    title: 'D2C Accessories Brands India',
    description:
      'Shop from India\'s best D2C accessories brands on Downxtown. Bags, jewellery, belts, watches and more from authentic local Indian brands at direct-to-consumer prices.',
    h1: 'Accessories Brands',
  },
}

/** Slugs that are valid category routes */
export type CategorySlug = keyof typeof CATEGORY_CONFIG
