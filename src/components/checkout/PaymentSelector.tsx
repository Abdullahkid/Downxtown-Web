'use client'

/**
 * PaymentSelector — radio group for choosing Online (Razorpay) or COD.
 *
 * - Hides COD option when isCodAllowed is false
 * - Shows COD fee in the label when COD is selected
 *
 * Requirements: 11.6, 20.6
 */

import { CreditCard, Banknote } from 'lucide-react'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type PaymentMethod = 'ONLINE' | 'COD'

export interface PaymentSelectorProps {
  value: PaymentMethod
  onChange: (method: PaymentMethod) => void
  isCodAllowed: boolean
  /** COD fee in rupees; shown in the COD option label */
  codFee?: number
}

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
// Component
// ---------------------------------------------------------------------------

export function PaymentSelector({
  value,
  onChange,
  isCodAllowed,
  codFee = 0,
}: PaymentSelectorProps) {
  return (
    <fieldset>
      <legend className="text-sm font-semibold text-gray-900 mb-3">
        Payment method
      </legend>

      <div className="space-y-2.5" role="radiogroup" aria-label="Payment method">
        {/* Online (Razorpay) */}
        <PaymentOption
          id="payment-online"
          name="payment-method"
          value="ONLINE"
          checked={value === 'ONLINE'}
          onChange={() => onChange('ONLINE')}
          icon={<CreditCard className="w-5 h-5 text-blue-600" aria-hidden="true" />}
          title="Online Payment"
          description="UPI, cards, net banking, wallets via Razorpay"
        />

        {/* COD — only shown when allowed */}
        {isCodAllowed && (
          <PaymentOption
            id="payment-cod"
            name="payment-method"
            value="COD"
            checked={value === 'COD'}
            onChange={() => onChange('COD')}
            icon={<Banknote className="w-5 h-5 text-green-600" aria-hidden="true" />}
            title="Cash on Delivery"
            description={
              codFee > 0
                ? `Pay when your order arrives · COD fee: ${formatCurrency(codFee)}`
                : 'Pay when your order arrives'
            }
          />
        )}
      </div>
    </fieldset>
  )
}

// ---------------------------------------------------------------------------
// PaymentOption — single radio card
// ---------------------------------------------------------------------------

interface PaymentOptionProps {
  id: string
  name: string
  value: string
  checked: boolean
  onChange: () => void
  icon: React.ReactNode
  title: string
  description: string
}

function PaymentOption({
  id,
  name,
  value,
  checked,
  onChange,
  icon,
  title,
  description,
}: PaymentOptionProps) {
  return (
    <label
      htmlFor={id}
      className={[
        'flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-colors',
        checked
          ? 'border-blue-500 bg-blue-50'
          : 'border-gray-200 bg-white hover:border-gray-300',
      ].join(' ')}
    >
      <input
        id={id}
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={onChange}
        className="sr-only"
        aria-describedby={`${id}-desc`}
      />

      {/* Custom radio indicator */}
      <div
        className={[
          'flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors',
          checked ? 'border-blue-500' : 'border-gray-300',
        ].join(' ')}
        aria-hidden="true"
      >
        {checked && (
          <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
        )}
      </div>

      {/* Icon */}
      <div className="flex-shrink-0">{icon}</div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900">{title}</p>
        <p id={`${id}-desc`} className="text-xs text-gray-500 mt-0.5">
          {description}
        </p>
      </div>
    </label>
  )
}
