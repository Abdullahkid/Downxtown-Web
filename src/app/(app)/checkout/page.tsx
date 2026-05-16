'use client'

/**
 * CheckoutPage — order placement screen.
 *
 * Flow:
 *  1. Read productId, variantId, quantity from URL search params
 *  2. Fetch product details + buyer profile in parallel
 *  3. Show OrderSummary, AddressDisplay/AddressForm, PaymentSelector
 *  4. On "Place Order":
 *     - Online: POST /orders → InitiatePaymentResponse → load Razorpay CDN → open modal
 *       → on success: POST /payments/verify → navigate to confirmation
 *       → on failure: show retry option
 *     - COD: POST /orders/cod → navigate to confirmation
 *  5. Log order_placed analytics event on success
 *  6. Disable "Place Order" button while isSubmitting to prevent duplicates
 *
 * Requirements: 11.1–11.14, 20.1–20.7, 22.6, 25.5
 */

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Loader2, ShoppingBag, AlertCircle, ArrowLeft } from 'lucide-react'
import { api, ApiError } from '@/lib/api/apiClient'
import { useAuthStore } from '@/store/authStore'
import { logOrderPlaced } from '@/lib/analytics/analyticsProvider'
import {
  OrderSummary,
  AddressForm,
  AddressDisplay,
  PaymentSelector,
} from '@/components/checkout'
import type { Product, ProductVariant } from '@/types/product'
import type { Address, Personal } from '@/types/user'
import type { InitiatePaymentResponse } from '@/types/checkout'
import type { PaymentMethod } from '@/components/checkout/PaymentSelector'

// ---------------------------------------------------------------------------
// Razorpay type declarations
// ---------------------------------------------------------------------------

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => RazorpayInstance
  }
}

interface RazorpayOptions {
  key: string
  amount: number
  currency: string
  order_id: string
  name: string
  prefill: { name: string; email: string }
  handler: (response: RazorpaySuccessResponse) => void
  modal: { ondismiss: () => void }
  theme?: { color: string }
}

interface RazorpayInstance {
  open: () => void
}

interface RazorpaySuccessResponse {
  razorpay_payment_id: string
  razorpay_order_id: string
  razorpay_signature: string
}

// ---------------------------------------------------------------------------
// COD fee constant (can be driven from product data if backend provides it)
// ---------------------------------------------------------------------------

const COD_FEE = 40 // ₹40 COD handling fee

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount)
}

/** Dynamically load the Razorpay checkout script (Req 20.1, 22.6) */
function loadRazorpayScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.Razorpay) {
      resolve()
      return
    }
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.async = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Failed to load Razorpay SDK'))
    document.head.appendChild(script)
  })
}

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------

