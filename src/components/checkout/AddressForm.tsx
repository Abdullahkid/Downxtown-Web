'use client'

/**
 * AddressForm — inline edit form for delivery address.
 *
 * Features:
 *  - Pre-populated with the buyer's saved address
 *  - Google Places autocomplete (lazy-loaded Google Maps JS API)
 *  - Map pin selector for precise location
 *  - Calls validateAddress before save
 *  - Calls api.put('/buyer/address') on save
 *
 * Requirements: 11.2, 11.3, 11.4, 28.1–28.7
 */

import { useState, useEffect, useRef, useCallback } from 'react'
import { Loader2, MapPin, Check, X, Edit2 } from 'lucide-react'
import { api } from '@/lib/api/apiClient'
import { validateAddress } from '@/lib/utils/validators'
import type { Address } from '@/types/user'

// ---------------------------------------------------------------------------
// Google Maps type declarations (loaded on-demand)
// ---------------------------------------------------------------------------

declare global {
  interface Window {
    google?: {
      maps: {
        places: {
          Autocomplete: new (
            input: HTMLInputElement,
            opts?: object,
          ) => GoogleAutocomplete
        }
        Map: new (el: HTMLElement, opts: object) => GoogleMap
        Marker: new (opts: object) => GoogleMarker
        Geocoder: new () => GoogleGeocoder
        LatLng: new (lat: number, lng: number) => GoogleLatLng
        event: { clearInstanceListeners: (obj: object) => void }
      }
    }
    initGoogleMaps?: () => void
  }
}

interface GoogleAutocomplete {
  addListener: (event: string, cb: () => void) => void
  getPlace: () => GooglePlace
}

interface GooglePlace {
  place_id?: string
  formatted_address?: string
  geometry?: { location: { lat: () => number; lng: () => number } }
  address_components?: Array<{
    long_name: string
    short_name: string
    types: string[]
  }>
}

interface GoogleMap {
  addListener: (event: string, cb: () => void) => void
  getCenter: () => { lat: () => number; lng: () => number }
}

interface GoogleMarker {
  setPosition: (pos: { lat: number; lng: number }) => void
  getPosition: () => { lat: () => number; lng: () => number } | null
  addListener: (event: string, cb: () => void) => void
  setMap: (map: GoogleMap | null) => void
}

interface GoogleGeocoder {
  geocode: (
    req: { location: { lat: number; lng: number } },
    cb: (results: GoogleGeocoderResult[], status: string) => void,
  ) => void
}

interface GoogleLatLng {
  lat: () => number
  lng: () => number
}

