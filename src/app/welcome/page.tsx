import type { Metadata } from 'next'
import '@/landing/styles/premium-animations.css'

// The landing page uses Three.js / WebGL / browser-only APIs that crash
// during Next.js static prerendering. Force dynamic rendering so this route
// is always served as an SSR response, never statically generated.
export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  alternates: {
    canonical: 'https://downxtown.com/welcome',
  },
}

export { default } from '@/landing/page'
