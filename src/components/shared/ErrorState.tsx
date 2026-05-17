'use client'

/**
 * ErrorState — error display with icon, message, and optional Retry button.
 *
 * Requirements: 23.1, 23.2
 */

import { AlertCircle } from 'lucide-react'

interface ErrorStateProps {
  /** Error message shown to the user. Defaults to "Something went wrong". */
  message?: string
  /** Callback fired when the Retry button is clicked. */
  onRetry?: () => void
}

/**
 * Renders an error state:
 *   AlertCircle icon (red) → message → optional Retry button
 *
 * The container has `role="alert"` so screen readers announce it immediately.
 * The Retry button meets the 44 × 44 px minimum touch target (Req 23.2).
 */
export function ErrorState({
  message = 'Something went wrong',
  onRetry,
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center justify-center gap-3 px-6 py-12 text-center"
    >
      {/* Error icon */}
      <AlertCircle
        size={48}
        strokeWidth={1.5}
        className="text-red-500"
        aria-hidden="true"
      />

      {/* Message */}
      <p className="text-sm font-medium text-gray-700 max-w-xs">{message}</p>

      {/* Retry button — min 44 × 44 px touch target (Req 23.2) */}
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className={[
            'inline-flex items-center justify-center',
            'min-h-[44px] min-w-[44px] px-5 py-2.5',
            'rounded-lg bg-brand text-sm font-medium text-white',
            'hover:bg-brand-dark active:bg-brand-dark',
            'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand',
            'transition-colors',
          ].join(' ')}
          aria-label="Retry"
        >
          Retry
        </button>
      )}
    </div>
  )
}
