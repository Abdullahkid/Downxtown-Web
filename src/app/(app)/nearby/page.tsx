'use client'

/**
 * NearbyPage — location-based store discovery screen.
 *
 * Features:
 *  - Requests geolocation on mount via useGeolocation()
 *  - Fetches nearby stores from api.get('/stores/nearby?lat=&lng=')
 *  - Toggles between Map view and List view
 *  - Auto-refreshes when the buyer's location changes by > 500 m
 *  - Shows a permission-denied explanation with a link to browser settings
 *    when geolocation permission is denied
 *
 * Requirements: 17.1, 17.2, 17.3, 17.4, 17.5, 17.6, 17.7
 */

import React, { useEffect, useRef, useState, useCallback } from 'react'
import { MapPin, List, Map, RefreshCw, Settings } from 'lucide-react'
import { useGeolocation } from '@/hooks/useGeolocation'
import { api } from '@/lib/api/apiClient'
import { MapView } from '@/components/nearby/MapView'
import { NearbyStoreList } from '@/components/nearby/NearbyStoreList'
import { ShimmerCard, ErrorState } from '@/components/shared'
import type { NearbyStore } from '@/components/nearby'

// ---------------------------------------------------------------------------
// Haversine distance helper
// ---------------------------------------------------------------------------

/**
 * Returns the great-circle distance between two coordinates in metres.
 */
