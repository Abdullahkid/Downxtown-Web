'use client'

/**
 * OrderTimeline — chronological list of ItemStatusChange entries.
 *
 * Displays each status change with a color-coded chip, formatted timestamp,
 * and optional note. Entries are sorted ascending by timestamp so the oldest
 * event appears at the top and the most recent at the bottom.
 *
 * Requirements: 14.2
 */

import React from 'react'
import { getStatusColor } from '@/lib/utils/orderUtils'
import { formatDate } from '@/lib/utils/urlBuilders'
import type { ItemStatusChange } from '@/types/order'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface OrderTimelineProps {
  statusHistory: ItemStatusChange[]
}

// ---------------------------------------------------------------------------
// Status label map
// ---------------------------------------------------------------------------

const STATUS_LABELS: Record<string, string> = {
  PENDING:           'Order Placed',
  CONFIRMED:         'Order Confirmed',
  PROCESSING:        'Processing',
  HANDED_TO_COURIER: 'Shipped',
  DELIVERED:         'Delivered',
  FAILED_DELIVERY:   'Delivery Failed',
  CUSTOMER_CANCELLED:'Cancelled by You',
  SELLER_CANCELLED:  'Cancelled by Seller',
  RETURNED:          'Returned',
  REFUNDED:          'Refunded',
  RETURN_REQUESTED:  'Return Requested',
  RETURN_APPROVED:   'Return Approved',
  RETURN_REJECTED:   'Return Rejected',
  REPLACEMENT_SENT:  'Replacement Sent',
}

// ---------------------------------------------------------------------------
// Color → Tailwind classes
// ---------------------------------------------------------------------------

const COLOR_CLASSES: Record<
  ReturnType<typeof getStatusColor>,
  { dot: string; chip: string; text: string; border: string }
> = {
  green:      { dot: 'bg-green-500',  chip: 'bg-green-50',  text: 'text-green-700',  border: 'border-green-200' },
  BrandColor: { dot: 'bg-blue-500',   chip: 'bg-blue-50',   text: 'text-blue-700',   border: 'border-blue-200'  },
  red:        { dot: 'bg-red-500',    chip: 'bg-red-50',    text: 'text-red-700',    border: 'border-red-200'   },
  warning:    { dot: 'bg-amber-500',  chip: 'bg-amber-50',  text: 'text-amber-700',  border: 'border-amber-200' },
}

// ---------------------------------------------------------------------------
// Timestamp formatter — includes time
// ---------------------------------------------------------------------------

function formatTimestamp(ms: number): string {
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(new Date(ms))
}

// ---------------------------------------------------------------------------
// OrderTimeline
// ---------------------------------------------------------------------------

export function OrderTimeline({ statusHistory }: OrderTimelineProps) {
  if (statusHistory.length === 0) {
    return (
      <p className="text-sm text-gray-400 italic py-2">No status history available.</p>
    )
  }

  // Sort ascending by timestamp (oldest first)
  const sorted = [...statusHistory].sort((a, b) => a.timestamp - b.timestamp)

  return (
    <ol
      className="relative space-y-0"
      aria-label="Order status timeline"
    >
      {sorted.map((entry, index) => {
        const colorKey = getStatusColor(entry.status)
        const colors = COLOR_CLASSES[colorKey]
        const label = STATUS_LABELS[entry.status] ?? entry.status
        const isLast = index === sorted.length - 1

        return (
          <li key={`${entry.status}-${entry.timestamp}`} className="flex gap-4">
            {/* ------------------------------------------------------------ */}
            {/* Timeline spine: dot + vertical line                          */}
            {/* ------------------------------------------------------------ */}
            <div className="flex flex-col items-center">
              {/* Dot */}
              <div
                className={[
                  'flex-shrink-0 w-3 h-3 rounded-full mt-1.5 ring-2 ring-white',
                  colors.dot,
                ].join(' ')}
                aria-hidden="true"
              />
              {/* Vertical connector line (hidden for last item) */}
              {!isLast && (
                <div className="w-px flex-1 bg-gray-200 mt-1 mb-1" aria-hidden="true" />
              )}
            </div>

            {/* ------------------------------------------------------------ */}
            {/* Content                                                       */}
            {/* ------------------------------------------------------------ */}
            <div className={['pb-5', isLast ? '' : ''].join(' ')}>
              {/* Status chip */}
              <span
                className={[
                  'inline-flex items-center px-2.5 py-0.5 rounded-full',
                  'text-xs font-semibold border',
                  colors.chip,
                  colors.text,
                  colors.border,
                ].join(' ')}
              >
                {label}
              </span>

              {/* Timestamp */}
              <p className="mt-1 text-xs text-gray-400">
                {formatTimestamp(entry.timestamp)}
              </p>

              {/* Optional note */}
              {entry.note && (
                <p className="mt-1 text-xs text-gray-600 leading-relaxed">
                  {entry.note}
                </p>
              )}
            </div>
          </li>
        )
      })}
    </ol>
  )
}
