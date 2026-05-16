'use client'

/**
 * OrderSummary — displays product image, title, variant attributes, quantity,
 * pricing breakdown, and totals for the checkout screen.
 *
 * Requirements: 11.1, 11.5, 11.7, 20.6
 */

import { ImageLoader } from '@/lib/image/imageLoader'
import { calculateOrderSummary } from '@/lib/utils/orderUtils'
import type { Product, ProductVariant } from '@/types/product'

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

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface OrderSummaryProps {
  product: Product
  variant: ProductVariant
  quantity: number
  /** COD fee in rupees; shown only when payment method is COD and isCodAllowed */
  codFee?: number
  /** Whether the buyer has selected COD as payment method */
  isCodSelected?: boolean
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function OrderSummary({
  product,
  variant,
  quantity,
  codFee = 0,
  isCodSelected = false,
}: OrderSummaryProps) {
  const { discountAmount, total, discountPercentage } = calculateOrderSummary({
    unitPrice: variant.sellingPrice,
    mrp: variant.mrp,
    shippingFee: product.shippingCost,
  })

  // Resolve the first image from the variant's image group
  const imageGroup = product.imageGroups.find(
    (g) => g.id === variant.imageGroupId,
  )
  const mainImageId = imageGroup?.images[0] ?? product.imageGroups[0]?.images[0]

  const effectiveCodFee = isCodSelected && product.isCodAllowed ? codFee : 0
  const grandTotal = total * quantity + effectiveCodFee

  return (
    <section aria-label="Order summary" className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      {/* Product row */}
      <div className="flex gap-4 p-4 border-b border-gray-100">
        {/* Product image */}
        <div className="flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden bg-gray-50">
          {mainImageId ? (
            <ImageLoader
              imageId={mainImageId}
              endpoint="detail"
              alt={product.name}
              imageContext="product"
              width={80}
              height={80}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gray-100 flex items-center justify-center">
              <span className="text-xs text-gray-400">No image</span>
            </div>
          )}
        </div>

        {/* Product info */}
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 leading-snug">
            {product.name}
          </h3>

          {/* Variant attributes */}
          {Object.keys(variant.attributes).length > 0 && (
            <div className="mt-1 flex flex-wrap gap-1">
              {Object.entries(variant.attributes).map(([key, value]) => (
                <span
                  key={key}
                  className="inline-flex items-center px-2 py-0.5 rounded-full bg-gray-100 text-xs text-gray-600"
                >
                  {key}: {value}
                </span>
              ))}
            </div>
          )}

          {/* Qty + price row */}
          <div className="mt-2 flex items-center justify-between">
            <span className="text-xs text-gray-500">Qty: {quantity}</span>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-gray-900">
                {formatCurrency(variant.sellingPrice)}
              </span>
              {discountAmount > 0 && (
                <span className="text-xs text-gray-400 line-through">
                  {formatCurrency(variant.mrp)}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Policies row */}
      <div className="flex flex-wrap gap-3 px-4 py-3 border-b border-gray-100 bg-gray-50">
        <PolicyBadge
          icon="🚚"
          label={`Shipping: ${formatCurrency(product.shippingCost)}`}
        />
        {product.isCodAllowed && (
          <PolicyBadge icon="💵" label="COD available" />
        )}
        {product.isReturnable ? (
          <PolicyBadge
            icon="↩️"
            label={`${product.returnWindowDays}-day returns`}
          />
        ) : (
          <PolicyBadge icon="🚫" label="Non-returnable" />
        )}
      </div>

      {/* Price breakdown */}
      <div className="px-4 py-4 space-y-2.5">
        <PriceLine
          label={`Unit price × ${quantity}`}
          value={formatCurrency(variant.sellingPrice * quantity)}
        />
        <PriceLine
          label="MRP"
          value={formatCurrency(variant.mrp * quantity)}
          valueClassName="text-gray-400 line-through"
        />
        {discountAmount > 0 && (
          <PriceLine
            label={`Discount (${discountPercentage}% off)`}
            value={`−${formatCurrency(discountAmount * quantity)}`}
            valueClassName="text-green-600 font-medium"
          />
        )}
        <PriceLine
          label="Shipping fee"
          value={
            product.shippingCost === 0
              ? 'FREE'
              : formatCurrency(product.shippingCost)
          }
          valueClassName={
            product.shippingCost === 0 ? 'text-green-600 font-medium' : undefined
          }
        />
        {effectiveCodFee > 0 && (
          <PriceLine
            label="COD fee"
            value={formatCurrency(effectiveCodFee)}
          />
        )}

        {/* Divider */}
        <div className="border-t border-gray-100 pt-2.5">
          <PriceLine
            label="Total"
            value={formatCurrency(grandTotal)}
            labelClassName="text-base font-bold text-gray-900"
            valueClassName="text-base font-bold text-gray-900"
          />
        </div>
      </div>
    </section>
  )
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function PolicyBadge({ icon, label }: { icon: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1 text-xs text-gray-600">
      <span aria-hidden="true">{icon}</span>
      {label}
    </span>
  )
}

function PriceLine({
  label,
  value,
  labelClassName,
  valueClassName,
}: {
  label: string
  value: string
  labelClassName?: string
  valueClassName?: string
}) {
  return (
    <div className="flex items-center justify-between">
      <span className={labelClassName ?? 'text-sm text-gray-600'}>{label}</span>
      <span className={valueClassName ?? 'text-sm text-gray-900'}>{value}</span>
    </div>
  )
}
