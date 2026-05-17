"use client"

/**
 * AnimatedWaveLazy Component
 * Lazy-loaded wrapper for AnimatedWave with proper resource management
 */

import { useEffect, useState } from 'react'
import { useIntersectionObserver } from '@/landing/hooks/useIntersectionObserver'
import { PremiumComponentErrorBoundary, WaveFallback } from '../PremiumComponentErrorBoundary'
import type { AnimatedWaveProps } from './AnimatedWave'
import dynamic from 'next/dynamic'

// Inline WaveSkeleton to avoid module resolution issues
const WaveSkeleton = () => (
  <div className="absolute inset-0 bg-gradient-to-b from-black via-brand-dark-gray to-black">
    <div className="absolute inset-0 opacity-20 animate-pulse bg-white/5" />
  </div>
)

// Dynamically import AnimatedWave component
const AnimatedWave = dynamic(
  () => import('./AnimatedWave').then((mod) => ({ default: mod.AnimatedWave })),
  {
    loading: () => <WaveSkeleton />,
    ssr: false,
  }
)

export function AnimatedWaveLazy(props: AnimatedWaveProps) {
  const [ref, isIntersecting] = useIntersectionObserver<HTMLDivElement>({
    threshold: 0,
    freezeOnceVisible: true,
  })
  const [isVisible, setIsVisible] = useState(true)

  // Pause animation when tab is not visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsVisible(!document.hidden)
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])

  return (
    <div ref={ref} className="absolute inset-0" style={{ zIndex: -1 }}>
      {isIntersecting && isVisible ? (
        <PremiumComponentErrorBoundary
          componentName="AnimatedWave"
          fallback={<WaveFallback />}
        >
          <AnimatedWave {...props} />
        </PremiumComponentErrorBoundary>
      ) : (
        <WaveSkeleton />
      )}
    </div>
  )
}

