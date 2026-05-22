'use client'

/**
 * StoreTabs — tab bar managing Products / Categories / About / Reviews panels.
 *
 * Requirements: 9.3, 9.4, 9.7, 9.8
 */

import React, { useState } from 'react'
import { StoreProductGrid } from './StoreProductGrid'
import { StoreCategories } from './StoreCategories'
import { StoreReviews } from './StoreReviews'
import { StoreAbout } from './StoreAbout'
import type { MiniProduct } from '@/types/product'
import type { StoreProfile } from '@/types/store'

type Tab = 'products' | 'categories' | 'about' | 'reviews'

interface StoreTabsProps {
  storeId: string
  storeUsername: string
  store: StoreProfile
  ssrProducts?: MiniProduct[]
  ssrHasNextPage?: boolean
}

const TABS: { id: Tab; label: string }[] = [
  { id: 'products',   label: 'Products' },
  { id: 'categories', label: 'Collections' },
  { id: 'about',      label: 'About' },
  { id: 'reviews',    label: 'Reviews' },
]

export function StoreTabs({
  storeId,
  storeUsername,
  store,
  ssrProducts = [],
  ssrHasNextPage = true,
}: StoreTabsProps) {
  const [activeTab, setActiveTab] = useState<Tab>('products')

  return (
    <div>
      {/* Tab bar */}
      <div
        role="tablist"
        aria-label="Store sections"
        className={[
          'sticky top-0 z-40 flex border-b border-gray-200 bg-white',
          'overflow-x-auto scrollbar-none',
        ].join(' ')}
      >
        {TABS.map((tab) => (
          <button
            key={tab.id}
            role="tab"
            type="button"
            id={`tab-${tab.id}`}
            aria-selected={activeTab === tab.id}
            aria-controls={`tabpanel-${tab.id}`}
            onClick={() => setActiveTab(tab.id)}
            className={[
              'flex-1 shrink-0 py-3 text-sm font-medium transition-colors whitespace-nowrap px-3',
              'min-h-[44px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2',
              activeTab === tab.id
                ? 'border-b-2 border-[var(--brand-color,#6366f1)] text-[var(--brand-color,#6366f1)] focus-visible:outline-[var(--brand-color,#6366f1)]'
                : 'text-gray-500 hover:text-gray-700 focus-visible:outline-gray-400',
            ].join(' ')}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab panels */}
      <div
        role="tabpanel"
        id={`tabpanel-${activeTab}`}
        aria-labelledby={`tab-${activeTab}`}
        tabIndex={0}
      >
        {activeTab === 'products' && (
          <StoreProductGrid
            storeId={storeId}
            storeUsername={storeUsername}
            ssrProducts={ssrProducts}
            ssrHasNextPage={ssrHasNextPage}
          />
        )}
        {activeTab === 'categories' && (
          <StoreCategories storeId={storeId} storeUsername={storeUsername} />
        )}
        {activeTab === 'about' && (
          <StoreAbout store={store} />
        )}
        {activeTab === 'reviews' && (
          <StoreReviews storeId={storeId} />
        )}
      </div>
    </div>
  )
}
