'use client'

/**
 * OrderDetailPage — full detail view for a single order item.
 *
 * Features:
 *  - Product details (image, name, variant attributes, quantity, pricing)
 *  - Status timeline (OrderTimeline component)
 *  - Tracking info with clickable URL (opens in new tab)
 *  - Delivery address
 *  - Cancel Order button with window.confirm dialog (Req 14.5, 14.6)
 *  - Request Return button that opens ReturnForm inline (Req 14.7, 14.8)
 *
 * Requirements: 14.1–14.10
 */

import React, { useState, useCallback, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  ArrowLeft,
  ExternalLink,
  MapPin,
  Package,
  Loader2,
  AlertCircle,
  X,
  RotateCcw,
} from 'lucide-react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api/apiClient'
import { ImageLoader } from '@/components/shared'
import { ShimmerCard, ErrorState } from '@/components/shared'
import { OrderTimeline } from '@/components/orders/OrderTimeline'
import { ReturnForm } from '@/components/orders/ReturnForm'
import { getStatusColor } from '@/lib/utils/orderUtils'
import { formatPrice, formatDate } from '@/lib/utils/urlBuilders'
import type { OrderItem, PaymentMethod } from '@/types/order'
import type { Address } from '@/types/user'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface OrderDetail {
  orderId: string
  orderNumber: string
  item: OrderItem
  storeName: string
  storeUsername: string
  productImageId: string
  createdAt: number
  paymentMethod: PaymentMethod
  deliveryAddress: Address
}

// ---------------------------------------------------------------------------
// Status label map
// ---------------------------------------------------------------------------

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
// Color → Tailwind classes
// ---------------------------------------------------------------------------

const STATUS_COLOR_CLASSES: Record<
  ReturnType<typeof getStatusColor>,
  { bg: string; text: string; border: string }
> = {
  green:      { bg: 'bg-green-50',  text: 'text-green-700',  border: 'border-green-200' },
  BrandColor: { bg: 'bg-blue-50',   text: 'text-blue-700',   border: 'border-blue-200'  },
  red:        { bg: 'bg-red-50',    text: 'text-red-700',    border: 'border-red-200'   },
  warning:    { bg: 'bg-amber-50',  text: 'text-amber-700',  border: 'border-amber-200' },
}

// ---------------------------------------------------------------------------
// Section card wrapper
// ---------------------------------------------------------------------------

function SectionCard({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-50">
        <h2 className="text-sm font-semibold text-gray-800">{title}</h2>
      </div>
      <div className="px-4 py-4">{children}</div>
    </section>
  )
}

// ---------------------------------------------------------------------------
// Skeleton loader
// ---------------------------------------------------------------------------

