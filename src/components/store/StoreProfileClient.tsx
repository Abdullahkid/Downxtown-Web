'use client'

/**
 * StoreProfileClient — client wrapper that owns in-store search state.
 *
 * The store page is a Next.js Server Component, so the search button, input,
 * and search/browse mode switching must live in a client component boundary.
 *
 * Architecture mirrors the Android StoreProfileViewModel:
 *  - isSearchMode: whether the search top bar + search results panel are shown
 *  - searchQuery: the live typed value (no debounce needed — the query key
 *    in StoreSearchResults drives TanStack Query, which deduplicates calls)
 *
 * The ?q URL param passed by global SearchResults "See all products" links is
 * read here once on mount and pre-populates the search, so users land directly
 * in search mode with their query intact.
 *
 * Requirements: 9.9
 */

import React, { useState, useCallback, useEffect, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import { ArrowLeft, Search, X } from 'lucide-react'
import { StoreHeader } from './StoreHeader'
import { StoreTabs } from './StoreTabs'
import { StoreSearchResults } from './StoreSearchResults'
import type { StoreProfile } from '@/types/store'
import type { MiniProduct } from '@/types/product'

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface StoreProfileClientProps {
  store: StoreProfile
  ssrProducts: MiniProduct[]
  ssrHasNextPage: boolean
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function StoreProfileClient({
  store,
  ssrProducts,
  ssrHasNextPage,
}: StoreProfileClientProps) {
  const searchParams = useSearchParams()

  // ── Search state ──────────────────────────────────────────────────────────
  const [isSearchMode, setIsSearchMode] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  // ── Read ?q on mount — pre-populate from global search "See all" tap ──────
  useEffect(() => {
    const qParam = searchParams.get('q')
    if (qParam && qParam.trim()) {
      setSearchQuery(qParam.trim())
      setIsSearchMode(true)
    }
  // Only read searchParams once on mount — exhaustive-deps intentional
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Focus the input whenever search mode opens ────────────────────────────
  useEffect(() => {
    if (isSearchMode) {
      // Small delay so the DOM element is definitely rendered
      const id = setTimeout(() => inputRef.current?.focus(), 80)
      return () => clearTimeout(id)
    }
  }, [isSearchMode])

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleEnterSearch = useCallback(() => {
    setIsSearchMode(true)
  }, [])

  const handleExitSearch = useCallback(() => {
    setIsSearchMode(false)
    setSearchQuery('')
  }, [])

  const handleQueryChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchQuery(e.target.value)
    },
    [],
  )

  const handleClearQuery = useCallback(() => {
    setSearchQuery('')
    inputRef.current?.focus()
  }, [])

  // ── Back-button shortcut: exit search mode instead of navigating away ─────
  useEffect(() => {
    if (!isSearchMode) return

    const handlePopState = () => {
      handleExitSearch()
    }

    // Push a dummy history entry so the browser's back gesture fires popstate
    // and we can intercept it before navigation actually happens.
    window.history.pushState({ searchMode: true }, '')
    window.addEventListener('popstate', handlePopState)
    return () => {
      window.removeEventListener('popstate', handlePopState)
    }
  }, [isSearchMode, handleExitSearch])

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <>
      {/* Search top bar — visible only in search mode, sits above everything */}
      {isSearchMode && (
        <div
          className={[
            'fixed left-0 right-0 top-0 z-50',
            'flex items-center gap-2 px-3',
            'h-14 border-b border-gray-200 bg-white shadow-sm',
          ].join(' ')}
          role="search"
          aria-label="Search store products"
        >
          {/* Back / exit search */}
          <button
            type="button"
            onClick={handleExitSearch}
            aria-label="Exit search"
            className={[
              'flex shrink-0 items-center justify-center rounded-full',
              'h-10 w-10 text-gray-600 hover:bg-gray-100 transition-colors',
              'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-400',
            ].join(' ')}
          >
            <ArrowLeft size={22} aria-hidden="true" />
          </button>

          {/* Text input */}
          <div className="relative flex-1">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
              aria-hidden="true"
            />
            <input
              ref={inputRef}
              type="search"
              inputMode="search"
              value={searchQuery}
              onChange={handleQueryChange}
              placeholder={`Search in ${store.storeName}…`}
              aria-label={`Search products in ${store.storeName}`}
              className={[
                'w-full rounded-full border border-gray-300 bg-gray-50',
                'py-2 pl-9 pr-9 text-sm text-gray-900 placeholder-gray-400',
                'outline-none transition-colors',
                'focus:border-[var(--brand-color,#6366f1)] focus:bg-white focus:ring-2',
                'focus:ring-[var(--brand-color,#6366f1)]/20',
              ].join(' ')}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={handleClearQuery}
                aria-label="Clear search"
                className={[
                  'absolute right-3 top-1/2 -translate-y-1/2',
                  'flex items-center justify-center rounded-full',
                  'h-5 w-5 bg-gray-400 text-white hover:bg-gray-500 transition-colors',
                ].join(' ')}
              >
                <X size={12} aria-hidden="true" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Main content */}
      <main
        className={[
          'min-h-screen bg-white',
          // Push content down when the search bar overlays the top
          isSearchMode ? 'pt-14' : '',
        ].join(' ')}
      >
        {/* Store header is always visible so users keep context of which
            store they're in while searching */}
        <StoreHeader
          store={store}
          onSearchClick={handleEnterSearch}
        />

        {/* Switch between search results and the normal product/tab view */}
        {isSearchMode ? (
          <StoreSearchResults
            storeId={store.id}
            storeName={store.storeName}
            query={searchQuery}
          />
        ) : (
          <StoreTabs
            storeId={store.id}
            storeUsername={store.storeUsername}
            ssrProducts={ssrProducts}
            ssrHasNextPage={ssrHasNextPage}
          />
        )}
      </main>
    </>
  )
}
