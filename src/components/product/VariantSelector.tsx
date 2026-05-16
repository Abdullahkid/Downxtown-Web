'use client'

/**
 * VariantSelector — renders color swatches, size buttons, or dropdowns
 * derived from ProductVariant.attributes.
 *
 * - Groups variants by attribute key (color → swatches, size → buttons,
 *   others → dropdown)
 * - On selection, calls onVariantChange with the matched variant
 * - Shows "Out of Stock" badge when selected variant inventory === 0
 *
 * Requirements: 10.4, 10.5, 10.6
 */

import React, { useMemo, useState, useCallback } from 'react'
import type { ProductVariant } from '@/types/product'

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface VariantSelectorProps {
  variants: ProductVariant[]
  selectedVariant: ProductVariant | null
  onVariantChange: (variant: ProductVariant) => void
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Attribute keys that render as color swatches. */
const COLOR_KEYS = new Set(['color', 'colour'])
/** Attribute keys that render as size buttons. */
const SIZE_KEYS = new Set(['size', 'sz'])

/**
 * Returns the unique values for a given attribute key across all variants.
 */
function uniqueValues(variants: ProductVariant[], key: string): string[] {
  const seen = new Set<string>()
  const result: string[] = []
  for (const v of variants) {
    const val = v.attributes[key]
    if (val !== undefined && !seen.has(val)) {
      seen.add(val)
      result.push(val)
    }
  }
  return result
}

/**
 * Given the current selections for all attribute keys, find the matching
 * variant (or null if none matches).
 */
function findVariant(
  variants: ProductVariant[],
  selections: Record<string, string>,
): ProductVariant | null {
  return (
    variants.find((v) =>
      Object.entries(selections).every(([k, val]) => v.attributes[k] === val),
    ) ?? null
  )
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

interface ColorSwatchProps {
  color: string
  isSelected: boolean
  isOutOfStock: boolean
  onClick: () => void
}

function ColorSwatch({ color, isSelected, isOutOfStock, onClick }: ColorSwatchProps) {
  return (
    <button
      type="button"
      aria-label={`Color: ${color}${isOutOfStock ? ' (out of stock)' : ''}`}
      aria-pressed={isSelected}
      onClick={onClick}
      disabled={isOutOfStock}
      className={[
        'relative w-9 h-9 rounded-full border-2 transition-all',
        'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500',
        isSelected ? 'border-blue-600 scale-110' : 'border-gray-300 hover:border-gray-500',
        isOutOfStock ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer',
      ].join(' ')}
      style={{ backgroundColor: color.toLowerCase() }}
      title={color}
    >
      {isOutOfStock && (
        <span
          className="absolute inset-0 flex items-center justify-center"
          aria-hidden="true"
        >
          <span className="block w-full h-0.5 bg-gray-500 rotate-45 rounded" />
        </span>
      )}
    </button>
  )
}

interface SizeButtonProps {
  size: string
  isSelected: boolean
  isOutOfStock: boolean
  onClick: () => void
}

function SizeButton({ size, isSelected, isOutOfStock, onClick }: SizeButtonProps) {
  return (
    <button
      type="button"
      aria-label={`Size: ${size}${isOutOfStock ? ' (out of stock)' : ''}`}
      aria-pressed={isSelected}
      onClick={onClick}
      disabled={isOutOfStock}
      className={[
        'min-w-[44px] min-h-[44px] px-3 py-2 rounded-lg border text-sm font-medium transition-colors',
        'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500',
        isSelected
          ? 'border-blue-600 bg-blue-600 text-white'
          : 'border-gray-300 bg-white text-gray-800 hover:border-gray-500',
        isOutOfStock ? 'opacity-40 cursor-not-allowed line-through' : 'cursor-pointer',
      ].join(' ')}
    >
      {size}
    </button>
  )
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

/**
 * VariantSelector renders one control per attribute key found in the variants.
 *
 * Rendering rules:
 *  - color / colour → ColorSwatch row
 *  - size / sz      → SizeButton row
 *  - anything else  → <select> dropdown
 *
 * When the user changes a selection, we attempt to find a matching variant.
 * If found, onVariantChange is called. If not found (e.g. the combination
 * doesn't exist), we keep the current selection state but don't call back.
 */
export function VariantSelector({
  variants,
  selectedVariant,
  onVariantChange,
}: VariantSelectorProps) {
  // Collect all attribute keys in insertion order
  const attributeKeys = useMemo(() => {
    const keys: string[] = []
    const seen = new Set<string>()
    for (const v of variants) {
      for (const k of Object.keys(v.attributes)) {
        if (!seen.has(k)) {
          seen.add(k)
          keys.push(k)
        }
      }
    }
    return keys
  }, [variants])

  // Current selections — initialised from selectedVariant
  const [selections, setSelections] = useState<Record<string, string>>(() => {
    if (selectedVariant) return { ...selectedVariant.attributes }
    // Default: first value for each key
    const init: Record<string, string> = {}
    for (const key of attributeKeys) {
      const vals = uniqueValues(variants, key)
      if (vals.length > 0) init[key] = vals[0]
    }
    return init
  })

  // Keep selections in sync when selectedVariant changes externally
  React.useEffect(() => {
    if (selectedVariant) {
      setSelections({ ...selectedVariant.attributes })
    }
  }, [selectedVariant?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleSelect = useCallback(
    (key: string, value: string) => {
      const newSelections = { ...selections, [key]: value }
      setSelections(newSelections)
      const matched = findVariant(variants, newSelections)
      if (matched) {
        onVariantChange(matched)
      }
    },
    [selections, variants, onVariantChange],
  )

  if (variants.length === 0) return null

  // Determine if the currently selected variant is out of stock
  const isOutOfStock = selectedVariant ? selectedVariant.status !== 'AVAILABLE' : false

  return (
    <div className="flex flex-col gap-4">
      {/* Out of Stock badge */}
      {isOutOfStock && (
        <div
          role="status"
          aria-live="polite"
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 border border-red-200 text-red-700 text-sm font-medium w-fit"
        >
          <span className="w-2 h-2 rounded-full bg-red-500" aria-hidden="true" />
          Out of Stock
        </div>
      )}

      {attributeKeys.map((key) => {
        const values = uniqueValues(variants, key)
        const selectedValue = selections[key] ?? ''
        const isColor = COLOR_KEYS.has(key.toLowerCase())
        const isSize = SIZE_KEYS.has(key.toLowerCase())
        const label = key.charAt(0).toUpperCase() + key.slice(1)

        return (
          <div key={key} className="flex flex-col gap-2">
            {/* Attribute label */}
            <span className="text-sm font-medium text-gray-700">
              {label}
              {selectedValue && (
                <span className="ml-1 font-normal text-gray-500">: {selectedValue}</span>
              )}
            </span>

            {/* Color swatches */}
            {isColor && (
              <div
                className="flex flex-wrap gap-2"
                role="group"
                aria-label={`Select ${label}`}
              >
                {values.map((val) => {
                  const testVariant = findVariant(variants, { ...selections, [key]: val })
                  const oos = testVariant ? testVariant.status !== 'AVAILABLE' : false
                  return (
                    <ColorSwatch
                      key={val}
                      color={val}
                      isSelected={selectedValue === val}
                      isOutOfStock={oos}
                      onClick={() => handleSelect(key, val)}
                    />
                  )
                })}
              </div>
            )}

            {/* Size buttons */}
            {isSize && (
              <div
                className="flex flex-wrap gap-2"
                role="group"
                aria-label={`Select ${label}`}
              >
                {values.map((val) => {
                  const testVariant = findVariant(variants, { ...selections, [key]: val })
                  const oos = testVariant ? testVariant.status !== 'AVAILABLE' : false
                  return (
                    <SizeButton
                      key={val}
                      size={val}
                      isSelected={selectedValue === val}
                      isOutOfStock={oos}
                      onClick={() => handleSelect(key, val)}
                    />
                  )
                })}
              </div>
            )}

            {/* Dropdown for other attribute types */}
            {!isColor && !isSize && (
              <select
                id={`variant-${key}`}
                aria-label={`Select ${label}`}
                value={selectedValue}
                onChange={(e) => handleSelect(key, e.target.value)}
                className={[
                  'w-full max-w-xs min-h-[44px] px-3 py-2 rounded-lg border border-gray-300',
                  'text-sm text-gray-800 bg-white',
                  'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
                  'cursor-pointer',
                ].join(' ')}
              >
                {values.map((val) => (
                  <option key={val} value={val}>
                    {val}
                  </option>
                ))}
              </select>
            )}
          </div>
        )
      })}
    </div>
  )
}
