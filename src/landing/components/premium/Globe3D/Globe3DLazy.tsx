"use client"

/**
 * Globe3DLazy Component
 * Lazy-loaded wrapper for Globe3D with intersection observer
 */

import { useIntersectionObserver } from '@/landing/hooks/useIntersectionObserver'
import { PremiumComponentErrorBoundary, GlobeFallback } from '../PremiumComponentErrorBoundary'
import type { Globe3DProps } from '@/types/premium-components'
import dynamic from 'next/dynamic'

// Inline GlobeSkeleton to avoid module resolution issues
const GlobeSkeleton = () => (
  <div className="flex items-center justify-center w-full h-full min-h-[400px]">
    <div className="relative">
      <div className="w-[300px] h-[300px] md:w-[400px] md:h-[400px] lg:w-[500px] lg:h-[500px] rounded-full animate-pulse bg-white/5" />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-brand-cyan/50 text-sm">Loading globe...</div>
      </div>
    </div>
  </div>
)

// Dynamically import Globe3D component
const Globe3D = dynamic(() => import('./Globe3D').then((mod) => ({ default: mod.Globe3D })), {
  loading: () => <GlobeSkeleton />,
  ssr: false,
})

export function Globe3DLazy(props: Globe3DProps) {
  const [ref, isIntersecting] = useIntersectionObserver<HTMLDivElement>({
    threshold: 0.1,
    freezeOnceVisible: true,
  })

  return (
    <div ref={ref} className="w-full h-full min-h-[400px]">
      {isIntersecting ? (
        <PremiumComponentErrorBoundary
          componentName="Globe3D"
          fallback={<GlobeFallback />}
        >
          <Globe3D {...props} />
        </PremiumComponentErrorBoundary>
      ) : (
        <GlobeSkeleton />
      )}
    </div>
  )
}

