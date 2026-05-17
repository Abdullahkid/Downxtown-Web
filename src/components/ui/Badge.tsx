import React, { ReactNode } from 'react'

export type BadgeVariant = 'default' | 'success' | 'error' | 'warning'

export interface BadgeProps {
  /** Visual style of the badge */
  variant?: BadgeVariant
  children: ReactNode
  /** Additional Tailwind classes for customization */
  className?: string
}

const variantClasses: Record<BadgeVariant, string> = {
  default: 'bg-gray-100 text-gray-800',
  // Uses --color-success via the `success` design token
  success: 'bg-success/10 text-success',
  // Uses --color-error via the `app-error` design token
  error: 'bg-app-error/10 text-app-error',
  // Uses --color-warning via the `warning` design token
  warning: 'bg-warning/10 text-warning',
}

const BASE_CLASSES =
  'inline-flex items-center justify-center px-2.5 py-0.5 rounded-chip text-sm font-medium min-h-[44px] lg:min-h-[36px]'

export function Badge({
  variant = 'default',
  children,
  className = '',
}: BadgeProps) {
  return (
    <span className={`${BASE_CLASSES} ${variantClasses[variant]} ${className}`.trim()}>
      {children}
    </span>
  )
}

export default Badge
