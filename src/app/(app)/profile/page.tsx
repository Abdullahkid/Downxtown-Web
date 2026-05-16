'use client'

/**
 * Profile page — buyer's personal profile screen.
 *
 * Sections:
 *  1. ProfileStats (image, name, @username, stats)
 *  2. Edit Profile form (name, username, gender, DOB, image upload)
 *  3. Address Management
 *  4. My Wishlist
 *  5. Notification Settings toggle
 *  6. Sign Out
 *  7. Account Deletion
 *
 * Requirements: 16.1–16.11, 19.5, 28.1–28.7, 29.1, 29.4–29.5
 */

import React, { useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  ChevronDown,
  ChevronUp,
  Bell,
  BellOff,
  LogOut,
  Trash2,
  Loader2,
  Check,
  X,
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useUiStore } from '@/store/uiStore'
import { useAuth } from '@/hooks/useAuth'
import { api, ApiError } from '@/lib/api/apiClient'
import { ProfileStats, AddressManager, WishlistGrid } from '@/components/profile'
import type { Personal } from '@/types/user'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type Section = 'edit' | 'address' | 'wishlist' | 'notifications' | null

interface EditFormState {
  name: string
  username: string
  gender: 'MALE' | 'FEMALE' | 'OTHER' | ''
  dateOfBirth: string
}

// ---------------------------------------------------------------------------
// SectionToggle — collapsible section header
// ---------------------------------------------------------------------------

interface SectionToggleProps {
  label: string
  open: boolean
  onToggle: () => void
  icon?: React.ReactNode
}

function SectionToggle({ label, open, onToggle, icon }: SectionToggleProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={open}
      className={[
        'w-full flex items-center justify-between',
        'min-h-[52px] px-4 py-3 rounded-xl',
        'bg-white border border-gray-200',
        'text-sm font-semibold text-gray-800',
        'hover:bg-gray-50 transition-colors',
        'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600',
      ].join(' ')}
    >
      <span className="flex items-center gap-2">
        {icon}
        {label}
      </span>
      {open ? (
        <ChevronUp size={18} className="text-gray-400" aria-hidden="true" />
      ) : (
        <ChevronDown size={18} className="text-gray-400" aria-hidden="true" />
      )}
    </button>
  )
}

// ---------------------------------------------------------------------------
// EditProfileForm
// ---------------------------------------------------------------------------

interface EditProfileFormProps {
  user: Personal
  onSaved: () => void
  onCancel: () => void
}

