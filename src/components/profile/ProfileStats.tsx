'use client'

/**
 * ProfileStats — displays the buyer's profile image, name, @username,
 * and activity stats (following, purchases, wishlist, cart).
 *
 * Clicking the profile image opens a file-input dialog for uploading
 * a new profile photo.
 *
 * Requirements: 16.1, 16.2, 16.3, 29.1
 */

import React, { useRef, useState, useCallback } from 'react'
import { Camera, ShoppingBag, Heart, ShoppingCart, Users } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useUiStore } from '@/store/uiStore'
import { ImageLoader } from '@/components/shared'
import { api, ApiError } from '@/lib/api/apiClient'

interface ProfileStatsProps {
  /** Called after a successful profile image upload so the parent can refresh user data. */
  onImageUploaded?: () => void
}

export function ProfileStats({ onImageUploaded }: ProfileStatsProps) {
  const { user } = useAuthStore()
  const { wishlistCount, cartCount } = useUiStore()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

  // -------------------------------------------------------------------------
  // Profile image upload (Req 16.3)
  // -------------------------------------------------------------------------
  const handleImageClick = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file) return

      setUploading(true)
      setUploadError(null)

      try {
        const formData = new FormData()
        formData.append('image', file)

        // Upload image — the server returns the new imageId
        const { imageId } = await api.post<{ imageId: string }>(
          '/buyer/profile/image',
          formData,
        )

        // Persist the new imageId on the profile
        await api.put('/buyer/profile', { profileImageId: imageId })

        onImageUploaded?.()
      } catch (err) {
        const message =
          err instanceof ApiError ? err.message : 'Failed to upload image'
        setUploadError(message)
      } finally {
        setUploading(false)
        // Reset input so the same file can be re-selected
        if (fileInputRef.current) fileInputRef.current.value = ''
      }
    },
    [onImageUploaded],
  )

  if (!user) return null

  const stats = [
    {
      label: 'Following',
      value: user.followingCount,
      icon: <Users size={18} aria-hidden="true" />,
    },
    {
      label: 'Purchases',
      value: user.purchaseCount,
      icon: <ShoppingBag size={18} aria-hidden="true" />,
    },
    {
      label: 'Wishlist',
      value: wishlistCount,
      icon: <Heart size={18} aria-hidden="true" />,
    },
    {
      label: 'Cart',
      value: cartCount,
      icon: <ShoppingCart size={18} aria-hidden="true" />,
    },
  ]

  return (
    <section aria-label="Profile overview" className="flex flex-col items-center gap-4 py-6 px-4">
      {/* Profile image */}
      <div className="relative">
        <button
          type="button"
          aria-label="Change profile photo"
          onClick={handleImageClick}
          disabled={uploading}
          className={[
            'relative w-24 h-24 rounded-full overflow-hidden',
            'ring-2 ring-offset-2 ring-blue-500',
            'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-600',
            'transition-opacity',
            uploading ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer hover:opacity-90',
          ].join(' ')}
        >
          {user.profileImageId ? (
            <ImageLoader
              imageId={user.profileImageId}
              endpoint="display"
              alt={`${user.name}'s profile photo`}
              fill
              imageContext="store"
              sizes="96px"
            />
          ) : (
            /* Fallback avatar with initials */
            <div
              className="w-full h-full flex items-center justify-center bg-blue-100 text-blue-700 text-2xl font-bold select-none"
              aria-hidden="true"
            >
              {user.name.charAt(0).toUpperCase()}
            </div>
          )}

          {/* Camera overlay */}
          <div
            className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 hover:opacity-100 transition-opacity"
            aria-hidden="true"
          >
            <Camera size={22} className="text-white" />
          </div>
        </button>

        {/* Upload spinner */}
        {uploading && (
          <div
            className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40"
            aria-live="polite"
            aria-label="Uploading photo…"
          >
            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="sr-only"
        aria-hidden="true"
        tabIndex={-1}
        onChange={handleFileChange}
      />

      {/* Upload error */}
      {uploadError && (
        <p role="alert" className="text-sm text-red-600 text-center">
          {uploadError}
        </p>
      )}

      {/* Name and username */}
      <div className="text-center">
        <h1 className="text-xl font-bold text-gray-900">{user.name}</h1>
        <p className="text-sm text-gray-500 mt-0.5">@{user.username}</p>
      </div>

      {/* Stats row */}
      <div
        className="flex items-center justify-center gap-6 w-full max-w-sm"
        role="list"
        aria-label="Profile statistics"
      >
        {stats.map(({ label, value, icon }) => (
          <div
            key={label}
            role="listitem"
            className="flex flex-col items-center gap-1"
          >
            <div className="text-blue-600">{icon}</div>
            <span className="text-lg font-bold text-gray-900 leading-none">
              {value.toLocaleString('en-IN')}
            </span>
            <span className="text-xs text-gray-500">{label}</span>
          </div>
        ))}
      </div>
    </section>
  )
}
