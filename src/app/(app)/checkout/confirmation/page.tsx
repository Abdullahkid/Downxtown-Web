'use client'

/**
 * Order Confirmation screen.
 *
 * Reads order details from URL search params:
 *   ?orderId=...&paymentMethod=...&totalAmount=...&transactionId=...
 *
 * On mount, replaces the current history entry with '/' so that pressing
 * the browser back button from this screen goes to the Feed, not Checkout.
 *
 * Requirements: 12.1, 12.2, 12.3, 12.4
 */

import { useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { CheckCircle, ShoppingBag, ArrowRight } from 'lucide-react'
import { formatPrice } from '@/lib/utils/urlBuilders'

// ---------------------------------------------------------------------------
// CSS keyframe animation injected once via a <style> tag
// ---------------------------------------------------------------------------
const ANIMATION_STYLES = `
@keyframes successPop {
  0%   { opacity: 0; transform: scale(0.4); }
  60%  { opacity: 1; transform: scale(1.15); }
  80%  { transform: scale(0.95); }
  100% { opacity: 1; transform: scale(1); }
}
.success-icon-animate {
  animation: successPop 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}
`

// ---------------------------------------------------------------------------
// Payment method badge
// ---------------------------------------------------------------------------
function PaymentMethodBadge({ method }: { method: string }) {
  const isOnline = method.toUpperCase() === 'ONLINE'
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold tracking-wide ${
        isOnline
          ? 'bg-blue-100 text-blue-700'
          : 'bg-amber-100 text-amber-700'
      }`}
    >
      {isOnline ? 'Online Payment' : 'Cash on Delivery'}
    </span>
  )
}

// ---------------------------------------------------------------------------
// Main page component
// ---------------------------------------------------------------------------
export default function OrderConfirmationPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const historyReplaced = useRef(false)

  // Read order details from URL search params
  const orderId = searchParams.get('orderId') ?? ''
  const paymentMethod = searchParams.get('paymentMethod') ?? ''
  const totalAmountParam = searchParams.get('totalAmount') ?? '0'
  const transactionId = searchParams.get('transactionId') ?? ''

  const totalAmount = parseInt(totalAmountParam, 10) || 0
  const isOnlinePayment = paymentMethod.toUpperCase() === 'ONLINE'

  // Req 12.4 — replace the current history entry with '/' so that pressing
  // the browser Back button from this screen goes to the Feed, not Checkout.
  // We use window.history.replaceState (not router.replace) so the user stays
  // on the confirmation page while the history entry is silently updated to '/'.
  // The net effect: Back from confirmation → Feed (not Checkout).
  useEffect(() => {
    if (historyReplaced.current) return
    historyReplaced.current = true
    // Silently replace the current history entry URL with '/' without
    // triggering a navigation. The confirmation content remains visible.
    window.history.replaceState(null, '', '/')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Req 12.2 — navigate to Order Detail
  function handleViewOrder() {
    if (orderId) {
      router.push(`/orders/${orderId}`)
    }
  }

  // Req 12.3 — navigate to Feed
  function handleContinueShopping() {
    router.push('/')
  }

  return (
    <>
      {/* Inject keyframe animation */}
      <style dangerouslySetInnerHTML={{ __html: ANIMATION_STYLES }} />

      <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

          {/* ── Success header ── */}
          <div className="flex flex-col items-center gap-4 bg-green-50 px-6 pt-10 pb-8">
            {/* Animated checkmark icon — Req 12.1 */}
            <div
              className="success-icon-animate flex items-center justify-center w-20 h-20 rounded-full bg-green-100"
              aria-hidden="true"
            >
              <CheckCircle
                className="text-green-600"
                size={48}
                strokeWidth={1.75}
              />
            </div>

            <div className="text-center">
              <h1 className="text-xl font-bold text-gray-900">
                Order Placed Successfully!
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Thank you for your purchase.
              </p>
            </div>
          </div>

          {/* ── Order details ── */}
          <div className="px-6 py-6 space-y-4">

            {/* Order number */}
            {orderId && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Order Number</span>
                <span className="text-sm font-semibold text-gray-900 font-mono">
                  #{orderId}
                </span>
              </div>
            )}

            {/* Transaction ID — shown only for online payments (Req 12.1) */}
            {isOnlinePayment && transactionId && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Transaction ID</span>
                <span className="text-sm font-semibold text-gray-900 font-mono break-all text-right max-w-[60%]">
                  {transactionId}
                </span>
              </div>
            )}

            {/* Payment method badge — Req 12.1 */}
            {paymentMethod && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Payment Method</span>
                <PaymentMethodBadge method={paymentMethod} />
              </div>
            )}

            {/* Total amount — Req 12.1 */}
            <div className="flex items-center justify-between border-t border-gray-100 pt-4">
              <span className="text-sm font-semibold text-gray-700">
                Total Paid
              </span>
              <span className="text-base font-bold text-gray-900">
                {formatPrice(totalAmount)}
              </span>
            </div>
          </div>

          {/* ── Action buttons ── */}
          <div className="px-6 pb-8 flex flex-col gap-3">
            {/* Req 12.2 — View Order */}
            <button
              onClick={handleViewOrder}
              disabled={!orderId}
              className="flex items-center justify-center gap-2 w-full rounded-xl bg-[#6C63FF] hover:bg-[#5a52d5] active:bg-[#4e47c0] disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6C63FF] focus-visible:ring-offset-2"
              aria-label="View your order details"
            >
              View Order
              <ArrowRight size={16} aria-hidden="true" />
            </button>

            {/* Req 12.3 — Continue Shopping */}
            <button
              onClick={handleContinueShopping}
              className="flex items-center justify-center gap-2 w-full rounded-xl border border-gray-200 bg-white hover:bg-gray-50 active:bg-gray-100 text-gray-700 font-semibold py-3 px-4 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2"
              aria-label="Continue shopping on the home feed"
            >
              <ShoppingBag size={16} aria-hidden="true" />
              Continue Shopping
            </button>
          </div>

        </div>
      </main>
    </>
  )
}
