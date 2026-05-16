'use client'

/**
 * EmptyState — centered empty-state layout with icon, heading, body, and optional CTA.
 *
 * Requirements: 23.1, 23.2
 */

import React from 'react'
import { Inbox } from 'lucide-react'

interface EmptyStateProps {
  /** Custom icon node. Defaults to a generic Inbox icon (48 × 48 px). */
  icon?: React.ReactNode
  /** Primary heading text (required). */
  heading: string
  /** Secondary body text. */
  body?: string
  /** Label for the optional CTA button. */
  ctaLabel?: string
  /** Callback fired when the CTA button is clicked. */
  onCta?: () => void
}

/**
 * Renders a vertically-centred empty state:
 *   icon (48 px) → heading → body → optional CTA button
 *
 * The CTA button meets the 44 × 44 px minimum touch target (Req 23.2).
 */
export function EmptyState({
  icon,
  heading,
  body,
  ctaLabel,
  onCta,
}: EmptyStateProps) {
  return (
    <div
      className="flex flex-col items-center justify-center gap-3 px-6 py-12 text-center"
      role="status"
      aria-label={heading}
    >
      {/* Icon */}
      <div className="text-gray-400" aria-hidden="true">
        {icon ?? <Inbox size={48} strokeWidth={1.5} />}
      </div>

      {/* Heading */}
      <h2 className="text-lg font-semibold text-gray-800">{heading}</h2>

      {/* Body */}
      {body && (
        <p className="text-sm text-gray-500 max-w-xs">{body}</p>
      )}

      {/* CTA — min 44 × 44 px touch target (Req 23.2) */}
      {ctaLabel && onCta && (
        <button
          type="button"
          onClick={onCta}
          className={[
            'mt-2 inline-flex items-center justify-center',
            'min-h-[44px] min-w-[44px] px-5 py-2.5',
            'rounded-lg bg-blue-600 text-sm font-medium text-white',
            'hover:bg-blue-700 active:bg-blue-800',
            'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600',
            'transition-colors',
          ].join(' ')}
        >
          {ctaLabel}
        </button>
      )}
    </div>
  )
}
