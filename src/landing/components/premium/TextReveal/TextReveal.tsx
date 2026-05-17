"use client"

import { motion, useInView } from "framer-motion"
import { useRef, ReactNode } from "react"

interface TextRevealProps {
  children: ReactNode
  className?: string
  delay?: number
  as?: React.ElementType
}

export function TextReveal({
  children,
  className = "",
  delay = 0,
  as: Component = "div"
}: TextRevealProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.5 })

  const MotionComponent = motion[Component as keyof typeof motion] as any

  return (
    <MotionComponent
      ref={ref}
      initial={{ opacity: 0, y: 50, filter: "blur(10px)" }}
      animate={
        isInView
          ? { opacity: 1, y: 0, filter: "blur(0px)" }
          : { opacity: 0, y: 50, filter: "blur(10px)" }
      }
      transition={{
        duration: 0.8,
        delay,
        ease: [0.25, 0.4, 0.25, 1]
      }}
      className={className}
    >
      {children}
    </MotionComponent>
  )
}

// Word-by-word reveal
export function TextRevealWords({
  text,
  className = "",
  delay = 0
}: {
  text: string
  className?: string
  delay?: number
}) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.5 })
  const words = text.split(" ")

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      className={className}
    >
      {words.map((word, index) => (
        <motion.span
          key={index}
          variants={{
            hidden: { opacity: 0, y: 20, filter: "blur(8px)" },
            visible: { opacity: 1, y: 0, filter: "blur(0px)" }
          }}
          transition={{
            duration: 0.5,
            delay: delay + index * 0.05,
            ease: [0.25, 0.4, 0.25, 1]
          }}
          className="inline-block mr-2"
        >
          {word}
        </motion.span>
      ))}
    </motion.div>
  )
}

