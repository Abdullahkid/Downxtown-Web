'use client'

/**
 * SearchPage — Browse mode (category sidebar) and Search mode (results).
 *
 * URL params: q, category, sort, minPrice, maxPrice, minRating
 *
 * Requirements: 8.1–8.14, 25.4
 */

import React, { Suspense,  useState, useCallback, useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import {
  Search,
  Smartphone,
  Shirt,
  Sparkles,
  Footprints,
  Clock,
  X,
  TrendingUp,
} from 'lucide-react'
import { SearchBar } from '@/components/search/SearchBar'
import { FilterSheet, DEFAULT_FILTERS, countActiveFilters } from '@/components/search/FilterSheet'
import { FilterPanel } from '@/components/search/FilterPanel'
import { SearchResults } from '@/components/search/SearchResults'
import type { SearchFilters } from '@/components/search/FilterSheet'
import { cacheStore } from '@/lib/cache/cacheStore'
import { logSearchQuery } from '@/lib/analytics/analyticsProvider'
import { api } from '@/lib/api/apiClient'

// ---------------------------------------------------------------------------
// Category definitions for Browse mode
// ---------------------------------------------------------------------------

interface CategoryItem {
  name: string
  icon: React.ReactNode
  slug: string
}

const CATEGORIES: CategoryItem[] = [
  { name: 'Fashion',     icon: <Shirt size={24} aria-hidden="true" />,      slug: 'fashion' },
  { name: 'Footwear',   icon: <Footprints size={24} aria-hidden="true" />, slug: 'footwear' },
  { name: 'Cosmetics',  icon: <Sparkles size={24} aria-hidden="true" />,   slug: 'cosmetics' },
  { name: 'Electronics',icon: <Smartphone size={24} aria-hidden="true" />, slug: 'electronics' },
  { name: 'Accessories',icon: <Sparkles size={24} aria-hidden="true" />,   slug: 'accessories' },
]

// ---------------------------------------------------------------------------
// Trending searches API response type
// ---------------------------------------------------------------------------

interface TrendingSearchesResponse {
  queries: string[]
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function filtersFromParams(params: URLSearchParams): SearchFilters {
  return {
    minPrice: params.get('minPrice') ?? '',
    maxPrice: params.get('maxPrice') ?? '',
    categories: params.get('categories')
      ? (params.get('categories') as string).split(',').filter(Boolean)
      : [],
    minRating: Number(params.get('minRating') ?? 0),
    sort: (params.get('sort') as SearchFilters['sort']) ?? 'relevance',
  }
}

function filtersToParams(filters: SearchFilters): Record<string, string> {
  const out: Record<string, string> = {}
  if (filters.minPrice) out.minPrice = filters.minPrice
  if (filters.maxPrice) out.maxPrice = filters.maxPrice
  if (filters.categories.length > 0) out.categories = filters.categories.join(',')
  if (filters.minRating > 0) out.minRating = String(filters.minRating)
  if (filters.sort !== 'relevance') out.sort = filters.sort
  return out
}

// ---------------------------------------------------------------------------
// AutoComplete dropdown
// ---------------------------------------------------------------------------

interface AutoCompleteProps {
  history: string[]
  trending: string[]
  onSelect: (query: string) => void
  onClearHistory: () => void
  inputValue: string
}

function AutoCompleteDropdown({
  history,
  trending,
  onSelect,
  onClearHistory,
  inputValue,
}: AutoCompleteProps) {
  // When there's text, filter history to matching items
  const filteredHistory = inputValue.trim()
    ? history.filter((q) =>
        q.toLowerCase().includes(inputValue.toLowerCase()),
      )
    : history.slice(0, 10) // Req 8.10 — show 10 most recent

  const showHistory = filteredHistory.length > 0
  const showTrending = !inputValue.trim() && trending.length > 0

  if (!showHistory && !showTrending) return null

  return (
    <div
      role="listbox"
      aria-label="Search suggestions"
      className={[
        'absolute top-full left-0 right-0 z-30 mt-1',
        'bg-white rounded-xl border border-gray-200 shadow-lg',
        'overflow-hidden',
      ].join(' ')}
    >
      {/* Search history */}
      {showHistory && (
        <div>
          <div className="flex items-center justify-between px-4 py-2 border-b border-gray-100">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Recent
            </span>
            <button
              type="button"
              onClick={onClearHistory}
              className="text-xs text-blue-600 hover:text-blue-700 font-medium min-h-[32px] px-1"
              aria-label="Clear search history"
            >
              Clear
            </button>
          </div>
          {filteredHistory.map((query) => (
            <button
              key={query}
              type="button"
              role="option"
              aria-selected={false}
              onClick={() => onSelect(query)}
              className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors"
            >
              <Clock size={14} className="text-gray-400 shrink-0" aria-hidden="true" />
              <span className="text-sm text-gray-700 truncate">{query}</span>
            </button>
          ))}
        </div>
      )}

      {/* Trending searches */}
      {showTrending && (
        <div>
          <div className="px-4 py-2 border-b border-gray-100">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Trending
            </span>
          </div>
          {trending.slice(0, 5).map((query) => (
            <button
              key={query}
              type="button"
              role="option"
              aria-selected={false}
              onClick={() => onSelect(query)}
              className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors"
            >
              <TrendingUp size={14} className="text-blue-400 shrink-0" aria-hidden="true" />
              <span className="text-sm text-gray-700 truncate">{query}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Browse mode — category grid
// ---------------------------------------------------------------------------

interface BrowseModeProps {
  onCategorySelect: (category: string) => void
}

function BrowseMode({ onCategorySelect }: BrowseModeProps) {
  return (
    <div className="px-4 py-4">
      <h2 className="text-base font-semibold text-gray-900 mb-4">Browse by category</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.slug}
            type="button"
            onClick={() => onCategorySelect(cat.name)}
            className={[
              'flex flex-col items-center justify-center gap-2',
              'p-4 rounded-xl border border-gray-100 bg-white',
              'hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600',
              'active:scale-95 transition-all duration-150',
              'min-h-[88px] text-gray-600',
              'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500',
            ].join(' ')}
            aria-label={`Browse ${cat.name}`}
          >
            {cat.icon}
            <span className="text-xs font-medium text-center leading-tight">{cat.name}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// SearchPage
// ---------------------------------------------------------------------------

/**
 * SearchPage supports two modes:
 *  - Browse mode: shown when there is no active query — displays category grid
 *  - Search mode: shown when a query is active — displays SearchResults
 *
 * URL params are the source of truth for query and filters so that the page
 * is deep-linkable and the browser back button works correctly (Req 1.6, 1.7).
 */
function SearchPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  // ── Derive state from URL ──────────────────────────────────────────────────
  const urlQuery = searchParams.get('q') ?? ''
  const urlFilters = filtersFromParams(searchParams)

  // ── Local UI state ─────────────────────────────────────────────────────────
  const [inputValue, setInputValue] = useState(urlQuery)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [searchHistory, setSearchHistory] = useState<string[]>([])
  const [resultCount, setResultCount] = useState(0)

  const searchBarContainerRef = useRef<HTMLDivElement>(null)

  // ── Sync input with URL query on navigation ────────────────────────────────
  useEffect(() => {
    setInputValue(urlQuery)
  }, [urlQuery])

  // ── Load search history from cache ────────────────────────────────────────
  useEffect(() => {
    cacheStore.getSearchHistory().then(setSearchHistory).catch(() => {})
  }, [])

  // ── Trending searches from server ─────────────────────────────────────────
  const { data: trendingData } = useQuery<TrendingSearchesResponse>({
    queryKey: ['trending-searches'],
    queryFn: () =>
      api.get<TrendingSearchesResponse>('/search/trending', { auth: false }),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false,
  })
  const trendingSearches = trendingData?.queries ?? []

  // ── Close suggestions on outside click ────────────────────────────────────
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (
        searchBarContainerRef.current &&
        !searchBarContainerRef.current.contains(e.target as Node)
      ) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  // ── Navigation helpers ─────────────────────────────────────────────────────

  /** Push a new URL with the given query and current filters. */
  const navigateToSearch = useCallback(
    (query: string, filters: SearchFilters = urlFilters) => {
      const params = new URLSearchParams()
      if (query) params.set('q', query)
      const filterParams = filtersToParams(filters)
      Object.entries(filterParams).forEach(([k, v]) => params.set(k, v))
      router.push(`/search?${params.toString()}`)
    },
    [router, urlFilters],
  )

  // ── Submit handler ─────────────────────────────────────────────────────────

  const handleSubmit = useCallback(
    async (query: string) => {
      const trimmed = query.trim()
      if (!trimmed) return

      setShowSuggestions(false)

      // Persist to cache (Req 8.10)
      await cacheStore.addSearchQuery(trimmed)
      const updated = await cacheStore.getSearchHistory()
      setSearchHistory(updated)

      navigateToSearch(trimmed)
    },
    [navigateToSearch],
  )

  // ── Debounced change — used for auto-complete only (not for API search) ────
  const handleDebouncedChange = useCallback((_debouncedValue: string) => {
    // Auto-complete suggestions update reactively via inputValue state.
    // Actual search is only triggered on explicit submit (Enter / voice / suggestion tap).
  }, [])

  // ── Filter change ──────────────────────────────────────────────────────────

  const handleFiltersChange = useCallback(
    (newFilters: SearchFilters) => {
      if (urlQuery) {
        navigateToSearch(urlQuery, newFilters)
      }
    },
    [urlQuery, navigateToSearch],
  )

  // ── Suggestion select (Req 8.11) ───────────────────────────────────────────

  const handleSuggestionSelect = useCallback(
    (query: string) => {
      setInputValue(query)
      setShowSuggestions(false)
      handleSubmit(query)
    },
    [handleSubmit],
  )

  // ── Clear history (Req 8.12) ───────────────────────────────────────────────

  const handleClearHistory = useCallback(async () => {
    await cacheStore.clearSearchHistory()
    setSearchHistory([])
  }, [])

  // ── Analytics: log after results load (Req 25.4) ──────────────────────────

  const handleResultCountChange = useCallback(
    (count: number) => {
      setResultCount(count)
      if (urlQuery) {
        logSearchQuery({ query: urlQuery, result_count: count })
      }
    },
    [urlQuery],
  )

  // ── Category select from Browse mode ──────────────────────────────────────

  const handleCategorySelect = useCallback(
    (category: string) => {
      const newFilters: SearchFilters = {
        ...DEFAULT_FILTERS,
        categories: [category],
      }
      navigateToSearch(category, newFilters)
    },
    [navigateToSearch],
  )

  // ── Active filter count ────────────────────────────────────────────────────

  const activeFilterCount = countActiveFilters(urlFilters)

  // ── Render ─────────────────────────────────────────────────────────────────

  const isSearchMode = urlQuery.trim().length > 0

  return (
    <main className="min-h-screen bg-gray-50">
      {/* ── Sticky search header ── */}
      <header className="sticky top-0 z-20 bg-white border-b border-gray-100 shadow-sm">
        <div className="px-4 py-3 lg:max-w-none">
          <div ref={searchBarContainerRef} className="relative max-w-2xl mx-auto lg:mx-0">
            <SearchBar
              value={inputValue}
              onChange={setInputValue}
              onDebouncedChange={handleDebouncedChange}
              onSubmit={handleSubmit}
              onFocus={() => setShowSuggestions(true)}
              activeFilterCount={activeFilterCount}
              onFilterOpen={() => setIsFilterOpen(true)}
              autoFocus={!isSearchMode}
            />

            {/* Auto-complete dropdown (Req 8.4, 8.10) */}
            {showSuggestions && (
              <AutoCompleteDropdown
                history={searchHistory}
                trending={trendingSearches}
                onSelect={handleSuggestionSelect}
                onClearHistory={handleClearHistory}
                inputValue={inputValue}
              />
            )}
          </div>

          {/* Active query chip */}
          {isSearchMode && (
            <div className="flex items-center gap-2 mt-2 flex-wrap max-w-2xl mx-auto lg:mx-0">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand/10 text-brand text-xs font-medium">
                <Search size={10} aria-hidden="true" />
                {urlQuery}
                <button
                  type="button"
                  aria-label={`Clear search for "${urlQuery}"`}
                  onClick={() => {
                    setInputValue('')
                    router.push('/search')
                  }}
                  className="ml-0.5 hover:text-brand-dark"
                >
                  <X size={10} aria-hidden="true" />
                </button>
              </span>

              {activeFilterCount > 0 && (
                <span className="text-xs text-gray-500">
                  {activeFilterCount} filter{activeFilterCount !== 1 ? 's' : ''} active
                </span>
              )}
            </div>
          )}
        </div>
      </header>

      {/* ── Page content: desktop two-panel layout (Req 10.2, 10.3) ── */}
      <div className="lg:flex lg:gap-0">
        {/* Desktop filter sidebar — hidden on mobile, visible on lg+ */}
        <aside
          className="hidden lg:block w-60 xl:w-72 shrink-0 border-r border-gray-200 bg-white sticky top-[57px] self-start min-h-[calc(100vh-57px)] overflow-y-auto"
          aria-label="Search filters"
        >
          <FilterPanel
            filters={urlFilters}
            onFiltersChange={handleFiltersChange}
          />
        </aside>

        {/* Results area — takes remaining space */}
        <div className="flex-1 min-w-0">
          {isSearchMode ? (
            /* Search mode — show results */
            <div className="px-2 py-3">
              <SearchResults
                query={urlQuery}
                minPrice={urlFilters.minPrice || undefined}
                maxPrice={urlFilters.maxPrice || undefined}
                categories={urlFilters.categories.length > 0 ? urlFilters.categories : undefined}
                minRating={urlFilters.minRating > 0 ? urlFilters.minRating : undefined}
                sort={urlFilters.sort !== 'relevance' ? urlFilters.sort : undefined}
                onResultCountChange={handleResultCountChange}
              />
            </div>
          ) : (
            /* Browse mode — category grid (Req 8.1) */
            <BrowseMode onCategorySelect={handleCategorySelect} />
          )}
        </div>
      </div>

      {/* ── Filter sheet — mobile only (< lg) (Req 10.3) ── */}
      <div className="lg:hidden">
        <FilterSheet
          isOpen={isFilterOpen}
          onClose={() => setIsFilterOpen(false)}
          filters={urlFilters}
          onFiltersChange={handleFiltersChange}
        />
      </div>
    </main>
  )
}

export default function SearchPage() {
  return (
    <Suspense>
      <SearchPageContent />
    </Suspense>
  )
}