interface GoogleGeocoderResult {
  place_id?: string
  formatted_address?: string
  address_components?: Array<{
    long_name: string
    short_name: string
    types: string[]
  }>
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? ''

let mapsLoadPromise: Promise<void> | null = null

function loadGoogleMapsScript(): Promise<void> {
  if (mapsLoadPromise) return mapsLoadPromise

  mapsLoadPromise = new Promise((resolve, reject) => {
    if (window.google?.maps) {
      resolve()
      return
    }

    window.initGoogleMaps = () => resolve()

    const script = document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places&callback=initGoogleMaps`
    script.async = true
    script.defer = true
    script.onerror = () => reject(new Error('Failed to load Google Maps'))
    document.head.appendChild(script)
  })

  return mapsLoadPromise
}

function extractAddressComponent(
  components: GoogleGeocoderResult['address_components'],
  type: string,
): string {
  return (
    components?.find((c) => c.types.includes(type))?.long_name ?? ''
  )
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface AddressFormProps {
  /** Current saved address (may be undefined for new users) */
  initialAddress?: Address
  /** Called after the address is successfully saved to the server */
  onSaved: (address: Address) => void
  /** Called when the user cancels editing */
  onCancel: () => void
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function AddressForm({ initialAddress, onSaved, onCancel }: AddressFormProps) {
  const [form, setForm] = useState<Partial<Address>>({
    addressLine1: initialAddress?.addressLine1 ?? '',
    addressLine2: initialAddress?.addressLine2 ?? '',
    city: initialAddress?.city ?? '',
    state: initialAddress?.state ?? '',
    pincode: initialAddress?.pincode ?? '',
    placeId: initialAddress?.placeId,
    formattedAddress: initialAddress?.formattedAddress,
    location: initialAddress?.location,
  })

  const [errors, setErrors] = useState<Partial<Record<keyof Address, string>>>({})
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [mapsLoaded, setMapsLoaded] = useState(false)
  const [mapsError, setMapsError] = useState(false)

  const addressLine1Ref = useRef<HTMLInputElement>(null)
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<GoogleMap | null>(null)
  const markerRef = useRef<GoogleMarker | null>(null)
  const autocompleteRef = useRef<GoogleAutocomplete | null>(null)

  // -------------------------------------------------------------------------
  // Lazy-load Google Maps
  // -------------------------------------------------------------------------
  useEffect(() => {
    if (!GOOGLE_MAPS_API_KEY) return

    loadGoogleMapsScript()
      .then(() => setMapsLoaded(true))
      .catch(() => setMapsError(true))
  }, [])

  // -------------------------------------------------------------------------
  // Initialize autocomplete once Maps is loaded
  // -------------------------------------------------------------------------
  useEffect(() => {
    if (!mapsLoaded || !addressLine1Ref.current || !window.google) return

    const autocomplete = new window.google.maps.places.Autocomplete(
      addressLine1Ref.current,
      { componentRestrictions: { country: 'in' }, fields: ['address_components', 'geometry', 'place_id', 'formatted_address'] },
    )

    autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace()
      if (!place.geometry) return

      const components = place.address_components ?? []
      const lat = place.geometry.location.lat()
      const lng = place.geometry.location.lng()

      setForm((prev) => ({
        ...prev,
        addressLine1:
          [
            extractAddressComponent(components, 'street_number'),
            extractAddressComponent(components, 'route'),
            extractAddressComponent(components, 'sublocality_level_1'),
          ]
            .filter(Boolean)
            .join(', ') || prev.addressLine1,
        city:
          extractAddressComponent(components, 'locality') ||
          extractAddressComponent(components, 'administrative_area_level_2'),
        state: extractAddressComponent(components, 'administrative_area_level_1'),
        pincode: extractAddressComponent(components, 'postal_code'),
        placeId: place.place_id,
        formattedAddress: place.formatted_address,
        location: { lat, lng },
      }))

      // Move map pin
      if (markerRef.current) {
        markerRef.current.setPosition({ lat, lng })
      }
    })

    autocompleteRef.current = autocomplete

    return () => {
      if (window.google && autocompleteRef.current) {
        window.google.maps.event.clearInstanceListeners(autocompleteRef.current)
      }
    }
  }, [mapsLoaded])

  // -------------------------------------------------------------------------
  // Initialize map once Maps is loaded
  // -------------------------------------------------------------------------
  useEffect(() => {
    if (!mapsLoaded || !mapContainerRef.current || !window.google) return

    const defaultLat = form.location?.lat ?? 20.5937
    const defaultLng = form.location?.lng ?? 78.9629

    const map = new window.google.maps.Map(mapContainerRef.current, {
      center: { lat: defaultLat, lng: defaultLng },
      zoom: form.location ? 15 : 5,
      disableDefaultUI: true,
      zoomControl: true,
    })

    const marker = new window.google.maps.Marker({
      position: { lat: defaultLat, lng: defaultLng },
      map,
      draggable: true,
      title: 'Delivery location',
    })

    // Reverse geocode when marker is dragged
    marker.addListener('dragend', () => {
      const pos = marker.getPosition()
      if (!pos || !window.google) return

      const lat = pos.lat()
      const lng = pos.lng()

      const geocoder = new window.google.maps.Geocoder()
      geocoder.geocode({ location: { lat, lng } }, (results, status) => {
        if (status !== 'OK' || !results[0]) return
        const components = results[0].address_components ?? []

        setForm((prev) => ({
          ...prev,
          city:
            extractAddressComponent(components, 'locality') ||
            extractAddressComponent(components, 'administrative_area_level_2') ||
            prev.city,
          state:
            extractAddressComponent(components, 'administrative_area_level_1') ||
            prev.state,
          pincode:
            extractAddressComponent(components, 'postal_code') || prev.pincode,
          placeId: results[0].place_id,
          formattedAddress: results[0].formatted_address,
          location: { lat, lng },
        }))
      })
    })

    mapRef.current = map
    markerRef.current = marker
  }, [mapsLoaded]) // eslint-disable-line react-hooks/exhaustive-deps

  // -------------------------------------------------------------------------
  // Field change handler
  // -------------------------------------------------------------------------
  const handleChange = useCallback(
    (field: keyof Address, value: string) => {
      setForm((prev) => ({ ...prev, [field]: value }))
      setErrors((prev) => ({ ...prev, [field]: undefined }))
      setSaveError(null)
    },
    [],
  )

  // -------------------------------------------------------------------------
  // Save
  // -------------------------------------------------------------------------
  async function handleSave() {
    // Validate
    const newErrors: Partial<Record<keyof Address, string>> = {}
    if (!form.addressLine1?.trim()) newErrors.addressLine1 = 'Address line 1 is required'
    if (!form.city?.trim()) newErrors.city = 'City is required'
    if (!form.state?.trim()) newErrors.state = 'State is required'
    if (!form.pincode?.trim()) newErrors.pincode = 'Pincode is required'

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    if (!validateAddress(form)) {
      setSaveError('Please fill in all required address fields.')
      return
    }

    setSaving(true)
    setSaveError(null)

    try {
      const payload = {
        addressLine1: form.addressLine1!.trim(),
        addressLine2: form.addressLine2?.trim() || undefined,
        city: form.city!.trim(),
        state: form.state!.trim(),
        pincode: form.pincode!.trim(),
        placeId: form.placeId,
        formattedAddress: form.formattedAddress,
        location: form.location,
      }

      const saved = await api.put<Address>('/buyer/address', payload)
      onSaved(saved)
    } catch {
      setSaveError('Failed to save address. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------
  return (
    <div className="space-y-4">
      {/* Address Line 1 (with autocomplete) */}
      <FormField
        id="addr-line1"
        label="Address Line 1"
        required
        error={errors.addressLine1}
      >
        <input
          ref={addressLine1Ref}
          id="addr-line1"
          type="text"
          autoComplete="address-line1"
          value={form.addressLine1 ?? ''}
          onChange={(e) => handleChange('addressLine1', e.target.value)}
          placeholder="Street, area, locality"
          className={inputClass(!!errors.addressLine1)}
        />
      </FormField>

      {/* Address Line 2 */}
      <FormField id="addr-line2" label="Address Line 2" hint="Optional">
        <input
          id="addr-line2"
          type="text"
          autoComplete="address-line2"
          value={form.addressLine2 ?? ''}
          onChange={(e) => handleChange('addressLine2', e.target.value)}
          placeholder="Apartment, floor, landmark"
          className={inputClass(false)}
        />
      </FormField>

      {/* City + State row */}
      <div className="grid grid-cols-2 gap-3">
        <FormField id="addr-city" label="City" required error={errors.city}>
          <input
            id="addr-city"
            type="text"
            autoComplete="address-level2"
            value={form.city ?? ''}
            onChange={(e) => handleChange('city', e.target.value)}
            placeholder="City"
            className={inputClass(!!errors.city)}
          />
        </FormField>

        <FormField id="addr-state" label="State" required error={errors.state}>
          <input
            id="addr-state"
            type="text"
            autoComplete="address-level1"
            value={form.state ?? ''}
            onChange={(e) => handleChange('state', e.target.value)}
            placeholder="State"
            className={inputClass(!!errors.state)}
          />
        </FormField>
      </div>

      {/* Pincode */}
      <FormField id="addr-pincode" label="Pincode" required error={errors.pincode}>
        <input
          id="addr-pincode"
          type="text"
          inputMode="numeric"
          autoComplete="postal-code"
          value={form.pincode ?? ''}
          onChange={(e) => handleChange('pincode', e.target.value)}
          placeholder="6-digit pincode"
          maxLength={6}
          className={inputClass(!!errors.pincode)}
        />
      </FormField>

      {/* Map pin selector */}
      {mapsLoaded && !mapsError && (
        <div>
          <p className="text-xs font-medium text-gray-600 mb-1.5 flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5" aria-hidden="true" />
            Drag pin to fine-tune location
          </p>
          <div
            ref={mapContainerRef}
            className="w-full h-48 rounded-xl overflow-hidden border border-gray-200"
            aria-label="Map to select delivery location"
            role="application"
          />
        </div>
      )}

      {/* Save error */}
      {saveError && (
        <p role="alert" className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
          {saveError}
        </p>
      )}

      {/* Action buttons */}
      <div className="flex gap-3 pt-1">
        <button
          type="button"
          onClick={onCancel}
          disabled={saving}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <X className="w-4 h-4" aria-hidden="true" />
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? (
            <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
          ) : (
            <Check className="w-4 h-4" aria-hidden="true" />
          )}
          {saving ? 'Saving…' : 'Save Address'}
        </button>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// AddressDisplay — read-only view with edit button
// ---------------------------------------------------------------------------

export interface AddressDisplayProps {
  address: Address
  onEdit: () => void
}

export function AddressDisplay({ address, onEdit }: AddressDisplayProps) {
  const lines = [
    address.addressLine1,
    address.addressLine2,
    [address.city, address.state, address.pincode].filter(Boolean).join(', '),
  ].filter(Boolean)

  return (
    <div className="flex items-start justify-between gap-3 p-4 bg-white rounded-2xl border border-gray-100">
      <div className="flex gap-3">
        <MapPin className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
        <address className="not-italic text-sm text-gray-700 leading-relaxed">
          {lines.map((line, i) => (
            <span key={i} className="block">
              {line}
            </span>
          ))}
        </address>
      </div>
      <button
        type="button"
        onClick={onEdit}
        className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors"
        aria-label="Edit delivery address"
      >
        <Edit2 className="w-3.5 h-3.5" aria-hidden="true" />
        Edit
      </button>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function inputClass(hasError: boolean): string {
  return [
    'w-full px-4 py-3 rounded-xl border text-sm text-gray-900 placeholder-gray-400',
    'focus:outline-none focus:ring-2 focus:border-transparent transition',
    hasError
      ? 'border-red-300 focus:ring-red-400'
      : 'border-gray-200 focus:ring-blue-500',
  ].join(' ')
}

function FormField({
  id,
  label,
  required,
  hint,
  error,
  children,
}: {
  id: string
  label: string
  required?: boolean
  hint?: string
  error?: string
  children: React.ReactNode
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1.5">
        {label}
        {required && <span className="text-red-500 ml-0.5" aria-hidden="true">*</span>}
        {hint && <span className="ml-1 text-xs font-normal text-gray-400">({hint})</span>}
      </label>
      {children}
      {error && (
        <p role="alert" className="mt-1 text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  )
}