function EditProfileForm({ user, onSaved, onCancel }: EditProfileFormProps) {
  const [form, setForm] = useState<EditFormState>({
    name: user.name,
    username: user.username,
    gender: user.gender ?? '',
    dateOfBirth: user.dateOfBirth ?? '',
  })
  const [errors, setErrors] = useState<Partial<Record<keyof EditFormState, string>>>({})
  const [saving, setSaving] = useState(false)

  const handleChange = useCallback(
    (field: keyof EditFormState) =>
      (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setForm((prev) => ({ ...prev, [field]: e.target.value }))
        setErrors((prev) => ({ ...prev, [field]: undefined }))
      },
    [],
  )

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()

      const newErrors: Partial<Record<keyof EditFormState, string>> = {}
      if (!form.name.trim()) newErrors.name = 'Name is required'
      if (!form.username.trim()) newErrors.username = 'Username is required'
      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors)
        return
      }

      setSaving(true)
      try {
        await api.put('/buyer/profile', {
          name: form.name.trim(),
          username: form.username.trim(),
          gender: form.gender || undefined,
          dateOfBirth: form.dateOfBirth || undefined,
        })
        onSaved()
      } catch (err) {
        if (err instanceof ApiError && err.status === 409) {
          // Req 16.5 — inline username-taken error
          setErrors({ username: 'Username already taken' })
        } else {
          const message = err instanceof ApiError ? err.message : 'Failed to save profile'
          setErrors({ name: message })
        }
      } finally {
        setSaving(false)
      }
    },
    [form, onSaved],
  )

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      aria-label="Edit profile form"
      className="space-y-4 p-4"
    >
      {/* Name */}
      <div>
        <label htmlFor="profile-name" className="block text-sm font-medium text-gray-700 mb-1">
          Name <span aria-hidden="true" className="text-red-500">*</span>
        </label>
        <input
          id="profile-name"
          type="text"
          value={form.name}
          onChange={handleChange('name')}
          aria-required="true"
          aria-invalid={!!errors.name}
          aria-describedby={errors.name ? 'profile-name-error' : undefined}
          className={[
            'w-full px-3 py-2.5 rounded-lg border text-sm',
            'focus:outline-none focus:ring-2 focus:ring-blue-500',
            errors.name ? 'border-red-400' : 'border-gray-300',
          ].join(' ')}
        />
        {errors.name && (
          <p id="profile-name-error" role="alert" className="mt-1 text-xs text-red-600">
            {errors.name}
          </p>
        )}
      </div>

      {/* Username */}
      <div>
        <label htmlFor="profile-username" className="block text-sm font-medium text-gray-700 mb-1">
          Username <span aria-hidden="true" className="text-red-500">*</span>
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm select-none" aria-hidden="true">
            @
          </span>
          <input
            id="profile-username"
            type="text"
            value={form.username}
            onChange={handleChange('username')}
            aria-required="true"
            aria-invalid={!!errors.username}
            aria-describedby={errors.username ? 'profile-username-error' : undefined}
            className={[
              'w-full pl-7 pr-3 py-2.5 rounded-lg border text-sm',
              'focus:outline-none focus:ring-2 focus:ring-blue-500',
              errors.username ? 'border-red-400' : 'border-gray-300',
            ].join(' ')}
          />
        </div>
        {errors.username && (
          <p id="profile-username-error" role="alert" className="mt-1 text-xs text-red-600">
            {errors.username}
          </p>
        )}
      </div>

      {/* Gender */}
      <div>
        <label htmlFor="profile-gender" className="block text-sm font-medium text-gray-700 mb-1">
          Gender
        </label>
        <select
          id="profile-gender"
          value={form.gender}
          onChange={handleChange('gender')}
          className="w-full px-3 py-2.5 rounded-lg border border-gray-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Prefer not to say</option>
          <option value="MALE">Male</option>
          <option value="FEMALE">Female</option>
          <option value="OTHER">Other</option>
        </select>
      </div>

      {/* Date of birth */}
      <div>
        <label htmlFor="profile-dob" className="block text-sm font-medium text-gray-700 mb-1">
          Date of Birth
        </label>
        <input
          id="profile-dob"
          type="date"
          value={form.dateOfBirth}
          onChange={handleChange('dateOfBirth')}
          max={new Date().toISOString().split('T')[0]}
          className="w-full px-3 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-1">
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
          {saving ? 'Saving…' : 'Save Changes'}
        </button>
      </div>
    </form>
  )
}

// ---------------------------------------------------------------------------
// NotificationToggle
// ---------------------------------------------------------------------------

function NotificationToggle() {
  const [enabled, setEnabled] = useState(true)
  const [saving, setSaving] = useState(false)

  const handleToggle = useCallback(async () => {
    const next = !enabled
    setSaving(true)
    try {
      // Req 19.5 — notification settings toggle
      await api.put('/buyer/notifications', { enabled: next })
      setEnabled(next)
    } catch {
      // Revert on failure — silently ignore
    } finally {
      setSaving(false)
    }
  }, [enabled])

  return (
    <div className="flex items-center justify-between px-4 py-3">
      <div className="flex items-center gap-2">
        {enabled ? (
          <Bell size={18} className="text-blue-600" aria-hidden="true" />
        ) : (
          <BellOff size={18} className="text-gray-400" aria-hidden="true" />
        )}
        <div>
          <p className="text-sm font-medium text-gray-800">Push Notifications</p>
          <p className="text-xs text-gray-500">
            {enabled ? "Enabled \u2014 you'll receive order updates" : 'Disabled'}
          </p>
        </div>
      </div>

      {/* Toggle switch */}
      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        aria-label={`${enabled ? 'Disable' : 'Enable'} push notifications`}
        onClick={handleToggle}
        disabled={saving}
        className={[
          'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
          'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600',
          'disabled:opacity-50',
          enabled ? 'bg-blue-600' : 'bg-gray-300',
        ].join(' ')}
      >
        <span
          className={[
            'inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform',
            enabled ? 'translate-x-6' : 'translate-x-1',
          ].join(' ')}
          aria-hidden="true"
        />
      </button>
    </div>
  )
}

