'use client'

/**
 * StoreHeader — collapsing banner + logo + store info + action buttons.
 *
 * Behaviour:
 *  - Full banner visible at top of page
 *  - On scroll past the banner, a compact sticky bar slides in showing
 *    store name + action buttons
 *  - Follow/Unfollow: optimistic update via api.post/delete
 *  - Share: Web Share API with clipboard fallback
 *  - Contact: tel: link or WhatsApp deep link
 *  - Message: POST /chat/create then navigate to /chat/[chatRoomId] (Req 3.1–3.8)
 *  - Logs store_click analytics event on mount (Req 25.2)
 *
 * Requirements: 9.1, 9.2, 9.10, 9.11, 9.12, 3.1, 3.2, 3.5, 3.6, 3.7, 3.8
 */

import React, { useEffect, useRef, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  Star,
  UserPlus,
  UserCheck,
  MessageCircle,
  Share2,
  Phone,
  ChevronLeft,
  Search,
  Loader2,
} from 'lucide-react'
import { ImageLoader } from '@/lib/image/imageLoader'
import { api } from '@/lib/api/apiClient'
import { logStoreClick } from '@/lib/analytics/analyticsProvider'
import { useAuthStore } from '@/store/authStore'
import { useUiStore } from '@/store/uiStore'
import type { StoreProfile } from '@/types/store'

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface StoreHeaderProps {
  store: StoreProfile
  /** Called when the user taps the search icon on the banner. */
  onSearchClick?: () => void
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function StarRating({ rating }: { rating: number }) {
  const full = Math.floor(rating)
  const partial = rating - full

  return (
    <span className="flex items-center gap-0.5" aria-label={`${rating.toFixed(1)} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, i) => {
        const fill =
          i < full ? 1 : i === full && partial >= 0.5 ? 0.5 : 0
        return (
          <Star
            key={i}
            size={14}
            aria-hidden="true"
            className={
              fill === 1
                ? 'fill-amber-400 text-amber-400'
                : fill === 0.5
                  ? 'fill-amber-200 text-amber-400'
                  : 'fill-gray-200 text-gray-300'
            }
          />
        )
      })}
      <span className="ml-1 text-xs font-medium text-gray-600">
        {rating.toFixed(1)}
      </span>
    </span>
  )
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function StoreHeader({ store, onSearchClick }: StoreHeaderProps) {
  const router = useRouter()
  const bannerRef = useRef<HTMLDivElement>(null)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isFollowing, setIsFollowing] = useState(store.isFollowing)
  const [followLoading, setFollowLoading] = useState(false)
  const [messageLoading, setMessageLoading] = useState(false)
  const [shareToast, setShareToast] = useState(false)

  const authStatus = useAuthStore((s) => s.status)
  const addToast = useUiStore((s) => s.addToast)

  const isAuthenticated = authStatus === 'authenticated'

  // ── Analytics: log store_click on mount (Req 25.2) ──────────────────────
  useEffect(() => {
    logStoreClick({
      store_id: store.id,
      store_username: store.storeUsername,
    })
  }, [store.id, store.storeUsername])

  // ── Collapsing header via IntersectionObserver (Req 9.2) ─────────────────
  useEffect(() => {
    const banner = bannerRef.current
    if (!banner) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsCollapsed(!entry.isIntersecting)
      },
      { threshold: 0.1 },
    )

    observer.observe(banner)
    return () => observer.disconnect()
  }, [])

  // ── Follow / Unfollow (Req 9.1, optimistic update) ───────────────────────
  const handleFollowToggle = useCallback(async () => {
    if (followLoading) return

    const wasFollowing = isFollowing
    setIsFollowing(!wasFollowing) // optimistic
    setFollowLoading(true)

    try {
      if (wasFollowing) {
        await api.delete(`/stores/${store.id}/follow`)
      } else {
        await api.post(`/stores/${store.id}/follow`)
      }
    } catch {
      // Revert on error
      setIsFollowing(wasFollowing)
    } finally {
      setFollowLoading(false)
    }
  }, [followLoading, isFollowing, store.id])

  // ── Share (Req 9.11) ─────────────────────────────────────────────────────
  const handleShare = useCallback(async () => {
    const url = `https://downxtown.com/store/${store.storeUsername}`
    const shareData = {
      title: store.storeName,
      text: `Check out ${store.storeName} on Downxtown`,
      url,
    }

    try {
      if (typeof navigator !== 'undefined' && navigator.share) {
        await navigator.share(shareData)
      } else {
        await navigator.clipboard.writeText(url)
        setShareToast(true)
        setTimeout(() => setShareToast(false), 2500)
      }
    } catch {
      // User cancelled share or clipboard failed — silently ignore
    }
  }, [store.storeName, store.storeUsername])

  // ── Contact (Req 9.12) ───────────────────────────────────────────────────
  const handleContact = useCallback(() => {
    const phone = store.whatsappNumber ?? store.phoneNumber
    if (!phone) return

    if (store.whatsappNumber) {
      const cleaned = phone.replace(/\D/g, '')
      window.open(`https://wa.me/${cleaned}`, '_blank', 'noopener,noreferrer')
    } else {
      window.location.href = `tel:${phone}`
    }
  }, [store.phoneNumber, store.whatsappNumber])

  // ── Message (Req 3.1, 3.2, 3.5, 3.6, 3.7, 3.8) ──────────────────────────
  const handleMessage = useCallback(async () => {
    if (messageLoading) return
    setMessageLoading(true)
    try {
      const { chatRoomId } = await api.post<{ chatRoomId: string }>('/chat/create', {
        targetUserId: store.id,
        targetUserType: 'BUSINESS',
      })
      router.push(`/chat/${chatRoomId}`)
    } catch {
      addToast({
        id: `msg-err-${Date.now()}`,
        message: 'Could not start a chat. Please try again.',
        type: 'error',
      })
    } finally {
      setMessageLoading(false)
    }
  }, [messageLoading, store.id, router, addToast])

  const hasContact = !!(store.phoneNumber || store.whatsappNumber)

  // ── Action buttons (shared between full and compact bar) ─────────────────
  const ActionButtons = ({ compact = false }: { compact?: boolean }) => (
    <div className={`flex items-center gap-2 ${compact ? '' : 'mt-3'}`}>
      {/* Follow / Unfollow */}
      <button
        type="button"
        onClick={handleFollowToggle}
        disabled={followLoading}
        aria-label={isFollowing ? 'Unfollow store' : 'Follow store'}
        className={[
          'flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium',
          'min-h-[44px] transition-colors',
          'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2',
          isFollowing
            ? 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus-visible:outline-gray-400'
            : 'bg-[var(--brand-color,#6366f1)] text-white hover:opacity-90 focus-visible:outline-[var(--brand-color,#6366f1)]',
          followLoading ? 'opacity-60 cursor-not-allowed' : '',
        ].join(' ')}
      >
        {isFollowing ? (
          <UserCheck size={16} aria-hidden="true" />
        ) : (
          <UserPlus size={16} aria-hidden="true" />
        )}
        {!compact && (isFollowing ? 'Following' : 'Follow')}
      </button>

      {/* Message — visible only to authenticated buyers (Req 3.7) */}
      {isAuthenticated && (
        <button
          type="button"
          onClick={handleMessage}
          disabled={messageLoading}
          aria-label="Message store"
          className={[
            'flex items-center justify-center rounded-full',
            'min-h-[44px] min-w-[44px] border border-gray-300 bg-white text-gray-700',
            'hover:bg-gray-50 active:bg-gray-100 transition-colors',
            'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-400',
            messageLoading ? 'opacity-60 cursor-not-allowed' : '',
          ].join(' ')}
        >
          {messageLoading ? (
            <Loader2 size={18} aria-hidden="true" className="animate-spin" />
          ) : (
            <MessageCircle size={18} aria-hidden="true" />
          )}
        </button>
      )}

      {/* Share */}
      <button
        type="button"
        onClick={handleShare}
        aria-label="Share store"
        className={[
          'flex items-center justify-center rounded-full',
          'min-h-[44px] min-w-[44px] border border-gray-300 bg-white text-gray-700',
          'hover:bg-gray-50 active:bg-gray-100 transition-colors',
          'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-400',
        ].join(' ')}
      >
        <Share2 size={18} aria-hidden="true" />
      </button>

      {/* Contact */}
      {hasContact && (
        <button
          type="button"
          onClick={handleContact}
          aria-label="Contact store"
          className={[
            'flex items-center justify-center rounded-full',
            'min-h-[44px] min-w-[44px] border border-gray-300 bg-white text-gray-700',
            'hover:bg-gray-50 active:bg-gray-100 transition-colors',
            'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-400',
          ].join(' ')}
        >
          <Phone size={18} aria-hidden="true" />
        </button>
      )}
    </div>
  )

  return (
    <>
      {/* ── Compact sticky bar (visible when banner scrolled out) ── */}
      <div
        role="banner"
        aria-label="Store navigation bar"
        className={[
          'fixed left-0 right-0 top-0 z-50',
          'flex items-center justify-between gap-3 px-4',
          'h-14 border-b border-gray-200 bg-white',
          'transition-transform duration-200',
          isCollapsed ? 'translate-y-0' : '-translate-y-full',
        ].join(' ')}
      >
        <div className="flex items-center gap-2 min-w-0">
          <button
            type="button"
            onClick={() => router.back()}
            aria-label="Go back"
            className="flex items-center justify-center rounded-full h-10 w-10 text-gray-700 hover:bg-gray-100 transition-colors shrink-0"
          >
            <ChevronLeft size={22} aria-hidden="true" />
          </button>

          {store.logoImageId && (
            <div className="h-8 w-8 shrink-0 overflow-hidden rounded-full border border-gray-200 bg-white">
              <ImageLoader
                imageId={store.logoImageId}
                endpoint="display"
                alt={`${store.storeName} logo`}
                fill
                imageContext="store"
                objectFit="contain"
                sizes="32px"
              />
            </div>
          )}

          <span className="truncate text-sm font-semibold text-gray-900">
            {store.storeName}
          </span>
        </div>

        <ActionButtons compact />
      </div>

      {/* ── Full header (scrolls with page) ── */}
      <div className="relative">
        {/* Back button overlay on banner */}
        <div className="absolute left-4 top-4 z-10">
          <button
            type="button"
            onClick={() => router.back()}
            aria-label="Go back"
            className={[
              'flex items-center justify-center rounded-full',
              'h-10 w-10 bg-black/40 text-white backdrop-blur-sm',
              'hover:bg-black/60 transition-colors',
            ].join(' ')}
          >
            <ChevronLeft size={22} aria-hidden="true" />
          </button>
        </div>

        {/* Search button overlay on banner */}
        <div className="absolute right-4 top-4 z-10">
          <button
            type="button"
            onClick={onSearchClick}
            aria-label="Search store products"
            className={[
              'flex items-center justify-center rounded-full',
              'h-10 w-10 bg-black/40 text-white backdrop-blur-sm',
              'hover:bg-black/60 transition-colors',
            ].join(' ')}
          >
            <Search size={20} aria-hidden="true" />
          </button>
        </div>

        {/* Banner image */}
        <div
          ref={bannerRef}
          className="relative h-48 w-full overflow-hidden bg-gray-100 md:h-64"
        >
          {store.bannerImageId ? (
            <ImageLoader
              imageId={store.bannerImageId}
              endpoint="banner"
              alt={`${store.storeName} banner`}
              fill
              priority
              imageContext="banner"
              sizes="100vw"
            />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-[var(--brand-color,#6366f1)] to-[var(--brand-color-dark,#4f46e5)]" />
          )}
        </div>

        {/* Store info card */}
        <div className="relative px-4 pb-4">
          {/* Logo — overlaps banner */}
          <div className="relative -mt-10 mb-3 h-20 w-20 overflow-hidden rounded-2xl border-4 border-white bg-white shadow-md">
            {store.logoImageId ? (
              <ImageLoader
                imageId={store.logoImageId}
                endpoint="display"
                alt={`${store.storeName} logo`}
                fill
                priority
                imageContext="store"
                objectFit="contain"
                sizes="80px"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gray-100 text-2xl font-bold text-gray-400">
                {store.storeName.charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          {/* Name + username */}
          <h1 className="text-xl font-bold text-gray-900 leading-tight">
            {store.storeName}
          </h1>
          <p className="text-sm text-gray-500">@{store.storeUsername}</p>

          {/* Rating */}
          <div className="mt-1.5 flex items-center gap-3">
            <StarRating rating={store.averageRating} />
            {store.totalReviews > 0 && (
              <span className="text-xs text-gray-400">
                ({store.totalReviews.toLocaleString('en-IN')} reviews)
              </span>
            )}
          </div>

          {/* Follower / product counts */}
          <div className="mt-2 flex items-center gap-4 text-xs text-gray-500">
            <span>
              <strong className="font-semibold text-gray-800">
                {store.followerCount.toLocaleString('en-IN')}
              </strong>{' '}
              followers
            </span>
            <span>
              <strong className="font-semibold text-gray-800">
                {store.productCount.toLocaleString('en-IN')}
              </strong>{' '}
              products
            </span>
          </div>

          {/* Description */}
          {store.description && (
            <p className="mt-2 text-sm text-gray-600 line-clamp-3">
              {store.description}
            </p>
          )}

          {/* Action buttons */}
          <ActionButtons />
        </div>
      </div>

      {/* Share toast */}
      {shareToast && (
        <div
          role="status"
          aria-live="polite"
          className={[
            'fixed bottom-24 left-1/2 z-50 -translate-x-1/2',
            'rounded-full bg-gray-900 px-4 py-2 text-sm text-white shadow-lg',
            'pointer-events-none',
          ].join(' ')}
        >
          Link copied to clipboard
        </div>
      )}
    </>
  )
}
