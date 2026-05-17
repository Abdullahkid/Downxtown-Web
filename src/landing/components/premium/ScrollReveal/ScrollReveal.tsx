"use client"

import { motion, useInView, Variant } from "framer-motion"
import { useRef, ReactNode } from "react"

interface ScrollRevealProps {
  children: ReactNode
  className?: string
  direction?: "up" | "down" | "left" | "right" | "none"
  delay?: number
  duration?: number
  once?: boolean
  amount?: number
}

const directionVariants: Record<string, { hidden: Variant; visible: Variant }> = {
  up: {
    hidden: { opacity: 0, y: 75 },
    visible: { opacity: 1, y: 0 }
  },
  down: {
    hidden: { opacity: 0, y: -75 },
    visible: { opacity: 1, y: 0 }
  },
  left: {
    hidden: { opacity: 0, x: 75 },
    visible: { opacity: 1, x: 0 }
  },
  right: {
    hidden: { opacity: 0, x: -75 },
    visible: { opacity: 1, x: 0 }
  },
  none: {
    hidden: { opacity: 0 },
    visible: { opacity: 1 }
  }
}

export function ScrollReveal({
  children,
  className = "",
  direction = "up",
  delay = 0,
  duration = 0.6,
  once = true,
  amount = 0.3
}: ScrollRevealProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once, amount })

  const variants = directionVariants[direction]

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={variants}
      transition={{
        duration,
        delay,
        ease: [0.25, 0.4, 0.25, 1]
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