// ---------------------------------------------------------------------------
// ProfilePage
// ---------------------------------------------------------------------------

export default function ProfilePage() {
  const router = useRouter()
  const { user } = useAuthStore()
  const { addToast } = useUiStore()
  const { signOut } = useAuth()

  const [activeSection, setActiveSection] = useState<Section>(null)
  const [signingOut, setSigningOut] = useState(false)
  const [deletingAccount, setDeletingAccount] = useState(false)

  // Sync wishlist/cart counts from user profile on mount
  const { setWishlistCount, setCartCount } = useUiStore()
  useEffect(() => {
    if (user) {
      setWishlistCount(user.wishlistCount)
      setCartCount(user.cartCount)
    }
  }, [user, setWishlistCount, setCartCount])

  // -------------------------------------------------------------------------
  // Refresh user profile from server
  // -------------------------------------------------------------------------
  const refreshUser = useCallback(async () => {
    try {
      const updated = await api.get<Personal>('/buyer/profile')
      useAuthStore.getState().setUser(updated, useAuthStore.getState().firebaseUser!)
      setWishlistCount(updated.wishlistCount)
      setCartCount(updated.cartCount)
    } catch {
      // Non-critical — stale data is acceptable
    }
  }, [setWishlistCount, setCartCount])

  // -------------------------------------------------------------------------
  // Section toggle
  // -------------------------------------------------------------------------
  const toggleSection = useCallback((section: Section) => {
    setActiveSection((prev) => (prev === section ? null : section))
  }, [])

  // -------------------------------------------------------------------------
  // Sign out (Req 16.10)
  // -------------------------------------------------------------------------
  const handleSignOut = useCallback(async () => {
    setSigningOut(true)
    try {
      await signOut()
    } finally {
      setSigningOut(false)
    }
  }, [signOut])

  // -------------------------------------------------------------------------
  // Account deletion (Req 16.11)
  // -------------------------------------------------------------------------
  const handleDeleteAccount = useCallback(async () => {
    const confirmed = window.confirm(
      'Are you sure you want to permanently delete your account?\n\n' +
        'This will remove all your data including orders, chat history, and profile information. ' +
        'This action cannot be undone.',
    )
    if (!confirmed) return

    setDeletingAccount(true)
    try {
      await api.delete('/buyer/account')
      await signOut()
      router.push('/')
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Failed to delete account'
      addToast({ id: Date.now().toString(), message, type: 'error' })
    } finally {
      setDeletingAccount(false)
    }
  }, [signOut, router, addToast])

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------
  if (!user) {
    return (
      <main className="flex items-center justify-center min-h-screen">
        <Loader2 size={32} className="animate-spin text-blue-600" aria-label="Loading profile…" />
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50 pb-24">
      {/* ------------------------------------------------------------------ */}
      {/* Profile stats header                                                */}
      {/* ------------------------------------------------------------------ */}
      <div className="bg-white border-b border-gray-100">
        <ProfileStats onImageUploaded={refreshUser} />

        {/* Edit Profile toggle */}
        <div className="px-4 pb-4">
          <button
            type="button"
            onClick={() => toggleSection('edit')}
            aria-expanded={activeSection === 'edit'}
            className={[
              'w-full min-h-[44px] px-4 py-2.5 rounded-xl text-sm font-semibold',
              'border transition-colors',
              'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600',
              activeSection === 'edit'
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-blue-600 border-blue-600 hover:bg-blue-50',
            ].join(' ')}
          >
            {activeSection === 'edit' ? 'Cancel Editing' : 'Edit Profile'}
          </button>
        </div>

        {/* Inline edit form (Req 16.2) */}
        {activeSection === 'edit' && (
          <div className="border-t border-gray-100">
            <EditProfileForm
              user={user}
              onSaved={() => {
                setActiveSection(null)
                refreshUser()
              }}
              onCancel={() => setActiveSection(null)}
            />
          </div>
        )}
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Collapsible sections                                                */}
      {/* ------------------------------------------------------------------ */}
      <div className="px-4 py-4 space-y-3 max-w-2xl mx-auto">

        {/* Address Management (Req 16.6–16.8, 28.1–28.7) */}
        <div className="rounded-xl overflow-hidden border border-gray-200 bg-white">
          <SectionToggle
            label="Address Management"
            open={activeSection === 'address'}
            onToggle={() => toggleSection('address')}
          />
          {activeSection === 'address' && (
            <div className="p-4 border-t border-gray-100">
              <AddressManager onAddressChanged={refreshUser} />
            </div>
          )}
        </div>

        {/* My Wishlist (Req 29.4–29.5) */}
        <div className="rounded-xl overflow-hidden border border-gray-200 bg-white">
          <SectionToggle
            label="My Wishlist"
            open={activeSection === 'wishlist'}
            onToggle={() => toggleSection('wishlist')}
          />
          {activeSection === 'wishlist' && (
            <div className="p-4 border-t border-gray-100">
              <WishlistGrid />
            </div>
          )}
        </div>

        {/* Notification Settings (Req 19.5) */}
        <div className="rounded-xl overflow-hidden border border-gray-200 bg-white">
          <SectionToggle
            label="Notification Settings"
            open={activeSection === 'notifications'}
            onToggle={() => toggleSection('notifications')}
            icon={<Bell size={16} aria-hidden="true" />}
          />
          {activeSection === 'notifications' && (
            <div className="border-t border-gray-100">
              <NotificationToggle />
            </div>
          )}
        </div>

        {/* ---------------------------------------------------------------- */}
        {/* Danger zone                                                       */}
        {/* ---------------------------------------------------------------- */}
        <div className="rounded-xl overflow-hidden border border-gray-200 bg-white divide-y divide-gray-100">

          {/* Sign Out (Req 16.10) */}
          <button
            type="button"
            onClick={handleSignOut}
            disabled={signingOut || deletingAccount}
            className={[
              'w-full flex items-center gap-3 px-4 py-4',
              'text-sm font-medium text-gray-700',
              'hover:bg-gray-50 transition-colors',
              'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600',
              'disabled:opacity-50',
            ].join(' ')}
          >
            {signingOut ? (
              <Loader2 size={18} className="animate-spin text-gray-400" aria-hidden="true" />
            ) : (
              <LogOut size={18} className="text-gray-400" aria-hidden="true" />
            )}
            {signingOut ? 'Signing out…' : 'Sign Out'}
          </button>

          {/* Account Deletion (Req 16.11) */}
          <button
            type="button"
            onClick={handleDeleteAccount}
            disabled={signingOut || deletingAccount}
            className={[
              'w-full flex items-center gap-3 px-4 py-4',
              'text-sm font-medium text-red-600',
              'hover:bg-red-50 transition-colors',
              'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-500',
              'disabled:opacity-50',
            ].join(' ')}
          >
            {deletingAccount ? (
              <Loader2 size={18} className="animate-spin text-red-400" aria-hidden="true" />
            ) : (
              <Trash2 size={18} aria-hidden="true" />
            )}
            {deletingAccount ? 'Deleting account…' : 'Delete Account'}
          </button>
        </div>

        {/* App version note */}
        <p className="text-center text-xs text-gray-400 pt-2">
          DownXtown Buyer App
        </p>
      </div>
    </main>
  )
}
