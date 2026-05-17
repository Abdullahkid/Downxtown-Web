'use client'

/**
 * AddressManager — lists saved addresses and provides add/edit/delete flows.
 *
 * Features:
 *  - Displays the buyer's saved address (MVP: single address from user.address)
 *  - Add / edit form with Google Places autocomplete (lazy-loaded Maps API)
 *  - Interactive map pin for precise location (lazy-loaded)
 *  - Validates required fields via validateAddress before saving
 *  - Delete with window.confirm confirmation dialog
 *
 * Requirements: 16.6, 16.7, 16.8, 28.1–28.7
 */

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { MapPin, Plus, Pencil, Trash2, X, Check, Loader2 } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { api, ApiError } from '@/lib/api/apiClient'
import { validateAddress } from '@/lib/utils/validators'
import { Button } from '@/components/ui'
import type { Address } from '@/types/user'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface AddressFormState {
  addressLine1: string
  addressLine2: string
  city: string
  state: string
  pincode: string
  placeId: string
  formattedAddress: string
  lat: string
  lng: string
}

const EMPTY_FORM: AddressFormState = {
  addressLine1: '',
  addressLine2: '',
  city: '',
  state: '',
  pincode: '',
  placeId: '',
  formattedAddress: '',
  lat: '',
  lng: '',
}

// ---------------------------------------------------------------------------
// Google Maps lazy loader
// ---------------------------------------------------------------------------

let mapsLoadPromise: Promise<void> | null = null

