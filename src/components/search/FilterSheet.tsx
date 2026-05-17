'use client'

/**
 * FilterSheet — bottom sheet with price range, category multi-select,
 * minimum rating selector, and sort options.
 *
 * Requirements: 8.8, 8.9
 */

import React, { useEffect, useRef, useCallback } from 'react'
import { X, Star } from 'lucide-react'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type SortOption = 'relevance' | 'price_asc' | 'price_desc' | 'newest'

export interface SearchFilters {
  minPrice: string
  maxPrice: string
  /** Selected category names */
  categories: string[]
  /** Minimum star rating (1–5), or 0 for no minimum */
  minRating: number
  sort: SortOption
}

export const DEFAULT_FILTERS: SearchFilters = {
  minPrice: '',
  maxPrice: '',
  categories: [],
  minRating: 0,
  sort: 'relevance',
}

/** Returns the count of non-default active filters. */
export function countActiveFilters(filters: SearchFilters): number {
  let count = 0
  if (filters.minPrice !== '') count++
  if (filters.maxPrice !== '') count++
  if (filters.categories.length > 0) count++
  if (filters.minRating > 0) count++
  if (filters.sort !== 'relevance') count++
  return count
}

export interface FilterSheetProps {
  isOpen: boolean
  onClose: () => void
  filters: SearchFilters
  onFiltersChange: (filters: SearchFilters) => void
  /** Available category options to display as checkboxes. */
  availableCategories?: string[]
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'relevance', label: 'Relevance' },
  { value: 'price_asc', label: 'Price ↑ (Low to High)' },
  { value: 'price_desc', label: 'Price ↓ (High to Low)' },
  { value: 'newest', label: 'Newest' },
]

const RATING_OPTIONS = [1, 2, 3, 4, 5]

const DEFAULT_CATEGORIES = [
  'Fashion',
  'Footwear',
  'Cosmetics',
  'Electronics',
  'Accessories',
]

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * FilterSheet renders a bottom sheet (modal) with:
 *  - Price range: two number inputs (min / max)
 *  - Category multi-select: checkboxes
 *  - Minimum rating: radio buttons (1–5 stars)
 *  - Sort: radio buttons (Relevance, Price ↑, Price ↓, Newest)
 *
 * Accessibility: focus is trapped inside the sheet while open; Escape closes it.
 */
