'use client'

/**
 * ShimmerCard — animated shimmer placeholder for loading states.
 *
 * Requirements: 6.4, 23.1
 */

interface ShimmerCardProps {
  /** CSS value (e.g. '100%', '200px') or number treated as px. */
  width?: string | number
  /** CSS value (e.g. '120px') or number treated as px. */
  height?: string | number
  /** Additional Tailwind / CSS classes. */
  className?: string
}

/**
 * Renders an animated shimmer placeholder.
 * Uses Tailwind's `animate-pulse` with a gray background.
 * Accepts `width` and `height` as CSS strings or pixel numbers.
 */
export function ShimmerCard({ width, height, className = '' }: ShimmerCardProps) {
  const toStyle = (value: string | number | undefined): string | undefined => {
    if (value === undefined) return undefined
    return typeof value === 'number' ? `${value}px` : value
  }

  return (
    <div
      role="status"
      aria-label="Loading…"
      aria-busy="true"
      className={['animate-pulse rounded-lg bg-gray-200', className].join(' ')}
      style={{
        width: toStyle(width),
        height: toStyle(height),
      }}
    >
      {/* Screen-reader-only text */}
      <span className="sr-only">Loading…</span>
    </div>
  )
}
