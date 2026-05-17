"use client"

import { motion, useInView } from "framer-motion"
import { useRef, ReactNode } from "react"

interface StaggerContainerProps {
  children: ReactNode
  className?: string
  staggerDelay?: number
  once?: boolean
}

export function StaggerContainer({
  children,
  className = "",
  staggerDelay = 0.1,
  once = true
}: StaggerContainerProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once, amount: 0.2 })

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={{
        visible: {
          transition: {
            staggerChildren: staggerDelay
          }
        }
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

export const StaggerItem = motion.div