function haversineMeters(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const R = 6_371_000 // Earth radius in metres
  const toRad = (deg: number) => (deg * Math.PI) / 180
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

// ---------------------------------------------------------------------------
// View mode type
// ---------------------------------------------------------------------------

type ViewMode = 'map' | 'list'

// ---------------------------------------------------------------------------
// NearbyPage
// ---------------------------------------------------------------------------

export default function NearbyPage() {
  const { coords, error: geoError, permissionState } = useGeolocation()

  const [stores, setStores] = useState<NearbyStore[]>([])
  const [loading, setLoading] = useState(false)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>('map')

  /**
   * Coordinates used for the last successful fetch.
   * Used to determine whether the buyer has moved > 500 m.
   */
  const lastFetchCoordsRef = useRef<{ lat: number; lng: number } | null>(null)

  // -------------------------------------------------------------------------
  // Fetch nearby stores
  // -------------------------------------------------------------------------
  const fetchNearbyStores = useCallback(async (lat: number, lng: number) => {
    setLoading(true)
    setFetchError(null)
    try {
      const data = await api.get<NearbyStore[]>(
        `/stores/nearby?lat=${lat}&lng=${lng}`,
      )
      setStores(data ?? [])
      lastFetchCoordsRef.current = { lat, lng }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to load nearby stores'
      setFetchError(message)
    } finally {
      setLoading(false)
    }
  }, [])

  // -------------------------------------------------------------------------
  // React to coordinate changes
  // -------------------------------------------------------------------------
  useEffect(() => {
    if (!coords) return

    const { latitude: lat, longitude: lng } = coords
    const last = lastFetchCoordsRef.current

    if (!last) {
      // First fix — fetch immediately (Req 17.1, 17.2)
      fetchNearbyStores(lat, lng)
      return
    }

    // Auto-refresh when buyer moves > 500 m (Req 17.7)
    const moved = haversineMeters(last.lat, last.lng, lat, lng)
    if (moved > 500) {
      fetchNearbyStores(lat, lng)
    }
  }, [coords, fetchNearbyStores])

  // -------------------------------------------------------------------------
  // Manual retry
  // -------------------------------------------------------------------------
  const handleRetry = useCallback(() => {
    if (coords) {
      fetchNearbyStores(coords.latitude, coords.longitude)
    }
  }, [coords, fetchNearbyStores])

  // -------------------------------------------------------------------------
  // Render: permission denied (Req 17.6)
  // -------------------------------------------------------------------------
  if (permissionState === 'denied') {
    return (
      <main className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center gap-4">
        <div
          className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center"
          aria-hidden="true"
        >
          <MapPin size={32} className="text-red-500" />
        </div>

        <h1 className="text-xl font-bold text-gray-900">
          Location Access Denied
        </h1>

        <p className="text-sm text-gray-600 max-w-xs">
          DownXtown needs your location to show nearby stores. Please enable
          location access in your browser settings and reload the page.
        </p>

        {/* Link to browser settings — best-effort; browsers don't expose a
            direct settings URL, so we open the browser's settings page via
            the chrome://settings/content/location pattern where supported,
            and fall back to a generic instruction. */}
        <a
          href="chrome://settings/content/location"
          target="_blank"
          rel="noopener noreferrer"
          className={[
            'inline-flex items-center gap-2',
            'min-h-[44px] px-5 py-2.5 rounded-xl',
            'bg-blue-600 text-white text-sm font-medium',
            'hover:bg-blue-700 active:bg-blue-800 transition-colors',
            'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600',
          ].join(' ')}
          aria-label="Open browser location settings"
        >
          <Settings size={16} aria-hidden="true" />
          Open Location Settings
        </a>

        <p className="text-xs text-gray-400 max-w-xs">
          In most browsers you can also click the lock icon in the address bar
          and change the Location permission to "Allow".
        </p>
      </main>
    )
  }

  // -------------------------------------------------------------------------
  // Render: waiting for first location fix
  // -------------------------------------------------------------------------
  if (!coords && permissionState !== ('denied' as PermissionState | null)) {
    return (
      <main className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center gap-4">
        <div
          className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center animate-pulse"
          aria-hidden="true"
        >
          <MapPin size={32} className="text-blue-500" />
        </div>
        <h1 className="text-xl font-bold text-gray-900">Finding your location…</h1>
        <p className="text-sm text-gray-500 max-w-xs">
          {geoError
            ? `Location error: ${geoError.message}`
            : 'Please allow location access when prompted by your browser.'}
        </p>
      </main>
    )
  }

  // -------------------------------------------------------------------------
  // Render: main screen (map / list toggle)
  // -------------------------------------------------------------------------
  const currentLat = coords!.latitude
  const currentLng = coords!.longitude

  return (
    <main className="flex flex-col h-[calc(100dvh-56px)] md:h-[calc(100dvh-64px)]">
      {/* ------------------------------------------------------------------ */}
      {/* Header bar                                                          */}
      {/* ------------------------------------------------------------------ */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-white">
        <div className="flex items-center gap-2">
          <MapPin size={18} className="text-blue-600" aria-hidden="true" />
          <h1 className="text-base font-semibold text-gray-900">Nearby Stores</h1>
          {stores.length > 0 && (
            <span className="text-xs text-gray-400">({stores.length})</span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Manual refresh button */}
          <button
            type="button"
            aria-label="Refresh nearby stores"
            onClick={handleRetry}
            disabled={loading}
            className={[
              'flex items-center justify-center w-9 h-9 rounded-lg',
              'text-gray-500 hover:bg-gray-100 active:bg-gray-200 transition-colors',
              'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-400',
              loading ? 'opacity-50 cursor-not-allowed' : '',
            ].join(' ')}
          >
            <RefreshCw
              size={16}
              aria-hidden="true"
              className={loading ? 'animate-spin' : ''}
            />
          </button>

          {/* Map / List toggle (Req 17.3) */}
          <div
            className="flex rounded-lg border border-gray-200 overflow-hidden"
            role="group"
            aria-label="View mode"
          >
            <button
              type="button"
              aria-label="Map view"
              aria-pressed={viewMode === 'map'}
              onClick={() => setViewMode('map')}
              className={[
                'flex items-center justify-center w-9 h-9 transition-colors',
                viewMode === 'map'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-500 hover:bg-gray-50',
                'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600',
              ].join(' ')}
            >
              <Map size={16} aria-hidden="true" />
            </button>
            <button
              type="button"
              aria-label="List view"
              aria-pressed={viewMode === 'list'}
              onClick={() => setViewMode('list')}
              className={[
                'flex items-center justify-center w-9 h-9 transition-colors',
                viewMode === 'list'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-500 hover:bg-gray-50',
                'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600',
              ].join(' ')}
            >
              <List size={16} aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Content area                                                        */}
      {/* ------------------------------------------------------------------ */}
      <div className="flex-1 overflow-hidden relative">
        {/* Loading overlay */}
        {loading && stores.length === 0 && (
          <div className="absolute inset-0 z-10 flex flex-col gap-3 p-4">
            <ShimmerCard height={80} className="w-full" />
            <ShimmerCard height={80} className="w-full" />
            <ShimmerCard height={80} className="w-full" />
          </div>
        )}

        {/* Error state */}
        {fetchError && !loading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center">
            <ErrorState
              message={fetchError}
              onRetry={handleRetry}
            />
          </div>
        )}

        {/* Map view (Req 17.4) */}
        {viewMode === 'map' && !fetchError && (
          <MapView
            lat={currentLat}
            lng={currentLng}
            stores={stores}
          />
        )}

        {/* List view (Req 17.2, 17.3) */}
        {viewMode === 'list' && !fetchError && (
          <div className="h-full overflow-y-auto">
            <NearbyStoreList stores={stores} />
          </div>
        )}
      </div>
    </main>
  )
}
