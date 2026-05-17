/**
 * useGlobeAnimation Hook
 * Manages globe rotation and mouse interaction
 */

import { useEffect, useRef, useState } from 'react'

interface UseGlobeAnimationOptions {
  autoRotate?: boolean
  rotationSpeed?: number
  onInteraction?: () => void
}

export function useGlobeAnimation({
  autoRotate = true,
  rotationSpeed = 0.001,
  onInteraction,
}: UseGlobeAnimationOptions = {}) {
  const [phi, setPhi] = useState(0)
  const [theta, setTheta] = useState(0.3)
  const pointerInteracting = useRef<number | null>(null)
  const pointerInteractionMovement = useRef(0)
  const animationFrameId = useRef<number | null>(null)
  const isVisible = useRef(true)

  // Handle mouse/touch interaction
  const handlePointerDown = (e: React.PointerEvent) => {
    pointerInteracting.current = e.clientX - pointerInteractionMovement.current
    if (onInteraction) onInteraction()
  }

  const handlePointerUp = () => {
    pointerInteracting.current = null
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    if (pointerInteracting.current !== null) {
      const delta = e.clientX - pointerInteracting.current
      pointerInteractionMovement.current = delta
      setPhi(delta / 200)
    }
  }

  const handlePointerOut = () => {
    pointerInteracting.current = null
  }

  // Auto-rotation animation
  useEffect(() => {
    if (!autoRotate || !isVisible.current) return

    let lastTime = Date.now()

    const animate = () => {
      const currentTime = Date.now()
      const deltaTime = currentTime - lastTime
      lastTime = currentTime

      if (pointerInteracting.current === null) {
        setPhi((prev) => prev + rotationSpeed * deltaTime)
      }

      animationFrameId.current = requestAnimationFrame(animate)
    }

    animationFrameId.current = requestAnimationFrame(animate)

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current)
      }
    }
  }, [autoRotate, rotationSpeed])

  // Pause animation when tab is not visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      isVisible.current = !document.hidden
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])

  return {
    phi,
    theta,
    handlers: {
      onPointerDown: handlePointerDown,
      onPointerUp: handlePointerUp,
      onPointerMove: handlePointerMove,
      onPointerOut: handlePointerOut,
    },
  }
}

