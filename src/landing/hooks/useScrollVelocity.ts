"use client"

import { useRef, useEffect, useState } from "react"
import { useScroll, useMotionValue, useSpring, MotionValue } from "framer-motion"

interface UseScrollVelocityOptions {
    /**
     * Smoothing amount (0-1). Higher = smoother but more lag
     * Default: 0.1
     */
    smoothing?: number
    /**
     * Clamp velocity to this range [-max, max]
     * Default: 100
     */
    clamp?: number
}

interface UseScrollVelocityReturn {
    /** Current scroll velocity (pixels per frame) */
    velocity: MotionValue<number>
    /** Absolute velocity (always positive) */
    absVelocity: MotionValue<number>
    /** Direction: 1 = down, -1 = up, 0 = stopped */
    direction: MotionValue<number>
    /** Whether currently scrolling */
    isScrolling: boolean
}

/**
 * Hook to track scroll velocity for velocity-based animations
 * 
 * @example
 * ```tsx
 * const { velocity, isScrolling } = useScrollVelocity()
 * 
 * // Skew text based on scroll speed
 * const skewY = useTransform(velocity, [-100, 0, 100], [3, 0, -3])
 * 
 * return <motion.div style={{ skewY }}>Velocity-reactive content</motion.div>
 * ```
 */
export function useScrollVelocity({
    smoothing = 0.1,
    clamp = 100
}: UseScrollVelocityOptions = {}): UseScrollVelocityReturn {
    const [isScrolling, setIsScrolling] = useState(false)
    const { scrollY } = useScroll()
    const lastScrollY = useRef(0)
    const lastTime = useRef(Date.now())
    const scrollTimeout = useRef<NodeJS.Timeout>(undefined)

    const rawVelocity = useMotionValue(0)
    const velocity = useSpring(rawVelocity, { stiffness: 100, damping: 20 })
    const absVelocity = useMotionValue(0)
    const direction = useMotionValue(0)

    useEffect(() => {
        const updateVelocity = () => {
            const currentScrollY = scrollY.get()
            const currentTime = Date.now()
            const deltaTime = currentTime - lastTime.current

            if (deltaTime > 0) {
                const deltaY = currentScrollY - lastScrollY.current
                const instantVelocity = (deltaY / deltaTime) * 16 // Normalize to ~60fps

                // Apply smoothing
                const smoothedVelocity = rawVelocity.get() * (1 - smoothing) + instantVelocity * smoothing

                // Clamp velocity
                const clampedVelocity = Math.max(-clamp, Math.min(clamp, smoothedVelocity))

                rawVelocity.set(clampedVelocity)
                absVelocity.set(Math.abs(clampedVelocity))
                direction.set(deltaY > 0 ? 1 : deltaY < 0 ? -1 : 0)

                setIsScrolling(true)

                // Clear existing timeout
                if (scrollTimeout.current) {
                    clearTimeout(scrollTimeout.current)
                }

                // Set timeout to detect scroll stop
                scrollTimeout.current = setTimeout(() => {
                    setIsScrolling(false)
                    rawVelocity.set(0)
                    absVelocity.set(0)
                    direction.set(0)
                }, 150)
            }

            lastScrollY.current = currentScrollY
            lastTime.current = currentTime
        }

        const unsubscribe = scrollY.on("change", updateVelocity)

        return () => {
            unsubscribe()
            if (scrollTimeout.current) {
                clearTimeout(scrollTimeout.current)
            }
        }
    }, [scrollY, rawVelocity, absVelocity, direction, smoothing, clamp])

    return { velocity, absVelocity, direction, isScrolling }
}

/**
 * Hook for velocity-reactive transformations
 * 
 * @example
 * ```tsx
 * const { skewY, scaleX } = useVelocityTransforms()
 * return <motion.h1 style={{ skewY, scaleX }}>Dynamic Text</motion.h1>
 * ```
 */
export function useVelocityTransforms(maxVelocity = 50) {
    const { velocity } = useScrollVelocity({ clamp: maxVelocity })

    // Text skew effect
    const skewY = useSpring(
        useMotionValue(0),
        { stiffness: 200, damping: 30 }
    )

    // Horizontal stretch effect
    const scaleX = useSpring(
        useMotionValue(1),
        { stiffness: 200, damping: 30 }
    )

    useEffect(() => {
        const unsubscribe = velocity.on("change", (v) => {
            // Map velocity to skew (-3 to 3 degrees)
            const skew = (v / maxVelocity) * 3
            skewY.set(skew)

            // Map velocity to subtle horizontal stretch (0.98 to 1.02)
            const stretch = 1 + (Math.abs(v) / maxVelocity) * 0.02
            scaleX.set(stretch)
        })

        return unsubscribe
    }, [velocity, skewY, scaleX, maxVelocity])

    return { skewY, scaleX, velocity }
}
