'use client'

/**
 * SearchPageWrapper — client component that lazy-loads SearchPageClient
 * with ssr:false to prevent IndexedDB access during server-side rendering.
 *
 * next/dynamic with ssr:false is only valid inside a Client Component (Next.js 15).
 * This wrapper exists solely to satisfy that constraint so the server page.tsx
 * can remain a Server Component for generateMetadata.
 */

import dynamic from 'next/dynamic'

const SearchPageClient = dynamic(
  () => import('./SearchPageClient').then((mod) => ({ default: mod.SearchPageClient })),
  {
    ssr: false,
    loading: () => null,
  },
)

export function SearchPageWrapper() {
  return <SearchPageClient />
}
