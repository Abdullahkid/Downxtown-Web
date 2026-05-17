'use client'

/**
 * FilterPanel — persistent sidebar filter panel for desktop (≥ lg) viewports.
 *
 * Renders the same filter controls as FilterSheet (sort, price range, rating,
 * categories) but in a sidebar layout without modal chrome (no backdrop,
 * no close button, no bottom sheet animation).
 *
 * Requirements: 10.2, 10.3
 */

import React, { useCallback } from 'react'
import { Star } from 'lucide-react'
import {
  DEFAULT_FILTERS,
  countActiveFilters,
  type SearchFilters,
  type SortOption,
} from './FilterSheet'

// ---------------------------------------------------------------------------
// Constants (mirrored from FilterSheet)
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
// Props
// ---------------------------------------------------------------------------

export interface FilterPanelProps {
  filters: SearchFilters
  onFiltersChange: (filters: SearchFilters) => void
  /** Available category options to display as checkboxes. */
  availableCategories?: string[]
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * FilterPanel renders filter controls in a sidebar layout suitable for
 * desktop viewports. It is always visible (not a modal) and updates filters
 * immediately on change, matching the FilterSheet behaviour.
 */
export function FilterPanel({
  filters,
  onFiltersChange,
  availableCategories = DEFAULT_CATEGORIES,
}: FilterPanelProps) {
  const activeCount = countActiveFilters(filters)

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

  return (
    <div className="py-4 space-y-6">
      {/* ── Header ── */}
      <div className="flex items-center justify-between px-4">
        <h2 className="text-sm font-semibold text-gray-900">
          Filters
          {activeCount > 0 && (
            <span className="ml-2 inline-flex items-center justify-center w-5 h-5 rounded-full bg-brand text-white text-xs font-bold">
              {activeCount}
            </span>
          )}
        </h2>
        {activeCount > 0 && (
          <button
            type="button"
            onClick={handleReset}
            className="text-xs text-brand font-medium hover:text-brand-dark transition-colors min-h-[32px] px-1"
          >
            Reset all
          </button>
        )}
      </div>

      {/* ── Sort ── */}
      <section aria-labelledby="panel-sort-heading" className="px-4">
        <h3 id="panel-sort-heading" className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
          Sort by
        </h3>
        <div className="space-y-2" role="radiogroup" aria-labelledby="panel-sort-heading">
          {SORT_OPTIONS.map((opt) => (
            <label
              key={opt.value}
              className="flex items-center gap-3 cursor-pointer group"
            >
              <input
                type="radio"
                name="panel-sort"
                value={opt.value}
                checked={filters.sort === opt.value}
                onChange={() => onFiltersChange({ ...filters, sort: opt.value })}
                className="w-4 h-4 accent-brand"
              />
              <span className="text-sm text-gray-700 group-hover:text-gray-900">
                {opt.label}
              </span>
            </label>
          ))}
        </div>
      </section>

      {/* ── Price Range ── */}
      <section aria-labelledby="panel-price-heading" className="px-4">
        <h3 id="panel-price-heading" className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
          Price range (₹)
        </h3>
        <div className="flex items-center gap-2">
          <div className="flex-1">
            <label htmlFor="panel-min-price" className="sr-only">
              Minimum price
            </label>
            <input
              id="panel-min-price"
              type="number"
              min={0}
              placeholder="Min"
              value={filters.minPrice}
              onChange={(e) =>
                onFiltersChange({ ...filters, minPrice: e.target.value })
              }
              className={[
                'w-full px-3 py-2 rounded-lg border border-gray-200 text-sm',
                'focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20',
                'placeholder:text-gray-400',
              ].join(' ')}
            />
          </div>
          <span className="text-gray-400 text-xs shrink-0">to</span>
          <div className="flex-1">
            <label htmlFor="panel-max-price" className="sr-only">
              Maximum price
            </label>
            <input
              id="panel-max-price"
              type="number"
              min={0}
              placeholder="Max"
              value={filters.maxPrice}
              onChange={(e) =>
                onFiltersChange({ ...filters, maxPrice: e.target.value })
              }
              className={[
                'w-full px-3 py-2 rounded-lg border border-gray-200 text-sm',
                'focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20',
                'placeholder:text-gray-400',
              ].join(' ')}
            />
          </div>
        </div>
      </section>

      {/* ── Minimum Rating ── */}
      <section aria-labelledby="panel-rating-heading" className="px-4">
        <h3 id="panel-rating-heading" className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
          Minimum rating
        </h3>
        <div
          className="flex flex-wrap gap-2"
          role="radiogroup"
          aria-labelledby="panel-rating-heading"
        >
          {/* "Any" option */}
          <label className="cursor-pointer">
            <input
              type="radio"
              name="panel-minRating"
              value={0}
              checked={filters.minRating === 0}
              onChange={() => onFiltersChange({ ...filters, minRating: 0 })}
              className="sr-only"
            />
            <span
              className={[
                'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border transition-colors',
                filters.minRating === 0
                  ? 'bg-brand text-white border-brand'
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
                name="panel-minRating"
                value={rating}
                checked={filters.minRating === rating}
                onChange={() => onFiltersChange({ ...filters, minRating: rating })}
                className="sr-only"
              />
              <span
                className={[
                  'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border transition-colors',
                  filters.minRating === rating
                    ? 'bg-brand text-white border-brand'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300',
                ].join(' ')}
              >
                <Star
                  size={10}
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
      <section aria-labelledby="panel-category-heading" className="px-4">
        <h3 id="panel-category-heading" className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
          Categories
        </h3>
        <div className="space-y-1.5">
          {availableCategories.map((cat) => {
            const checked = filters.categories.includes(cat)
            return (
              <label
                key={cat}
                className={[
                  'flex items-center gap-2.5 px-3 py-2 rounded-lg border cursor-pointer transition-colors',
                  checked
                    ? 'border-brand bg-brand/5 text-brand'
                    : 'border-transparent bg-transparent text-gray-700 hover:bg-gray-50',
                ].join(' ')}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => handleCategoryToggle(cat)}
                  className="w-3.5 h-3.5 accent-brand shrink-0"
                  aria-label={cat}
                />
                <span className="text-sm font-medium truncate">{cat}</span>
              </label>
            )
          })}
        </div>
      </section>
    </div>
  )
}