export function FilterSheet({
  isOpen,
  onClose,
  filters,
  onFiltersChange,
  availableCategories = DEFAULT_CATEGORIES,
}: FilterSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null)
  const firstFocusableRef = useRef<HTMLButtonElement>(null)

  // ---------------------------------------------------------------------------
  // Focus trap & keyboard handling
  // ---------------------------------------------------------------------------

  useEffect(() => {
    if (!isOpen) return

    // Focus the close button when sheet opens
    firstFocusableRef.current?.focus()

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
        return
      }

      // Basic focus trap
      if (e.key === 'Tab' && sheetRef.current) {
        const focusable = sheetRef.current.querySelectorAll<HTMLElement>(
          'button, input, [tabindex]:not([tabindex="-1"])',
        )
        const first = focusable[0]
        const last = focusable[focusable.length - 1]

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault()
          last?.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first?.focus()
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  // Prevent body scroll while sheet is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------

  const handleCategoryToggle = useCallback(
    (category: string) => {
      const next = filters.categories.includes(category)
        ? filters.categories.filter((c) => c !== category)
        : [...filters.categories, category]
      onFiltersChange({ ...filters, categories: next })
    },
    [filters, onFiltersChange],
  )

  const handleReset = useCallback(() => {
    onFiltersChange(DEFAULT_FILTERS)
  }, [onFiltersChange])

  const handleApply = useCallback(() => {
    onClose()
  }, [onClose])

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        aria-hidden="true"
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Sheet */}
      <div
        ref={sheetRef}
        role="dialog"
        aria-modal="true"
        aria-label="Search filters"
        className={[
          'fixed bottom-0 left-0 right-0 z-50',
          'bg-white rounded-t-2xl shadow-2xl',
          'max-h-[90dvh] flex flex-col',
          'animate-in slide-in-from-bottom duration-300',
        ].join(' ')}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-gray-100">
          {/* Drag handle */}
          <div
            aria-hidden="true"
            className="absolute top-2 left-1/2 -translate-x-1/2 w-10 h-1 rounded-full bg-gray-300"
          />

          <h2 className="text-base font-semibold text-gray-900">Filters</h2>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleReset}
              className="text-sm text-blue-600 font-medium hover:text-blue-700 min-h-[44px] px-2"
            >
              Reset all
            </button>
            <button
              ref={firstFocusableRef}
              type="button"
              aria-label="Close filters"
              onClick={onClose}
              className="p-2 rounded-full text-gray-500 hover:bg-gray-100 min-h-[44px] min-w-[44px] flex items-center justify-center"
            >
              <X size={18} aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6">

          {/* ── Sort ── */}
          <section aria-labelledby="sort-heading">
            <h3 id="sort-heading" className="text-sm font-semibold text-gray-700 mb-3">
              Sort by
            </h3>
            <div className="space-y-2" role="radiogroup" aria-labelledby="sort-heading">
              {SORT_OPTIONS.map((opt) => (
                <label
                  key={opt.value}
                  className="flex items-center gap-3 cursor-pointer group"
                >
                  <input
                    type="radio"
                    name="sort"
                    value={opt.value}
                    checked={filters.sort === opt.value}
                    onChange={() => onFiltersChange({ ...filters, sort: opt.value })}
                    className="w-4 h-4 accent-blue-600"
                  />
                  <span className="text-sm text-gray-700 group-hover:text-gray-900">
                    {opt.label}
                  </span>
                </label>
              ))}
            </div>
          </section>

          {/* ── Price Range ── */}
          <section aria-labelledby="price-heading">
            <h3 id="price-heading" className="text-sm font-semibold text-gray-700 mb-3">
              Price range (₹)
            </h3>
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <label htmlFor="min-price" className="sr-only">
                  Minimum price
                </label>
                <input
                  id="min-price"
                  type="number"
                  min={0}
                  placeholder="Min"
                  value={filters.minPrice}
                  onChange={(e) =>
                    onFiltersChange({ ...filters, minPrice: e.target.value })
                  }
                  className={[
                    'w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm',
                    'focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100',
                    'placeholder:text-gray-400',
                  ].join(' ')}
                />
              </div>
              <span className="text-gray-400 text-sm shrink-0">to</span>
              <div className="flex-1">
                <label htmlFor="max-price" className="sr-only">
                  Maximum price
                </label>
                <input
                  id="max-price"
                  type="number"
                  min={0}
                  placeholder="Max"
                  value={filters.maxPrice}
                  onChange={(e) =>
                    onFiltersChange({ ...filters, maxPrice: e.target.value })
                  }
                  className={[
                    'w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm',
                    'focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100',
                    'placeholder:text-gray-400',
                  ].join(' ')}
                />
              </div>
            </div>
          </section>

          {/* ── Minimum Rating ── */}
          <section aria-labelledby="rating-heading">
            <h3 id="rating-heading" className="text-sm font-semibold text-gray-700 mb-3">
              Minimum rating
            </h3>
            <div
              className="flex items-center gap-2 flex-wrap"
              role="radiogroup"
              aria-labelledby="rating-heading"
            >
              {/* "Any" option */}
              <label className="cursor-pointer">
                <input
                  type="radio"
                  name="minRating"
                  value={0}
                  checked={filters.minRating === 0}
                  onChange={() => onFiltersChange({ ...filters, minRating: 0 })}
                  className="sr-only"
                />
                <span
                  className={[
                    'inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium border transition-colors',
                    filters.minRating === 0
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300',
                  ].join(' ')}
                >
                  Any
                </span>
              </label>

              {RATING_OPTIONS.map((rating) => (
                <label key={rating} className="cursor-pointer">
                  <input
                    type="radio"
                    name="minRating"
                    value={rating}
                    checked={filters.minRating === rating}
                    onChange={() => onFiltersChange({ ...filters, minRating: rating })}
                    className="sr-only"
                  />
                  <span
                    className={[
                      'inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium border transition-colors',
                      filters.minRating === rating
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300',
                    ].join(' ')}
                  >
                    <Star
                      size={12}
                      className={filters.minRating === rating ? 'fill-white' : 'fill-amber-400 text-amber-400'}
                      aria-hidden="true"
                    />
                    {rating}+
                  </span>
                </label>
              ))}
            </div>
          </section>

          {/* ── Categories ── */}
          <section aria-labelledby="category-heading">
            <h3 id="category-heading" className="text-sm font-semibold text-gray-700 mb-3">
              Categories
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {availableCategories.map((cat) => {
                const checked = filters.categories.includes(cat)
                return (
                  <label
                    key={cat}
                    className={[
                      'flex items-center gap-2 px-3 py-2.5 rounded-lg border cursor-pointer transition-colors',
                      checked
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300',
                    ].join(' ')}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => handleCategoryToggle(cat)}
                      className="w-4 h-4 accent-blue-600 shrink-0"
                      aria-label={cat}
                    />
                    <span className="text-sm font-medium truncate">{cat}</span>
                  </label>
                )
              })}
            </div>
          </section>
        </div>

        {/* Footer — Apply button */}
        <div className="px-4 py-4 border-t border-gray-100 bg-white">
          <button
            type="button"
            onClick={handleApply}
            className={[
              'w-full flex items-center justify-center',
              'min-h-[48px] rounded-xl',
              'bg-blue-600 text-white text-sm font-semibold',
              'hover:bg-blue-700 active:bg-blue-800',
              'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600',
              'transition-colors',
            ].join(' ')}
          >
            Apply filters
          </button>
        </div>
      </div>
    </>
  )
}