function loadGoogleMaps(): Promise<void> {
  if (mapsLoadPromise) return mapsLoadPromise

  mapsLoadPromise = new Promise<void>((resolve, reject) => {
    if (typeof window === 'undefined') {
      reject(new Error('Not in browser'))
      return
    }

    // Already loaded
    if ((window as any).google?.maps) {
      resolve()
      return
    }

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? ''
    const script = document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`
    script.async = true
    script.defer = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Failed to load Google Maps'))
    document.head.appendChild(script)
  })

  return mapsLoadPromise
}

// ---------------------------------------------------------------------------
// AddressCard
// ---------------------------------------------------------------------------

interface AddressCardProps {
  address: Address
  onEdit: () => void
  onDelete: () => void
}

function AddressCard({ address, onEdit, onDelete }: AddressCardProps) {
  return (
    <div className="flex items-start gap-3 p-4 rounded-xl border border-gray-200 bg-white">
      <MapPin size={20} className="text-blue-600 mt-0.5 flex-shrink-0" aria-hidden="true" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 leading-snug">
          {address.addressLine1}
          {address.addressLine2 ? `, ${address.addressLine2}` : ''}
        </p>
        <p className="text-sm text-gray-500 mt-0.5">
          {address.city}, {address.state} – {address.pincode}
        </p>
        {address.formattedAddress && (
          <p className="text-xs text-gray-400 mt-0.5 truncate">{address.formattedAddress}</p>
        )}
      </div>
      <div className="flex items-center gap-1 flex-shrink-0">
        <button
          type="button"
          aria-label="Edit address"
          onClick={onEdit}
          className="p-2 rounded-lg text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
        >
          <Pencil size={16} aria-hidden="true" />
        </button>
        <button
          type="button"
          aria-label="Delete address"
          onClick={onDelete}
          className="p-2 rounded-lg text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
        >
          <Trash2 size={16} aria-hidden="true" />
        </button>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// AddressForm
// ---------------------------------------------------------------------------

interface AddressFormProps {
  initial?: Address
  onSave: (address: Address) => void
  onCancel: () => void
}

function AddressForm({ initial, onSave, onCancel }: AddressFormProps) {
  const [form, setForm] = useState<AddressFormState>(() =>
    initial
      ? {
          addressLine1: initial.addressLine1,
          addressLine2: initial.addressLine2 ?? '',
          city: initial.city,
          state: initial.state,
          pincode: initial.pincode,
          placeId: initial.placeId ?? '',
          formattedAddress: initial.formattedAddress ?? '',
          lat: initial.location?.lat?.toString() ?? '',
          lng: initial.location?.lng?.toString() ?? '',
        }
      : EMPTY_FORM,
  )
  const [errors, setErrors] = useState<Partial<Record<keyof AddressFormState, string>>>({})
  const [saving, setSaving] = useState(false)
  const [mapsReady, setMapsReady] = useState(false)
  const [mapsError, setMapsError] = useState(false)

  const autocompleteInputRef = useRef<HTMLInputElement>(null)
  const mapContainerRef = useRef<HTMLDivElement>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapRef = useRef<any>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const markerRef = useRef<any>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const autocompleteRef = useRef<any>(null)

  // -------------------------------------------------------------------------
  // Load Google Maps lazily
  // -------------------------------------------------------------------------
  useEffect(() => {
    loadGoogleMaps()
      .then(() => setMapsReady(true))
      .catch(() => setMapsError(true))
  }, [])

  // -------------------------------------------------------------------------
  // Initialize map and autocomplete once Maps API is ready
  // -------------------------------------------------------------------------
  useEffect(() => {
    if (!mapsReady) return
    if (!mapContainerRef.current || !autocompleteInputRef.current) return

    const defaultLat = form.lat ? parseFloat(form.lat) : 20.5937
    const defaultLng = form.lng ? parseFloat(form.lng) : 78.9629

    // Map
    const map = new (window as any).google.maps.Map(mapContainerRef.current, {
      center: { lat: defaultLat, lng: defaultLng },
      zoom: form.lat ? 15 : 5,
      disableDefaultUI: true,
      zoomControl: true,
    })
    mapRef.current = map

    // Draggable marker
    const marker = new (window as any).google.maps.Marker({
      position: { lat: defaultLat, lng: defaultLng },
      map,
      draggable: true,
      title: 'Drag to adjust delivery location',
    })
    markerRef.current = marker

    // Reverse geocode on marker drag (Req 28.4)
    marker.addListener('dragend', () => {
      const pos = marker.getPosition()
      if (!pos) return
      const lat = pos.lat()
      const lng = pos.lng()
      setForm((prev) => ({ ...prev, lat: lat.toString(), lng: lng.toString() }))

      const geocoder = new (window as any).google.maps.Geocoder()
      geocoder.geocode({ location: { lat, lng } }, (results: any[], status: string) => {
        if (status === 'OK' && results?.[0]) {
          const result = results[0]
          const components = result.address_components ?? []

          const get = (type: string) =>
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            components.find((c: any) => c.types.includes(type))?.long_name ?? ''

          setForm((prev) => ({
            ...prev,
            addressLine1: result.formatted_address ?? prev.addressLine1,
            city: get('locality') || get('administrative_area_level_2') || prev.city,
            state: get('administrative_area_level_1') || prev.state,
            pincode: get('postal_code') || prev.pincode,
            placeId: result.place_id ?? prev.placeId,
            formattedAddress: result.formatted_address ?? prev.formattedAddress,
          }))
        }
      })
    })

    // Places autocomplete (Req 28.1, 28.2)
    const autocomplete = new (window as any).google.maps.places.Autocomplete(
      autocompleteInputRef.current,
      { componentRestrictions: { country: 'in' }, fields: ['address_components', 'geometry', 'place_id', 'formatted_address'] },
    )
    autocompleteRef.current = autocomplete

    autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace()
      if (!place.geometry?.location) return

      const lat = place.geometry.location.lat()
      const lng = place.geometry.location.lng()
      const components = place.address_components ?? []

      const get = (type: string) =>
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        components.find((c: any) => c.types.includes(type))?.long_name ?? ''

      setForm((prev) => ({
        ...prev,
        addressLine1: place.formatted_address ?? prev.addressLine1,
        city: get('locality') || get('administrative_area_level_2') || prev.city,
        state: get('administrative_area_level_1') || prev.state,
        pincode: get('postal_code') || prev.pincode,
        placeId: place.place_id ?? prev.placeId,
        formattedAddress: place.formatted_address ?? prev.formattedAddress,
        lat: lat.toString(),
        lng: lng.toString(),
      }))

      map.setCenter({ lat, lng })
      map.setZoom(15)
      marker.setPosition({ lat, lng })
    })

    return () => {
      // Cleanup listeners
      (window as any).google.maps.event.clearInstanceListeners(marker)
      (window as any).google.maps.event.clearInstanceListeners(autocomplete)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapsReady])

  // -------------------------------------------------------------------------
  // Field change handler
  // -------------------------------------------------------------------------
  const handleChange = useCallback(
    (field: keyof AddressFormState) =>
      (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm((prev) => ({ ...prev, [field]: e.target.value }))
        setErrors((prev) => ({ ...prev, [field]: undefined }))
      },
    [],
  )

  // -------------------------------------------------------------------------
  // Validate and save (Req 28.7)
  // -------------------------------------------------------------------------
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()

      const partial: Partial<Address> = {
        addressLine1: form.addressLine1.trim(),
        city: form.city.trim(),
        state: form.state.trim(),
        pincode: form.pincode.trim(),
      }

      if (!validateAddress(partial)) {
        setErrors({
          addressLine1: !partial.addressLine1 ? 'Required' : undefined,
          city: !partial.city ? 'Required' : undefined,
          state: !partial.state ? 'Required' : undefined,
          pincode: !partial.pincode ? 'Required' : undefined,
        })
        return
      }

      setSaving(true)
      try {
        const payload = {
          addressLine1: form.addressLine1.trim(),
          addressLine2: form.addressLine2.trim() || undefined,
          city: form.city.trim(),
          state: form.state.trim(),
          pincode: form.pincode.trim(),
          placeId: form.placeId || undefined,
          formattedAddress: form.formattedAddress || undefined,
          location:
            form.lat && form.lng
              ? { lat: parseFloat(form.lat), lng: parseFloat(form.lng) }
              : undefined,
        }

        // Req 28.6 — send all address fields including placeId, formattedAddress, location
        const saved = await api.put<Address>('/buyer/address', payload)
        onSave(saved)
      } catch (err) {
        const message = err instanceof ApiError ? err.message : 'Failed to save address'
        setErrors({ addressLine1: message })
      } finally {
        setSaving(false)
      }
    },
    [form, onSave],
  )

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      aria-label="Address form"
      className="space-y-4"
    >
      {/* Address line 1 — also the autocomplete input */}
      <div>
        <label htmlFor="addr-line1" className="block text-sm font-medium text-gray-700 mb-1">
          Address Line 1 <span aria-hidden="true" className="text-red-500">*</span>
        </label>
        <input
          ref={autocompleteInputRef}
          id="addr-line1"
          type="text"
          autoComplete="off"
          value={form.addressLine1}
          onChange={handleChange('addressLine1')}
          placeholder="Start typing to search…"
          aria-required="true"
          aria-invalid={!!errors.addressLine1}
          aria-describedby={errors.addressLine1 ? 'addr-line1-error' : undefined}
          className={[
            'w-full px-3 py-2.5 rounded-lg border text-sm',
            'focus:outline-none focus:ring-2 focus:ring-blue-500',
            errors.addressLine1 ? 'border-red-400' : 'border-gray-300',
          ].join(' ')}
        />
        {errors.addressLine1 && (
          <p id="addr-line1-error" role="alert" className="mt-1 text-xs text-red-600">
            {errors.addressLine1}
          </p>
        )}
      </div>

      {/* Address line 2 */}
      <div>
        <label htmlFor="addr-line2" className="block text-sm font-medium text-gray-700 mb-1">
          Address Line 2
        </label>
        <input
          id="addr-line2"
          type="text"
          value={form.addressLine2}
          onChange={handleChange('addressLine2')}
          placeholder="Apartment, floor, landmark…"
          className="w-full px-3 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* City / State / Pincode */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="addr-city" className="block text-sm font-medium text-gray-700 mb-1">
            City <span aria-hidden="true" className="text-red-500">*</span>
          </label>
          <input
            id="addr-city"
            type="text"
            value={form.city}
            onChange={handleChange('city')}
            aria-required="true"
            aria-invalid={!!errors.city}
            aria-describedby={errors.city ? 'addr-city-error' : undefined}
            className={[
              'w-full px-3 py-2.5 rounded-lg border text-sm',
              'focus:outline-none focus:ring-2 focus:ring-blue-500',
              errors.city ? 'border-red-400' : 'border-gray-300',
            ].join(' ')}
          />
          {errors.city && (
            <p id="addr-city-error" role="alert" className="mt-1 text-xs text-red-600">
              {errors.city}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="addr-state" className="block text-sm font-medium text-gray-700 mb-1">
            State <span aria-hidden="true" className="text-red-500">*</span>
          </label>
          <input
            id="addr-state"
            type="text"
            value={form.state}
            onChange={handleChange('state')}
            aria-required="true"
            aria-invalid={!!errors.state}
            aria-describedby={errors.state ? 'addr-state-error' : undefined}
            className={[
              'w-full px-3 py-2.5 rounded-lg border text-sm',
              'focus:outline-none focus:ring-2 focus:ring-blue-500',
              errors.state ? 'border-red-400' : 'border-gray-300',
            ].join(' ')}
          />
          {errors.state && (
            <p id="addr-state-error" role="alert" className="mt-1 text-xs text-red-600">
              {errors.state}
            </p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="addr-pincode" className="block text-sm font-medium text-gray-700 mb-1">
          Pincode <span aria-hidden="true" className="text-red-500">*</span>
        </label>
        <input
          id="addr-pincode"
          type="text"
          inputMode="numeric"
          maxLength={6}
          value={form.pincode}
          onChange={handleChange('pincode')}
          aria-required="true"
          aria-invalid={!!errors.pincode}
          aria-describedby={errors.pincode ? 'addr-pincode-error' : undefined}
          className={[
            'w-full px-3 py-2.5 rounded-lg border text-sm',
            'focus:outline-none focus:ring-2 focus:ring-blue-500',
            errors.pincode ? 'border-red-400' : 'border-gray-300',
          ].join(' ')}
        />
        {errors.pincode && (
          <p id="addr-pincode-error" role="alert" className="mt-1 text-xs text-red-600">
            {errors.pincode}
          </p>
        )}
      </div>

      {/* Map pin (Req 28.3) */}
      <div>
        <p className="text-sm font-medium text-gray-700 mb-1">
          Pin Location
          <span className="ml-1 text-xs text-gray-400 font-normal">(drag to adjust)</span>
        </p>
        {mapsError ? (
          <p className="text-xs text-gray-400 italic">Map unavailable — manual entry only.</p>
        ) : !mapsReady ? (
          <div className="h-40 rounded-lg bg-gray-100 flex items-center justify-center">
            <Loader2 size={20} className="animate-spin text-gray-400" aria-label="Loading map…" />
          </div>
        ) : (
          <div
            ref={mapContainerRef}
            className="h-40 rounded-lg overflow-hidden border border-gray-200"
            aria-label="Map — drag the pin to adjust delivery location"
            role="application"
          />
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          disabled={saving}
          className="flex-1 flex items-center justify-center gap-2 min-h-[44px] px-4 py-2.5 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          <X size={16} aria-hidden="true" />
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving}
          className="flex-1 flex items-center justify-center gap-2 min-h-[44px] px-4 py-2.5 rounded-lg bg-blue-600 text-sm font-medium text-white hover:bg-blue-700 transition-colors disabled:opacity-60"
        >
          {saving ? (
            <Loader2 size={16} className="animate-spin" aria-hidden="true" />
          ) : (
            <Check size={16} aria-hidden="true" />
          )}
          {saving ? 'Saving…' : 'Save Address'}
        </button>
      </div>
    </form>
  )
}

// ---------------------------------------------------------------------------
// AddressManager (main export)
// ---------------------------------------------------------------------------

interface AddressManagerProps {
  /** Called after any add/edit/delete so the parent can refresh user data. */
  onAddressChanged?: () => void
}

export function AddressManager({ onAddressChanged }: AddressManagerProps) {
  const { user } = useAuthStore()
  const [showForm, setShowForm] = useState(false)
  const [editingAddress, setEditingAddress] = useState<Address | undefined>(undefined)
  const [deleting, setDeleting] = useState(false)

  const addresses: Address[] = user?.address ? [user.address] : []

  // -------------------------------------------------------------------------
  // Delete (Req 16.8)
  // -------------------------------------------------------------------------
  const handleDelete = useCallback(
    async (address: Address) => {
      const confirmed = window.confirm(
        'Are you sure you want to delete this address? This action cannot be undone.',
      )
      if (!confirmed) return

      setDeleting(true)
      try {
        await api.delete(`/buyer/address/${address.id}`)
        onAddressChanged?.()
      } catch {
        // Silently ignore — user can retry
      } finally {
        setDeleting(false)
      }
    },
    [onAddressChanged],
  )

  // -------------------------------------------------------------------------
  // Save (add or edit)
  // -------------------------------------------------------------------------
  const handleSave = useCallback(
    (_saved: Address) => {
      setShowForm(false)
      setEditingAddress(undefined)
      onAddressChanged?.()
    },
    [onAddressChanged],
  )

  const handleEdit = useCallback((address: Address) => {
    setEditingAddress(address)
    setShowForm(true)
  }, [])

  const handleAdd = useCallback(() => {
    setEditingAddress(undefined)
    setShowForm(true)
  }, [])

  const handleCancel = useCallback(() => {
    setShowForm(false)
    setEditingAddress(undefined)
  }, [])

  return (
    <section aria-label="Address management" className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-gray-900">Saved Addresses</h2>
        {!showForm && (
          <button
            type="button"
            onClick={handleAdd}
            disabled={deleting}
            aria-label="Add new address"
            className="flex items-center gap-1.5 min-h-[44px] px-3 py-2 rounded-lg text-sm font-medium text-blue-600 hover:bg-blue-50 transition-colors disabled:opacity-50"
          >
            <Plus size={16} aria-hidden="true" />
            Add Address
          </button>
        )}
      </div>

      {/* Address list */}
      {!showForm && (
        <>
          {addresses.length === 0 ? (
            <div className="flex flex-col items-center gap-4 py-10 text-center">
              <MapPin
                size={48}
                strokeWidth={1.5}
                className="text-gray-300"
                aria-hidden="true"
              />
              <p className="text-sm text-gray-500">No addresses saved yet</p>
              <Button
                variant="secondary"
                onClick={handleAdd}
                disabled={deleting}
              >
                Add Address
              </Button>
            </div>
          ) : (
            <ul className="space-y-3" aria-label="Saved addresses">
              {addresses.map((addr) => (
                <li key={addr.id}>
                  <AddressCard
                    address={addr}
                    onEdit={() => handleEdit(addr)}
                    onDelete={() => handleDelete(addr)}
                  />
                </li>
              ))}
            </ul>
          )}
        </>
      )}

      {/* Add / Edit form */}
      {showForm && (
        <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
          <h3 className="text-sm font-semibold text-gray-800 mb-4">
            {editingAddress ? 'Edit Address' : 'Add New Address'}
          </h3>
          <AddressForm
            initial={editingAddress}
            onSave={handleSave}
            onCancel={handleCancel}
          />
        </div>
      )}
    </section>
  )
}