function DetailSkeleton() {
  return (
    <div className="space-y-4" aria-busy="true" aria-label="Loading order details…">
      {/* Header */}
      <div className="flex items-center gap-3 pt-4">
        <ShimmerCard width={32} height={32} className="rounded-full" />
        <ShimmerCard width="50%" height={20} />
      </div>
      {/* Product card */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-3">
        <div className="flex gap-3">
          <ShimmerCard width={80} height={80} className="rounded-xl flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <ShimmerCard width="80%" height={16} />
            <ShimmerCard width="50%" height={12} />
            <ShimmerCard width="40%" height={12} />
          </div>
        </div>
        <div className="flex justify-between pt-2 border-t border-gray-50">
          <ShimmerCard width={80} height={14} />
          <ShimmerCard width={60} height={14} />
        </div>
      </div>
      {/* Timeline card */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-3">
        <ShimmerCard width="40%" height={14} />
        {Array.from({ length: 3 }, (_, i) => (
          <div key={i} className="flex gap-3">
            <ShimmerCard width={12} height={12} className="rounded-full mt-1 flex-shrink-0" />
            <div className="space-y-1.5 flex-1">
              <ShimmerCard width="50%" height={20} className="rounded-full" />
              <ShimmerCard width="40%" height={12} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// OrderDetailPage
// ---------------------------------------------------------------------------

export default function OrderDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const queryClient = useQueryClient()

  const orderId = params.id

  // Open return form automatically if ?action=return is in the URL
  const [showReturnForm, setShowReturnForm] = useState(
    searchParams.get('action') === 'return',
  )
  const [cancelError, setCancelError] = useState<string | null>(null)
  const [cancelling, setCancelling] = useState(false)
  const [returnSuccess, setReturnSuccess] = useState(false)

  // -------------------------------------------------------------------------
  // Fetch order detail
  // -------------------------------------------------------------------------
  const {
    data: order,
    isLoading,
    error,
    refetch,
  } = useQuery<OrderDetail>({
    queryKey: ['order', orderId],
    queryFn: () => api.get<OrderDetail>(`/buyer/orders/${orderId}`),
  })

  // -------------------------------------------------------------------------
  // Cancel order (Req 14.5, 14.6)
  // -------------------------------------------------------------------------
  const handleCancelOrder = useCallback(async () => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return

    setCancelling(true)
    setCancelError(null)

    try {
      await api.post(`/buyer/orders/${orderId}/cancel`)
      // Invalidate both the detail and the list
      queryClient.invalidateQueries({ queryKey: ['order', orderId] })
      queryClient.invalidateQueries({ queryKey: ['orders'] })
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to cancel order. Please try again.'
      setCancelError(message)
    } finally {
      setCancelling(false)
    }
  }, [orderId, queryClient])

  // -------------------------------------------------------------------------
  // Return success handler
  // -------------------------------------------------------------------------
  const handleReturnSuccess = useCallback(() => {
    setShowReturnForm(false)
    setReturnSuccess(true)
    queryClient.invalidateQueries({ queryKey: ['order', orderId] })
    queryClient.invalidateQueries({ queryKey: ['orders'] })
  }, [orderId, queryClient])

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------
  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto px-4 pb-24">
        <DetailSkeleton />
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="max-w-2xl mx-auto px-4 pb-24 pt-4">
        <ErrorState
          message="Failed to load order details. Please try again."
          onRetry={() => refetch()}
        />
      </div>
    )
  }

  const { item } = order
  const colorKey = getStatusColor(item.status)
  const colorClasses = STATUS_COLOR_CLASSES[colorKey]
  const statusLabel = STATUS_LABELS[item.status] ?? item.status

  const showCancelButton = item.canBeCancelled
  const showReturnButton = item.canBeReturned && !showReturnForm && !returnSuccess

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 pb-24 space-y-4">
        {/* ---------------------------------------------------------------- */}
        {/* Top bar: back button + order number                              */}
        {/* ---------------------------------------------------------------- */}
        <div className="flex items-center gap-3 pt-4">
          <button
            type="button"
            onClick={() => router.back()}
            className={[
              'flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center',
              'bg-white border border-gray-200 text-gray-600',
              'hover:bg-gray-50 active:bg-gray-100 transition-colors',
              'focus-visible:outline focus-visible:outline-2',
              'focus-visible:outline-offset-2 focus-visible:outline-blue-600',
            ].join(' ')}
            aria-label="Go back"
          >
            <ArrowLeft size={18} aria-hidden="true" />
          </button>

          <div className="flex-1 min-w-0">
            <h1 className="text-base font-bold text-gray-900 truncate">
              {order.orderNumber}
            </h1>
            <p className="text-xs text-gray-400">{formatDate(order.createdAt)}</p>
          </div>

          {/* Status chip */}
          <span
            className={[
              'flex-shrink-0 inline-flex items-center px-2.5 py-1',
              'rounded-full text-xs font-semibold border',
              colorClasses.bg,
              colorClasses.text,
              colorClasses.border,
            ].join(' ')}
          >
            {statusLabel}
          </span>
        </div>

        {/* ---------------------------------------------------------------- */}
        {/* Product details (Req 14.1)                                       */}
        {/* ---------------------------------------------------------------- */}
        <SectionCard title="Product Details">
          <div className="flex gap-3">
            {/* Product image */}
            <div className="flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden bg-gray-100 border border-gray-100">
              <ImageLoader
                imageId={order.productImageId}
                endpoint="detail"
                alt={item.productName}
                width={80}
                height={80}
                imageContext="product"
                className="object-cover w-full h-full"
              />
            </div>

            {/* Product info */}
            <div className="flex-1 min-w-0 space-y-1">
              <p className="text-sm font-semibold text-gray-900 leading-snug">
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

              <p className="text-xs text-gray-500">Qty: {item.quantity}</p>

              {/* Store link */}
              <button
                type="button"
                onClick={() => router.push(`/store/${order.storeUsername}`)}
                className="text-xs text-blue-600 font-medium hover:underline"
                aria-label={`Visit ${order.storeName} store`}
              >
                @{order.storeUsername}
              </button>
            </div>
          </div>

          {/* Pricing breakdown */}
          <div className="mt-4 space-y-1.5 pt-3 border-t border-gray-50">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Unit Price</span>
              <span className="text-gray-900">{formatPrice(item.unitPrice)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Shipping Fee</span>
              <span className="text-gray-900">{formatPrice(item.shippingFee)}</span>
            </div>
            {item.platformFee > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Platform Fee</span>
                <span className="text-gray-900">{formatPrice(item.platformFee)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm font-bold pt-1 border-t border-gray-100">
              <span className="text-gray-900">Total</span>
              <span className="text-gray-900">{formatPrice(item.totalAmount)}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-400">Payment</span>
              <span
                className={[
                  'px-2 py-0.5 rounded-full font-medium',
                  order.paymentMethod === 'COD'
                    ? 'bg-gray-100 text-gray-600'
                    : 'bg-blue-50 text-blue-600',
                ].join(' ')}
              >
                {order.paymentMethod === 'COD' ? 'Cash on Delivery' : 'Online Payment'}
              </span>
            </div>
          </div>
        </SectionCard>

        {/* ---------------------------------------------------------------- */}
        {/* Status timeline (Req 14.2)                                       */}
        {/* ---------------------------------------------------------------- */}
        <SectionCard title="Order Timeline">
          <OrderTimeline statusHistory={item.statusHistory} />
        </SectionCard>

        {/* ---------------------------------------------------------------- */}
        {/* Tracking info (Req 14.3)                                         */}
        {/* ---------------------------------------------------------------- */}
        {item.trackingInfo && (
          <SectionCard title="Tracking Information">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Courier</span>
                <span className="text-gray-900 font-medium">
                  {item.trackingInfo.courierName}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Tracking No.</span>
                <span className="text-gray-900 font-mono text-xs">
                  {item.trackingInfo.trackingNumber}
                </span>
              </div>
              {item.trackingInfo.trackingUrl && (
                <a
                  href={item.trackingInfo.trackingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={[
                    'mt-2 flex items-center justify-center gap-2',
                    'w-full py-2.5 rounded-xl text-sm font-semibold',
                    'border border-blue-200 bg-blue-50 text-blue-700',
                    'hover:bg-blue-100 active:bg-blue-200 transition-colors',
                    'focus-visible:outline focus-visible:outline-2',
                    'focus-visible:outline-offset-2 focus-visible:outline-blue-600',
                  ].join(' ')}
                  aria-label={`Track shipment with ${item.trackingInfo.courierName} (opens in new tab)`}
                >
                  <Package size={15} aria-hidden="true" />
                  Track Shipment
                  <ExternalLink size={13} aria-hidden="true" />
                </a>
              )}
            </div>
          </SectionCard>
        )}

        {/* ---------------------------------------------------------------- */}
        {/* Delivery address (Req 14.4)                                      */}
        {/* ---------------------------------------------------------------- */}
        <SectionCard title="Delivery Address">
          <div className="flex gap-3">
            <MapPin size={16} className="text-gray-400 flex-shrink-0 mt-0.5" aria-hidden="true" />
            <div className="text-sm text-gray-700 space-y-0.5">
              {order.deliveryAddress.formattedAddress ? (
                <p>{order.deliveryAddress.formattedAddress}</p>
              ) : (
                <>
                  <p>{order.deliveryAddress.addressLine1}</p>
                  {order.deliveryAddress.addressLine2 && (
                    <p>{order.deliveryAddress.addressLine2}</p>
                  )}
                  <p>
                    {order.deliveryAddress.city}, {order.deliveryAddress.state}{' '}
                    {order.deliveryAddress.pincode}
                  </p>
                </>
              )}
            </div>
          </div>
        </SectionCard>

        {/* ---------------------------------------------------------------- */}
        {/* Cancel error                                                      */}
        {/* ---------------------------------------------------------------- */}
        {cancelError && (
          <div
            className="flex items-start gap-2 p-3 rounded-xl bg-red-50 border border-red-200"
            role="alert"
            aria-live="assertive"
          >
            <AlertCircle size={16} className="text-red-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
            <p className="text-sm text-red-700 flex-1">{cancelError}</p>
            <button
              type="button"
              onClick={() => setCancelError(null)}
              className="text-red-400 hover:text-red-600"
              aria-label="Dismiss error"
            >
              <X size={14} aria-hidden="true" />
            </button>
          </div>
        )}

        {/* ---------------------------------------------------------------- */}
        {/* Return success banner                                             */}
        {/* ---------------------------------------------------------------- */}
        {returnSuccess && (
          <div
            className="flex items-center gap-2 p-3 rounded-xl bg-green-50 border border-green-200"
            role="status"
            aria-live="polite"
          >
            <AlertCircle size={16} className="text-green-600 flex-shrink-0" aria-hidden="true" />
            <p className="text-sm text-green-700 font-medium">
              Return request submitted successfully.
            </p>
          </div>
        )}

        {/* ---------------------------------------------------------------- */}
        {/* Return form (Req 14.8)                                           */}
        {/* ---------------------------------------------------------------- */}
        {showReturnForm && (
          <SectionCard title="Request Return">
            <ReturnForm
              orderId={orderId}
              onSuccess={handleReturnSuccess}
              onCancel={() => setShowReturnForm(false)}
            />
          </SectionCard>
        )}

        {/* ---------------------------------------------------------------- */}
        {/* Action buttons: Cancel / Request Return                          */}
        {/* ---------------------------------------------------------------- */}
        {(showCancelButton || showReturnButton) && !showReturnForm && (
          <div className="flex flex-col gap-3">
            {/* Cancel Order (Req 14.5, 14.6) */}
            {showCancelButton && (
              <button
                type="button"
                onClick={handleCancelOrder}
                disabled={cancelling}
                className={[
                  'w-full py-3.5 rounded-xl text-sm font-semibold',
                  'border border-red-200 bg-red-50 text-red-700',
                  'hover:bg-red-100 active:bg-red-200 transition-colors',
                  'focus-visible:outline focus-visible:outline-2',
                  'focus-visible:outline-offset-2 focus-visible:outline-red-600',
                  'disabled:opacity-50 disabled:cursor-not-allowed',
                  'flex items-center justify-center gap-2',
                ].join(' ')}
                aria-busy={cancelling}
              >
                {cancelling ? (
                  <>
                    <Loader2 size={16} className="animate-spin" aria-hidden="true" />
                    Cancelling…
                  </>
                ) : (
                  <>
                    <X size={16} aria-hidden="true" />
                    Cancel Order
                  </>
                )}
              </button>
            )}

            {/* Request Return (Req 14.7) */}
            {showReturnButton && (
              <button
                type="button"
                onClick={() => setShowReturnForm(true)}
                className={[
                  'w-full py-3.5 rounded-xl text-sm font-semibold',
                  'border border-amber-200 bg-amber-50 text-amber-700',
                  'hover:bg-amber-100 active:bg-amber-200 transition-colors',
                  'focus-visible:outline focus-visible:outline-2',
                  'focus-visible:outline-offset-2 focus-visible:outline-amber-600',
                  'flex items-center justify-center gap-2',
                ].join(' ')}
              >
                <RotateCcw size={16} aria-hidden="true" />
                Request Return
              </button>
            )}
          </div>
        )}
      </div>
    </main>
  )
}
