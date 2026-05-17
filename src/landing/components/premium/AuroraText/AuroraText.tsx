"use client"

import React from 'react'
import { cn } from '@/landing/lib/utils'
import { useReducedMotion } from '@/landing/hooks/useReducedMotion'

interface AuroraTextProps {
  children: React.ReactNode
  colors?: string[]
  animationDuration?: number
  className?: string
  as?: 'h1' | 'h2' | 'h3' | 'p' | 'span'
}

export const AuroraText: React.FC<AuroraTextProps> = ({
  children,
  colors = ['#00FFFF', '#008080', '#FFFFFF'],
  animationDuration = 4000,
  className = '',
  as: Component = 'span',
}) => {
  const prefersReducedMotion = useReducedMotion()

  // Create gradient string from colors
  const gradientColors = colors.join(', ')

  return (
    <Component
      className={cn('aurora-text inline-block', className)}
      style={{
        backgroundImage: prefersReducedMotion
          ? `linear-gradient(90deg, ${colors[0]})`
          : `linear-gradient(90deg, ${gradientColors}, ${colors[0]})`,
        backgroundSize: prefersReducedMotion ? '100% 100%' : '200% 100%',
        animationDuration: prefersReducedMotion ? '0s' : `${animationDuration}ms`,
      }}
    >
      {children}
    </Component>
  )
}

