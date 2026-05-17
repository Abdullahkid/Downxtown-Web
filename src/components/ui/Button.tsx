import React from 'react'
import { Loader2 } from 'lucide-react'

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'destructive'
export type ButtonSize = 'sm' | 'md' | 'lg'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
  children: React.ReactNode
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:     'bg-brand text-white hover:bg-brand-dark active:bg-brand-dark focus:ring-brand',
  secondary:   'border border-brand text-brand bg-transparent hover:bg-brand/10 active:bg-brand/20 focus:ring-brand',
  ghost:       'text-brand bg-transparent hover:bg-brand/10 active:bg-brand/20 focus:ring-brand',
  destructive: 'bg-app-error text-white hover:bg-red-700 active:bg-red-800 focus:ring-app-error',
}

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'text-sm px-3 py-1.5',
  md: 'text-base px-4 py-2',
  lg: 'text-lg px-6 py-3',
}

const BASE_CLASSES =
  'inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-colors ' +
  'focus:outline-none focus:ring-2 focus:ring-offset-2 ' +
  'min-h-[44px] min-w-[44px]'

const DISABLED_CLASSES = 'opacity-50 pointer-events-none cursor-not-allowed'

/**
 * Shared Button UI primitive.
 *
 * - Supports four variants: primary, secondary, ghost, destructive
 * - Supports three sizes: sm, md, lg
 * - `disabled` applies opacity-50 + pointer-events-none and suppresses onClick
 * - `loading` shows an animated Loader2 spinner and sets aria-busy="true"
 * - Base classes enforce min-h-[44px] min-w-[44px] for touch-target compliance (Req 7.4)
 */
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      disabled = false,
      children,
      className = '',
      onClick,
      ...rest
    },
    ref,
  ) => {
    const isDisabled = disabled || loading

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (isDisabled) return
      onClick?.(e)
    }

    const composedClassName = [
      BASE_CLASSES,
      variantClasses[variant],
      sizeClasses[size],
      isDisabled ? DISABLED_CLASSES : '',
      className,
    ]
      .filter(Boolean)
      .join(' ')

    return (
      <button
        ref={ref}
        type="button"
        {...rest}
        disabled={isDisabled}
        aria-busy={loading ? 'true' : undefined}
        className={composedClassName}
        onClick={handleClick}
      >
        {loading && (
          <Loader2
            className="animate-spin"
            size={16}
            aria-hidden="true"
          />
        )}
        {children}
      </button>
    )
  },
)

Button.displayName = 'Button'
