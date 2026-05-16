'use client'

/**
 * MapView — renders nearby stores as pins on a Google Maps interactive map.
 *
 * Features:
 *  - Lazy-loads the Google Maps JavaScript API via dynamic script injection
 *  - Renders a `google.maps.Marker` for each nearby store
 *  - Tapping a pin opens an info card overlay with store name, distance,
 *    and a "View Store" link
 *  - Centers the map on the buyer's current coordinates
 *
 * Requirements: 17.2, 17.4, 17.5
 */

import React, { useEffect, useRef, useState, useCallback } from 'react'
import Link from 'next/link'
import { X, MapPin } from 'lucide-react'
import { ShimmerCard } from '@/components/shared'
import type { NearbyStore } from './types'

// ---------------------------------------------------------------------------
// Google Maps script loader (singleton promise)
// ---------------------------------------------------------------------------

let mapsLoadPromise: Promise<void> | null = null

function loadGoogleMapsScript(): Promise<void> {
  if (mapsLoadPromise) return mapsLoadPromise

  mapsLoadPromise = new Promise<void>((resolve, reject) => {
    // Already loaded
    if (typeof window !== 'undefined' && window.google?.maps) {
      resolve()
      return
    }

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? ''
    const script = document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`
    script.async = true
    script.defer = true
    script.onload = () => resolve()
    script.onerror = () => {
      mapsLoadPromise = null // allow retry
      reject(new Error('Failed to load Google Maps JavaScript API'))
    }
    document.head.appendChild(script)
  })

  return mapsLoadPromise
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface MapViewProps {
  /** Buyer's current latitude */
  lat: number
  /** Buyer's current longitude */
  lng: number
  /** Nearby stores to render as pins */
  stores: NearbyStore[]
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function MapView({ lat, lng, stores }: MapViewProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapRef = useRef<any>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const markersRef = useRef<any[]>([])
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const userMarkerRef = useRef<any>(null)

  const [mapsReady, setMapsReady] = useState(false)
  const [mapsError, setMapsError] = useState(false)
  const [selectedStore, setSelectedStore] = useState<NearbyStore | null>(null)

  // -------------------------------------------------------------------------
  // Load Google Maps API on mount
  // -------------------------------------------------------------------------
  useEffect(() => {
    loadGoogleMapsScript()
      .then(() => setMapsReady(true))
      .catch(() => setMapsError(true))
  }, [])

  // -------------------------------------------------------------------------
  // Initialise map once API is ready
  // -------------------------------------------------------------------------
  useEffect(() => {
    if (!mapsReady || !mapContainerRef.current) return

    if (!mapRef.current) {
      mapRef.current = new (window as any).google.maps.Map(mapContainerRef.current, {
        center: { lat, lng },
        zoom: 14,
        disableDefaultUI: false,
        zoomControl: true,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
      })
    } else {
      // Pan to updated location
      mapRef.current.panTo({ lat, lng })
    }
  }, [mapsReady, lat, lng])

  // -------------------------------------------------------------------------
  // User location marker
  // -------------------------------------------------------------------------
  useEffect(() => {
    if (!mapsReady || !mapRef.current) return

    if (userMarkerRef.current) {
      userMarkerRef.current.setPosition({ lat, lng })
    } else {
      userMarkerRef.current = new (window as any).google.maps.Marker({
        position: { lat, lng },
        map: mapRef.current,
        title: 'Your location',
        icon: {
          path: (window as any).google.maps.SymbolPath.CIRCLE,
          scale: 10,
          fillColor: '#4285F4',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 2,
        },
        zIndex: 1000,
      })
    }
  }, [mapsReady, lat, lng])

  // -------------------------------------------------------------------------
  // Store markers — re-render whenever stores list changes
  // -------------------------------------------------------------------------
  useEffect(() => {
    if (!mapsReady || !mapRef.current) return

    // Clear existing store markers
    markersRef.current.forEach((m) => m.setMap(null))
    markersRef.current = []

    stores.forEach((store) => {
      const marker = new (window as any).google.maps.Marker({
        position: { lat: store.lat, lng: store.lng },
        map: mapRef.current!,
        title: store.storeName,
        icon: {
          url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(
            `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="40" viewBox="0 0 32 40">
              <path d="M16 0C7.163 0 0 7.163 0 16c0 10 16 24 16 24S32 26 32 16C32 7.163 24.837 0 16 0z" fill="#E53935"/>
              <circle cx="16" cy="16" r="7" fill="white"/>
            </svg>`
          )}`,
          scaledSize: new (window as any).google.maps.Size(32, 40),
          anchor: new (window as any).google.maps.Point(16, 40),
        },
      })

      marker.addListener('click', () => {
        setSelectedStore(store)
        mapRef.current?.panTo({ lat: store.lat, lng: store.lng })
      })

      markersRef.current.push(marker)
    })
  }, [mapsReady, stores])

  // -------------------------------------------------------------------------
  // Dismiss info card
  // -------------------------------------------------------------------------
  const dismissCard = useCallback(() => setSelectedStore(null), [])

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------
  if (mapsError) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3 text-center px-6">
        <MapPin size={40} className="text-gray-400" aria-hidden="true" />
        <p className="text-sm text-gray-600">
          Unable to load Google Maps. Please check your connection and try again.
        </p>
      </div>
    )
  }

  return (
    <div className="relative w-full h-full">
      {/* Loading shimmer while Maps API loads */}
      {!mapsReady && (
        <ShimmerCard className="absolute inset-0 rounded-none" />
      )}

      {/* Map container */}
      <div
        ref={mapContainerRef}
        className="w-full h-full"
        aria-label="Nearby stores map"
        role="application"
      />

      {/* Store info card overlay — shown when a pin is tapped */}
      {selectedStore && (
        <div
          className={[
            'absolute bottom-4 left-4 right-4 z-10',
            'bg-white rounded-2xl shadow-xl p-4',
            'flex items-start gap-3',
          ].join(' ')}
          role="dialog"
          aria-modal="false"
          aria-label={`Store info: ${selectedStore.storeName}`}
        >
          {/* Store icon placeholder */}
          <div
            className="flex-shrink-0 w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center"
            aria-hidden="true"
          >
            <MapPin size={20} className="text-red-500" />
          </div>

          {/* Store details */}
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-900 truncate">
              {selectedStore.storeName}
            </p>
            <p className="text-sm text-gray-500 mt-0.5">
              {formatDistance(selectedStore.distanceMeters)}
            </p>
            <Link
              href={`/store/${selectedStore.storeUsername}`}
              className={[
                'mt-2 inline-flex items-center justify-center',
                'min-h-[36px] px-4 py-1.5 rounded-lg',
                'bg-blue-600 text-white text-sm font-medium',
                'hover:bg-blue-700 active:bg-blue-800 transition-colors',
                'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600',
              ].join(' ')}
              aria-label={`View ${selectedStore.storeName} store`}
            >
              View Store
            </Link>
          </div>

          {/* Dismiss button */}
          <button
            type="button"
            aria-label="Close store info"
            onClick={dismissCard}
            className={[
              'flex-shrink-0 flex items-center justify-center',
              'w-8 h-8 rounded-full bg-gray-100',
              'hover:bg-gray-200 transition-colors',
              'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-400',
            ].join(' ')}
          >
            <X size={16} aria-hidden="true" />
          </button>
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Format a distance in meters to a human-readable string.
 * < 1000 m → "Xm away"
 * ≥ 1000 m → "X.Xkm away"
 */
function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)}m away`
  }
  return `${(meters / 1000).toFixed(1)}km away`
}
