"use client"

import { useEffect, useRef, useState } from "react"
import { useInView } from "react-intersection-observer"
import CountUp from "react-countup"
import { cn } from "@/landing/lib/utils"

interface AnimatedCounterProps {
  end: number
  start?: number
  duration?: number
  prefix?: string
  suffix?: string
  decimals?: number
  className?: string
}

export function AnimatedCounter({
  end,
  start = 0,
  duration = 2,
  prefix = "",
  suffix = "",
  decimals = 0,
  className,
}: AnimatedCounterProps) {
  const { ref, inView } = useInView({
    threshold: 0.3,
    triggerOnce: true,
  })

  return (
    <span ref={ref} className={cn("font-bold", className)}>
      {inView && (
        <CountUp
          start={start}
          end={end}
          duration={duration}
          decimals={decimals}
          prefix={prefix}
          suffix={suffix}
        />
      )}
    </span>
  )
}

