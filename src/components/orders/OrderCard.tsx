'use client'

/**
 * OrderCard — displays a single order in the Orders list.
 *
 * Shows: order number, color-coded ItemFulfillmentStatus chip, product image,
 * item name, store @username, total price, date, payment method, and
 * Cancel/Return action chips when eligible.
 *
 * Requirements: 13.5, 13.6, 13.7, 13.8, 13.9
 */

import React, { useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { ShoppingBag, X, RotateCcw } from 'lucide-react'
import { ImageLoader } from '@/components/shared'
import { getStatusColor } from '@/lib/utils/orderUtils'
import { formatPrice, formatDate } from '@/lib/utils/urlBuilders'
import type { OrderItem, PaymentMethod } from '@/types/order'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface OrderCardData {
  /** Server-side order / transaction ID */
  orderId: string
  /** Human-readable order number, e.g. "ORD-20240115-001" */
  orderNumber: string
  /** The single item in this order card */
  item: OrderItem
  /** Store display name */
  storeName: string
  /** Store @username for navigation */
  storeUsername: string
  /** Product main image ID */
  productImageId: string
  /** Order placement timestamp (ms) */
  createdAt: number
  /** Payment method used */
  paymentMethod: PaymentMethod
}

interface OrderCardProps {
  order: OrderCardData
  /** Called when the Cancel chip is tapped */
  onCancel?: (orderId: string) => void
  /** Called when the Return chip is tapped */
  onReturn?: (orderId: string) => void
}

// ---------------------------------------------------------------------------
// Status chip color mapping → Tailwind classes
// ---------------------------------------------------------------------------

const STATUS_COLOR_CLASSES: Record<
  ReturnType<typeof getStatusColor>,
  { bg: string; text: string; border: string }
> = {
  green:      { bg: 'bg-green-50',   text: 'text-green-700',  border: 'border-green-200' },
  BrandColor: { bg: 'bg-blue-50',    text: 'text-blue-700',   border: 'border-blue-200'  },
  red:        { bg: 'bg-red-50',     text: 'text-red-700',    border: 'border-red-200'   },
  warning:    { bg: 'bg-amber-50',   text: 'text-amber-700',  border: 'border-amber-200' },
}

/** Human-readable label for each status */
const STATUS_LABELS: Record<string, string> = {
  PENDING:           'Pending',
  CONFIRMED:         'Confirmed',
  PROCESSING:        'Processing',
  HANDED_TO_COURIER: 'Shipped',
  DELIVERED:         'Delivered',
  FAILED_DELIVERY:   'Failed Delivery',
  CUSTOMER_CANCELLED:'Cancelled',
  SELLER_CANCELLED:  'Cancelled by Seller',
  RETURNED:          'Returned',
  REFUNDED:          'Refunded',
  RETURN_REQUESTED:  'Return Requested',
  RETURN_APPROVED:   'Return Approved',
  RETURN_REJECTED:   'Return Rejected',
  REPLACEMENT_SENT:  'Replacement Sent',
}

// ---------------------------------------------------------------------------
// OrderCard
// ---------------------------------------------------------------------------

export function OrderCard({ order, onCancel, onReturn }: OrderCardProps) {
  const router = useRouter()
  const { item } = order

  const colorKey = getStatusColor(item.status)
  const colorClasses = STATUS_COLOR_CLASSES[colorKey]
  const statusLabel = STATUS_LABELS[item.status] ?? item.status

  // -------------------------------------------------------------------------
  // Navigation handlers
  // -------------------------------------------------------------------------
  const handleCardClick = useCallback(() => {
    router.push(`/orders/${order.orderId}`)
  }, [router, order.orderId])

  const handleStoreClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      router.push(`/store/${order.storeUsername}`)
    },
    [router, order.storeUsername],
  )

  const handleCancel = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      onCancel?.(order.orderId)
    },
    [onCancel, order.orderId],
  )

  const handleReturn = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      onReturn?.(order.orderId)
    },
    [onReturn, order.orderId],
  )

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------
  return (
    <article
      className={[
        'bg-white rounded-2xl border border-gray-100 shadow-sm',
        'overflow-hidden cursor-pointer',
        'hover:shadow-md active:scale-[0.99] transition-all',
        'focus-visible:outline focus-visible:outline-2',
        'focus-visible:outline-offset-2 focus-visible:outline-blue-600',
      ].join(' ')}
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && handleCardClick()}
      aria-label={`Order ${order.orderNumber}, ${statusLabel}`}
    >
      <div className="p-4 space-y-3">
        {/* ---------------------------------------------------------------- */}
        {/* Header row: order number + status chip                           */}
        {/* ---------------------------------------------------------------- */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <ShoppingBag size={14} className="text-gray-400 flex-shrink-0" aria-hidden="true" />
            <span className="text-xs font-medium text-gray-500 truncate">
              {order.orderNumber}
            </span>
          </div>

          {/* Status chip */}
          <span
            className={[
              'flex-shrink-0 inline-flex items-center px-2.5 py-0.5',
              'rounded-full text-xs font-semibold border',
              colorClasses.bg,
              colorClasses.text,
              colorClasses.border,
            ].join(' ')}
            aria-label={`Status: ${statusLabel}`}
          >
            {statusLabel}
          </span>
        </div>

        {/* ---------------------------------------------------------------- */}
        {/* Product row: image + details                                     */}
        {/* ---------------------------------------------------------------- */}
        <div className="flex gap-3">
          {/* Product image */}
          <div className="flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden bg-gray-100 border border-gray-100">
            <ImageLoader
              imageId={order.productImageId}
              endpoint="preview"
              alt={item.productName}
              width={64}
              height={64}
              imageContext="product"
              className="object-cover w-full h-full"
            />
          </div>

          {/* Product info */}
          <div className="flex-1 min-w-0 space-y-1">
            <p className="text-sm font-semibold text-gray-900 line-clamp-2 leading-snug">
              {item.productName}
            </p>

            {/* Variant attributes */}
            {Object.keys(item.variantAttributes).length > 0 && (
              <p className="text-xs text-gray-500">
                {Object.entries(item.variantAttributes)
                  .map(([k, v]) => `${k}: ${v}`)
                  .join(' · ')}
              </p>
            )}

            {/* Store @username — tappable (Req 13.7) */}
            <button
              type="button"
              onClick={handleStoreClick}
              className={[
                'text-xs text-blue-600 font-medium',
                'hover:underline focus-visible:outline focus-visible:outline-2',
                'focus-visible:outline-offset-1 focus-visible:outline-blue-600',
              ].join(' ')}
              aria-label={`Visit ${order.storeName} store`}
            >
              @{order.storeUsername}
            </button>
          </div>
        </div>

        {/* ---------------------------------------------------------------- */}
        {/* Footer row: price, date, payment method                          */}
        {/* ---------------------------------------------------------------- */}
        <div className="flex items-center justify-between gap-2 pt-1 border-t border-gray-50">
          <div className="flex items-center gap-3">
            <span className="text-sm font-bold text-gray-900">
              {formatPrice(item.totalAmount)}
            </span>
            <span
              className={[
                'text-xs px-2 py-0.5 rounded-full font-medium',
                order.paymentMethod === 'COD'
                  ? 'bg-gray-100 text-gray-600'
                  : 'bg-blue-50 text-blue-600',
              ].join(' ')}
            >
              {order.paymentMethod === 'COD' ? 'COD' : 'Online'}
            </span>
          </div>
          <span className="text-xs text-gray-400">{formatDate(order.createdAt)}</span>
        </div>

        {/* ---------------------------------------------------------------- */}
        {/* Action chips: Cancel / Return (Req 13.8, 13.9)                  */}
        {/* ---------------------------------------------------------------- */}
        {(item.canBeCancelled || item.canBeReturned) && (
          <div className="flex gap-2 pt-1">
            {item.canBeCancelled && (
              <button
                type="button"
                onClick={handleCancel}
                className={[
                  'inline-flex items-center gap-1.5',
                  'px-3 py-1.5 rounded-full text-xs font-semibold',
                  'border border-red-200 bg-red-50 text-red-700',
                  'hover:bg-red-100 active:bg-red-200 transition-colors',
                  'focus-visible:outline focus-visible:outline-2',
                  'focus-visible:outline-offset-2 focus-visible:outline-red-600',
                  'min-h-[32px]',
                ].join(' ')}
                aria-label={`Cancel order ${order.orderNumber}`}
              >
                <X size={12} aria-hidden="true" />
                Cancel
              </button>
            )}

            {item.canBeReturned && (
              <button
                type="button"
                onClick={handleReturn}
                className={[
                  'inline-flex items-center gap-1.5',
                  'px-3 py-1.5 rounded-full text-xs font-semibold',
                  'border border-amber-200 bg-amber-50 text-amber-700',
                  'hover:bg-amber-100 active:bg-amber-200 transition-colors',
                  'focus-visible:outline focus-visible:outline-2',
                  'focus-visible:outline-offset-2 focus-visible:outline-amber-600',
                  'min-h-[32px]',
                ].join(' ')}
                aria-label={`Return order ${order.orderNumber}`}
              >
                <RotateCcw size={12} aria-hidden="true" />
                Return
              </button>
            )}
          </div>
        )}
      </div>
    </article>
  )
}
