'use client'

/**
 * NearbyStoreList — list view of nearby stores with distance and "View Store" button.
 *
 * Each row shows:
 *  - Store logo via ImageLoader (display endpoint)
 *  - Store name and @username
 *  - Distance from the buyer's current location
 *  - "View Store" button navigating to /store/{storeUsername}
 *
 * Requirements: 17.2, 17.3
 */

import React from 'react'
import Link from 'next/link'
import { MapPin, Star } from 'lucide-react'
import { ImageLoader, EmptyState } from '@/components/shared'
import type { NearbyStore } from './types'

interface NearbyStoreListProps {
  stores: NearbyStore[]
}

export function NearbyStoreList({ stores }: NearbyStoreListProps) {
  if (stores.length === 0) {
    return (
      <EmptyState
        icon={<MapPin size={48} strokeWidth={1.5} />}
        heading="No stores nearby"
        body="We couldn't find any stores within range. Try moving to a different location."
      />
    )
  }

  return (
    <ul
      className="divide-y divide-gray-100"
      aria-label="Nearby stores list"
    >
      {stores.map((store) => (
        <NearbyStoreRow key={store.businessId} store={store} />
      ))}
    </ul>
  )
}

// ---------------------------------------------------------------------------
// Individual store row
// ---------------------------------------------------------------------------

interface NearbyStoreRowProps {
  store: NearbyStore
}

function NearbyStoreRow({ store }: NearbyStoreRowProps) {
  return (
    <li className="flex items-center gap-3 px-4 py-3">
      {/* Store logo */}
      <div className="flex-shrink-0 relative w-14 h-14 rounded-xl overflow-hidden bg-gray-100">
        <ImageLoader
          imageId={store.storeLogo}
          endpoint="display"
          alt={`${store.storeName} logo`}
          fill
          imageContext="store"
          sizes="56px"
        />
      </div>

      {/* Store info */}
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-gray-900 truncate">{store.storeName}</p>
        <p className="text-sm text-gray-500 truncate">@{store.storeUsername}</p>

        {/* Rating + distance row */}
        <div className="flex items-center gap-3 mt-0.5">
          {store.storeRating > 0 && (
            <span className="flex items-center gap-0.5 text-xs text-amber-500">
              <Star size={12} fill="currentColor" aria-hidden="true" />
              <span aria-label={`Rating: ${store.storeRating.toFixed(1)}`}>
                {store.storeRating.toFixed(1)}
              </span>
            </span>
          )}
          <span className="flex items-center gap-0.5 text-xs text-gray-400">
            <MapPin size={12} aria-hidden="true" />
            <span aria-label={`Distance: ${formatDistance(store.distanceMeters)}`}>
              {formatDistance(store.distanceMeters)}
            </span>
          </span>
        </div>
      </div>

      {/* View Store button — min 44×44px touch target */}
      <Link
        href={`/store/${store.storeUsername}`}
        className={[
          'flex-shrink-0 inline-flex items-center justify-center',
          'min-h-[44px] px-4 py-2 rounded-xl',
          'bg-blue-600 text-white text-sm font-medium',
          'hover:bg-blue-700 active:bg-blue-800 transition-colors',
          'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600',
        ].join(' ')}
        aria-label={`View ${store.storeName} store`}
      >
        View Store
      </Link>
    </li>
  )
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Format a distance in meters to a human-readable string.
 * < 1000 m → "Xm"
 * ≥ 1000 m → "X.Xkm"
 */
function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)}m`
  }
  return `${(meters / 1000).toFixed(1)}km`
}
