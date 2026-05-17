"use client"

import { useRef } from "react"
import { useScroll, useTransform, useSpring, MotionValue } from "framer-motion"

interface UseParallaxOptions {
    /**
     * Parallax speed multiplier. 
     * Positive values move element up as you scroll down.
     * Negative values move element down as you scroll down.
     * Default: 0.5
     */
    speed?: number
    /**
     * Input range for scroll progress [start, end]
     * Default: ["start start", "end start"]
     */
    offset?: ["start start" | "start end" | "center center" | "end start" | "end end",
        "start start" | "start end" | "center center" | "end start" | "end end"]
    /**
     * Whether to use spring physics for smoother animation
     * Default: true
     */
    smooth?: boolean
    /**
     * Spring stiffness (higher = snappier)
     * Default: 100
     */
    stiffness?: number
    /**
     * Spring damping (higher = less oscillation)
     * Default: 30
     */
    damping?: number
}

interface UseParallaxReturn {
    ref: React.RefObject<HTMLDivElement | null>
    y: MotionValue<number>
    opacity?: MotionValue<number>
    scale?: MotionValue<number>
}

/**
 * Hook for creating scroll-based parallax effects
 * 
 * @example
 * ```tsx
 * const { ref, y } = useParallax({ speed: 0.5 })
 * 
 * return (
 *   <motion.div ref={ref} style={{ y }}>
 *     Content moves slower than scroll
 *   </motion.div>
 * )
 * ```
 */
export function useParallax({
    speed = 0.5,
    offset = ["start start", "end start"],
    smooth = true,
    stiffness = 100,
    damping = 30
}: UseParallaxOptions = {}): UseParallaxReturn {
    const ref = useRef<HTMLDivElement>(null)

    const { scrollYProgress } = useScroll({
        target: ref,
        offset: offset
    })

    // Calculate parallax offset based on speed
    const yRange = useTransform(
        scrollYProgress,
        [0, 1],
        [0, -200 * speed]
    )

    // Unconditionally call useSpring
    const smoothY = useSpring(yRange, { stiffness, damping })

    // Select the appropriate value
    const y = smooth ? smoothY : yRange

    return { ref, y }
}

/**
 * Advanced parallax hook with multiple transform outputs
 */
interface UseAdvancedParallaxOptions extends UseParallaxOptions {
    /** Fade in/out based on scroll position */
    fadeIn?: boolean
    /** Scale up/down based on scroll position */
    scaleRange?: [number, number]
    /** Rotate based on scroll position (in degrees) */
    rotateRange?: [number, number]
}

interface UseAdvancedParallaxReturn extends UseParallaxReturn {
    opacity: MotionValue<number>
    scale: MotionValue<number>
    rotate: MotionValue<number>
}

export function useAdvancedParallax({
    speed = 0.5,
    offset = ["start end", "end start"],
    smooth = true,
    stiffness = 100,
    damping = 30,
    fadeIn = false,
    scaleRange = [1, 1],
    rotateRange = [0, 0]
}: UseAdvancedParallaxOptions = {}): UseAdvancedParallaxReturn {
    const ref = useRef<HTMLDivElement>(null)

    const { scrollYProgress } = useScroll({
        target: ref,
        offset: offset
    })

    // Y translation
    const yRange = useTransform(scrollYProgress, [0, 1], [0, -200 * speed])
    const smoothY = useSpring(yRange, { stiffness, damping })
    const y = smooth ? smoothY : yRange

    // Opacity
    const opacityRange = useTransform(
        scrollYProgress,
        fadeIn ? [0, 0.3, 0.7, 1] : [0, 1],
        fadeIn ? [0, 1, 1, 0] : [1, 1]
    )
    const smoothOpacity = useSpring(opacityRange, { stiffness, damping })
    const opacity = smooth ? smoothOpacity : opacityRange

    // Scale
    const scaleTransform = useTransform(scrollYProgress, [0, 1], scaleRange)
    const smoothScale = useSpring(scaleTransform, { stiffness, damping })
    const scale = smooth ? smoothScale : scaleTransform

    // Rotate
    const rotateTransform = useTransform(scrollYProgress, [0, 1], rotateRange)
    const smoothRotate = useSpring(rotateTransform, { stiffness, damping })
    const rotate = smooth ? smoothRotate : rotateTransform

    return { ref, y, opacity, scale, rotate }
}
