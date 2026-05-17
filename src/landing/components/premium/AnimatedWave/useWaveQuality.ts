/**
 * useWaveQuality Hook
 * Manages wave quality settings and FPS monitoring
 */

import { useEffect, useState, useRef } from 'react'
import { useDeviceCapabilities } from '@/landing/hooks/useDeviceCapabilities'

interface QualitySettings {
  segments: number
  targetFPS: number
}

const qualityPresets: Record<'low' | 'medium' | 'high', QualitySettings> = {
  low: { segments: 32, targetFPS: 30 },
  medium: { segments: 64, targetFPS: 30 },
  high: { segments: 128, targetFPS: 60 },
}

export function useWaveQuality(initialQuality: 'low' | 'medium' | 'high' | 'auto' = 'auto') {
  const { recommendedQuality, isMobile } = useDeviceCapabilities()
  const [quality, setQuality] = useState<'low' | 'medium' | 'high'>(
    initialQuality === 'auto' ? recommendedQuality : initialQuality
  )
  const [currentFPS, setCurrentFPS] = useState(60)
  const frameCount = useRef(0)
  const lastTime = useRef(Date.now())
  const fpsCheckInterval = useRef<NodeJS.Timeout | null>(null)

  // Get quality settings
  const settings = qualityPresets[quality]

  // Monitor FPS and auto-adjust quality
  useEffect(() => {
    if (initialQuality !== 'auto') return

    fpsCheckInterval.current = setInterval(() => {
      const now = Date.now()
      const elapsed = now - lastTime.current
      const fps = (frameCount.current / elapsed) * 1000

      setCurrentFPS(Math.round(fps))

      // Auto-downgrade quality if FPS is too low
      if (fps < 25 && quality === 'high') {
        console.log('[AnimatedWave] Downgrading to medium quality (FPS:', fps, ')')
        setQuality('medium')
      } else if (fps < 20 && quality === 'medium') {
        console.log('[AnimatedWave] Downgrading to low quality (FPS:', fps, ')')
        setQuality('low')
      }

      // Reset counters
      frameCount.current = 0
      lastTime.current = now
    }, 2000) // Check every 2 seconds

    return () => {
      if (fpsCheckInterval.current) {
        clearInterval(fpsCheckInterval.current)
      }
    }
  }, [quality, initialQuality])

  // Increment frame count
  const incrementFrame = () => {
    frameCount.current++
  }

  return {
    quality,
    settings,
    currentFPS,
    incrementFrame,
    setQuality,
  }
}

