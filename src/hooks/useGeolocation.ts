'use client'

/**
 * useGeolocation — wraps `navigator.geolocation.watchPosition` and the
 * Permissions API to expose the current coordinates, any error, and the
 * current permission state.
 *
 * Requirements: 17.1
 */

import { useState, useEffect } from 'react'

interface GeolocationState {
  coords: GeolocationCoordinates | null
  error: GeolocationPositionError | null
  permissionState: PermissionState | null
}

export function useGeolocation(): GeolocationState {
  const [state, setState] = useState<GeolocationState>({
    coords: null,
    error: null,
    permissionState: null,
  })

  useEffect(() => {
    // Guard: geolocation is not available in SSR or some environments.
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      return
    }

    let watchId: number | null = null

    // Query the current permission state and subscribe to changes.
    const setupPermissionListener = async () => {
      try {
        const permissionStatus = await navigator.permissions.query({
          name: 'geolocation',
        })

        setState((prev) => ({
          ...prev,
          permissionState: permissionStatus.state,
        }))

        // Keep permission state in sync if the user changes it while the page
        // is open (e.g. via browser settings).
        const handlePermissionChange = () => {
          setState((prev) => ({
            ...prev,
            permissionState: permissionStatus.state,
          }))
        }

        permissionStatus.addEventListener('change', handlePermissionChange)

        // Return a cleanup function for the permission listener.
        return () => {
          permissionStatus.removeEventListener('change', handlePermissionChange)
        }
      } catch {
        // Permissions API not supported — leave permissionState as null.
        return () => {}
      }
    }

    // Start watching position.
    watchId = navigator.geolocation.watchPosition(
      (position) => {
        setState((prev) => ({
          ...prev,
          coords: position.coords,
          error: null,
        }))
      },
      (error) => {
        setState((prev) => ({
          ...prev,
          error,
        }))
      },
      {
        enableHighAccuracy: true,
        timeout: 10_000,
        maximumAge: 30_000,
      },
    )

    let cleanupPermission: (() => void) | undefined

    setupPermissionListener().then((cleanup) => {
      cleanupPermission = cleanup
    })

    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId)
      }
      cleanupPermission?.()
    }
  }, [])

  return state
}