export default function CheckoutPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useAuthStore()

  // URL params
  const productId = searchParams.get('productId') ?? ''
  const variantId = searchParams.get('variantId') ?? ''
  const quantityParam = parseInt(searchParams.get('quantity') ?? '1', 10)
  const quantity = isNaN(quantityParam) || quantityParam < 1 ? 1 : quantityParam

  // Data state
  const [product, setProduct] = useState<Product | null>(null)
  const [variant, setVariant] = useState<ProductVariant | null>(null)
  const [address, setAddress] = useState<Address | undefined>(user?.address)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // UI state
  const [isEditingAddress, setIsEditingAddress] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('ONLINE')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  // Razorpay retry state — holds the payment response for retry
  const [pendingPaymentResponse, setPendingPaymentResponse] =
    useState<InitiatePaymentResponse | null>(null)

  // -------------------------------------------------------------------------
  // Load product + profile
  // -------------------------------------------------------------------------
  useEffect(() => {
    if (!productId || !variantId) {
      setLoadError('Invalid checkout link. Please go back and try again.')
      setIsLoading(false)
      return
    }

    let cancelled = false

    async function load() {
      try {
        const [fetchedProduct, profile] = await Promise.all([
          api.get<Product>(`/products/${productId}`),
          api.get<Personal>('/buyer/profile'),
        ])

        if (cancelled) return

        const foundVariant = fetchedProduct.variants.find((v) => v.id === variantId)
        if (!foundVariant) {
          setLoadError('The selected product variant is no longer available.')
          setIsLoading(false)
          return
        }

        setProduct(fetchedProduct)
        setVariant(foundVariant)
        setAddress(profile.address)

        // Default to ONLINE; switch to COD only if COD is allowed and ONLINE is not preferred
        if (!fetchedProduct.isCodAllowed) {
          setPaymentMethod('ONLINE')
        }
      } catch (err) {
        if (cancelled) return
        if (err instanceof ApiError && err.status === 404) {
          setLoadError('Product not found.')
        } else {
          setLoadError('Failed to load checkout details. Please try again.')
        }
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    load()
    return () => { cancelled = true }
  }, [productId, variantId])

  // -------------------------------------------------------------------------
  // Open Razorpay modal
  // -------------------------------------------------------------------------
  const openRazorpayModal = useCallback(
    async (paymentResponse: InitiatePaymentResponse) => {
      if (!user) return

      await loadRazorpayScript()

      if (!window.Razorpay) {
        throw new Error('Razorpay SDK failed to load.')
      }

      return new Promise<void>((resolve, reject) => {
        const rzp = new window.Razorpay!({
          key: paymentResponse.razorpayKeyId,
          amount: paymentResponse.amountInPaise,
          currency: paymentResponse.currency,
          order_id: paymentResponse.razorpayOrderId,
          name: 'DownXtown',
          prefill: {
            name: user.name,
            email: user.email,
          },
          theme: { color: '#2563EB' },
          handler: async (response: RazorpaySuccessResponse) => {
            try {
              // Verify payment on server (Req 11.9, 20.3)
              await api.post('/payments/verify', {
                razorpayPaymentId: response.razorpay_payment_id,
                razorpayOrderId: response.razorpay_order_id,
                razorpaySignature: response.razorpay_signature,
              })

              // Log analytics (Req 25.5)
              await logOrderPlaced({
                order_id: response.razorpay_order_id,
                payment_method: 'ONLINE',
                total_amount: paymentResponse.amountInPaise / 100,
              })

              resolve()

              // Navigate to confirmation
              router.replace(
                `/orders/confirmation?orderId=${response.razorpay_order_id}&method=ONLINE&amount=${paymentResponse.amountInPaise / 100}`,
              )
            } catch {
              reject(new Error('Payment verification failed. Please contact support.'))
            }
          },
          modal: {
            ondismiss: () => {
              // User dismissed — allow retry (Req 11.12)
              reject(new DismissedError())
            },
          },
        })

        rzp.open()
      })
    },
    [user, router],
  )

  // -------------------------------------------------------------------------
  // Place order
  // -------------------------------------------------------------------------
  async function handlePlaceOrder() {
    if (!product || !variant || !address || isSubmitting) return

    setIsSubmitting(true)
    setSubmitError(null)
    setPendingPaymentResponse(null)

    try {
      const orderPayload = {
        productId: product.id,
        variantId: variant.id,
        quantity,
        addressId: address.id,
        paymentMethod,
      }

      if (paymentMethod === 'ONLINE') {
        // Create order → get Razorpay details (Req 11.8)
        const paymentResponse = await api.post<InitiatePaymentResponse>(
          '/orders',
          orderPayload,
        )

        try {
          await openRazorpayModal(paymentResponse)
        } catch (err) {
          if (err instanceof DismissedError) {
            // User dismissed modal — store response for retry (Req 11.12)
            setPendingPaymentResponse(paymentResponse)
            setSubmitError(
              'Payment was cancelled. You can retry using the button below.',
            )
          } else {
            setSubmitError(
              (err as Error).message || 'Payment failed. Please try again.',
            )
          }
        }
      } else {
        // COD order (Req 11.10)
        const result = await api.post<{ orderId: string; totalAmount: number }>(
          '/orders/cod',
          orderPayload,
        )

        // Log analytics (Req 25.5)
        await logOrderPlaced({
          order_id: result.orderId,
          payment_method: 'COD',
          total_amount: result.totalAmount,
        })

        // Navigate to confirmation (Req 11.11)
        router.replace(
          `/orders/confirmation?orderId=${result.orderId}&method=COD&amount=${result.totalAmount}`,
        )
      }
    } catch (err) {
      if (err instanceof ApiError) {
        setSubmitError(err.message || 'Failed to place order. Please try again.')
      } else {
        setSubmitError('An unexpected error occurred. Please try again.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  // -------------------------------------------------------------------------
  // Retry Razorpay payment (Req 11.12)
  // -------------------------------------------------------------------------
  async function handleRetryPayment() {
    if (!pendingPaymentResponse || isSubmitting) return

    setIsSubmitting(true)
    setSubmitError(null)

    try {
      await openRazorpayModal(pendingPaymentResponse)
      setPendingPaymentResponse(null)
    } catch (err) {
      if (err instanceof DismissedError) {
        setSubmitError('Payment was cancelled. You can retry using the button below.')
      } else {
        setSubmitError(
          (err as Error).message || 'Payment failed. Please try again.',
        )
        setPendingPaymentResponse(null)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  // -------------------------------------------------------------------------
  // Render: loading
  // -------------------------------------------------------------------------
  if (isLoading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3 text-gray-500">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" aria-hidden="true" />
          <p className="text-sm">Loading checkout…</p>
        </div>
      </main>
    )
  }

  // -------------------------------------------------------------------------
  // Render: error
  // -------------------------------------------------------------------------
  if (loadError || !product || !variant) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-sm w-full text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto">
            <AlertCircle className="w-8 h-8 text-red-500" aria-hidden="true" />
          </div>
          <h1 className="text-lg font-semibold text-gray-900">
            {loadError ?? 'Something went wrong'}
          </h1>
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            Go Back
          </button>
        </div>
      </main>
    )
  }

  // -------------------------------------------------------------------------
  // Render: checkout
  // -------------------------------------------------------------------------
  const canPlaceOrder =
    !isSubmitting &&
    !!address &&
    !isEditingAddress &&
    (paymentMethod === 'ONLINE' || product.isCodAllowed)

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="p-2 -ml-2 rounded-xl text-gray-600 hover:bg-gray-100 transition-colors"
          aria-label="Go back"
        >
          <ArrowLeft className="w-5 h-5" aria-hidden="true" />
        </button>
        <h1 className="text-base font-bold text-gray-900">Checkout</h1>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-5 pb-32">
        {/* Order Summary (Req 11.1, 11.7) */}
        <Section title="Order Summary">
          <OrderSummary
            product={product}
            variant={variant}
            quantity={quantity}
            codFee={COD_FEE}
            isCodSelected={paymentMethod === 'COD'}
          />
        </Section>

        {/* Delivery Address (Req 11.2, 11.3, 11.4) */}
        <Section title="Delivery Address">
          {isEditingAddress || !address ? (
            <AddressForm
              initialAddress={address}
              onSaved={(saved) => {
                setAddress(saved)
                setIsEditingAddress(false)
              }}
              onCancel={() => {
                if (address) setIsEditingAddress(false)
              }}
            />
          ) : (
            <AddressDisplay
              address={address}
              onEdit={() => setIsEditingAddress(true)}
            />
          )}

          {!address && !isEditingAddress && (
            <button
              type="button"
              onClick={() => setIsEditingAddress(true)}
              className="mt-3 w-full px-4 py-3 rounded-xl border-2 border-dashed border-gray-300 text-sm font-medium text-gray-500 hover:border-blue-400 hover:text-blue-600 transition-colors"
            >
              + Add delivery address
            </button>
          )}
        </Section>

        {/* Payment Method (Req 11.6) */}
        <Section title="Payment">
          <div className="bg-white rounded-2xl border border-gray-100 p-4">
            <PaymentSelector
              value={paymentMethod}
              onChange={setPaymentMethod}
              isCodAllowed={product.isCodAllowed}
              codFee={COD_FEE}
            />
          </div>
        </Section>

        {/* Submit error */}
        {submitError && (
          <div
            role="alert"
            className="flex items-start gap-3 p-4 bg-red-50 border border-red-100 rounded-xl"
          >
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" aria-hidden="true" />
            <p className="text-sm text-red-700">{submitError}</p>
          </div>
        )}
      </div>

      {/* Sticky bottom bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-4 py-4 safe-area-inset-bottom">
        <div className="max-w-2xl mx-auto space-y-3">
          {/* Retry payment button (Req 11.12) */}
          {pendingPaymentResponse && (
            <button
              type="button"
              onClick={handleRetryPayment}
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-blue-600 text-blue-600 text-sm font-semibold hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
              ) : null}
              Retry Payment
            </button>
          )}

          {/* Place Order button (Req 11.14) */}
          <button
            type="button"
            onClick={handlePlaceOrder}
            disabled={!canPlaceOrder}
            aria-busy={isSubmitting}
            className="w-full flex items-center justify-center gap-2 px-4 py-4 rounded-xl bg-blue-600 text-white text-base font-bold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-200"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
                <span>Processing…</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-5 h-5" aria-hidden="true" />
                <span>
                  Place Order
                  {paymentMethod === 'COD' ? ' (COD)' : ''}
                </span>
              </>
            )}
          </button>

          {!address && (
            <p className="text-center text-xs text-gray-400">
              Please add a delivery address to continue
            </p>
          )}
        </div>
      </div>
    </main>
  )
}

// ---------------------------------------------------------------------------
// Section wrapper
// ---------------------------------------------------------------------------

function Section({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <section>
      <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2.5 px-1">
        {title}
      </h2>
      {children}
    </section>
  )
}

// ---------------------------------------------------------------------------
// Custom error for Razorpay modal dismissal
// ---------------------------------------------------------------------------

class DismissedError extends Error {
  constructor() {
    super('dismissed')
    this.name = 'DismissedError'
  }
}
