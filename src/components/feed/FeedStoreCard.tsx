'use client'

/**
 * FeedStoreCard — store card displayed in the home feed infinite-scroll list.
 *
 * Features:
 *  - Store logo (display endpoint), name, @username, star rating
 *  - Follow / Unfollow button with optimistic update (reverts on API error)
 *  - Horizontal scrollable MiniProductCard row
 *  - Tap on header navigates to /store/{storeUsername}
 *  - Logs store_click and follow_store analytics events
 *
 * Requirements: 7.6, 7.7, 7.10, 7.11, 25.2, 25.6
 */

import React, { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Star, UserPlus, UserCheck } from 'lucide-react'
import { ImageLoader } from '@/components/shared'
import { MiniProductCard } from './MiniProductCard'
import { api } from '@/lib/api/apiClient'
import { logStoreClick, logFollowStore } from '@/lib/analytics/analyticsProvider'
import type { FeedStore } from '@/types/feed'

interface FeedStoreCardProps {
  store: FeedStore
}

export function FeedStoreCard({ store }: FeedStoreCardProps) {
  const router = useRouter()

  // Local optimistic follow state — starts from server value
  const [isFollowing, setIsFollowing] = useState(store.isFollowing)
  const [isFollowLoading, setIsFollowLoading] = useState(false)

  // -------------------------------------------------------------------------
  // Navigate to store profile (Req 7.7)
  // -------------------------------------------------------------------------
  const handleStoreClick = useCallback(() => {
    logStoreClick({
      store_id: store.businessId,
      store_username: store.storeUsername,
    })
    router.push(`/store/${store.storeUsername}`)
  }, [router, store.businessId, store.storeUsername])

  // -------------------------------------------------------------------------
  // Follow / Unfollow with optimistic update (Req 7.10, 7.11)
  // -------------------------------------------------------------------------
  const handleFollowToggle = useCallback(
    async (e: React.MouseEvent) => {
      e.stopPropagation() // Don't trigger store navigation
      if (isFollowLoading) return

      const previousState = isFollowing
      const nextState = !isFollowing

      // Optimistic update
      setIsFollowing(nextState)
      setIsFollowLoading(true)

      try {
        if (nextState) {
          await api.post(`/stores/${store.businessId}/follow`)
          logFollowStore({ store_id: store.businessId })
        } else {
          await api.delete(`/stores/${store.businessId}/follow`)
        }
      } catch {
        // Revert on error
        setIsFollowing(previousState)
      } finally {
        setIsFollowLoading(false)
      }
    },
    [isFollowing, isFollowLoading, store.businessId],
  )

  // -------------------------------------------------------------------------
  // Star rating renderer
  // -------------------------------------------------------------------------
  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating)
    const hasHalf = rating - fullStars >= 0.5
    return (
      <div className="flex items-center gap-0.5" aria-label={`${rating.toFixed(1)} out of 5 stars`}>
        {Array.from({ length: 5 }, (_, i) => {
          const filled = i < fullStars
          const half = !filled && hasHalf && i === fullStars
          return (
            <Star
              key={i}
              size={12}
              aria-hidden="true"
              className={
                filled || half
                  ? 'text-amber-400 fill-amber-400'
                  : 'text-gray-300 fill-gray-300'
              }
            />
          )
        })}
        <span className="ml-1 text-xs text-gray-500">{rating.toFixed(1)}</span>
      </div>
    )
  }

  return (
    <article
      className={[
        'bg-white rounded-2xl shadow-sm border border-gray-100',
        'overflow-hidden',
      ].join(' ')}
      aria-label={`${store.storeName} store card`}
    >
      {/* ------------------------------------------------------------------ */}
      {/* Store header — tappable (Req 7.7)                                   */}
      {/* Use a div with role="button" so we can nest a real <button> inside  */}
      {/* for the follow action without invalid HTML (button-in-button).       */}
      {/* ------------------------------------------------------------------ */}
      <div
        role="button"
        tabIndex={0}
        className={[
          'w-full flex items-center gap-3 px-4 py-3',
          'text-left hover:bg-gray-50 active:bg-gray-100',
          'transition-colors cursor-pointer',
          'focus-visible:outline focus-visible:outline-2',
          'focus-visible:outline-offset-2 focus-visible:outline-blue-600',
        ].join(' ')}
        onClick={handleStoreClick}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            handleStoreClick()
          }
        }}
        aria-label={`Visit ${store.storeName} store`}
      >
        {/* Store logo */}
        <div className="flex-shrink-0 w-12 h-12 rounded-full overflow-hidden bg-white border border-gray-200">
          <ImageLoader
            imageId={store.storeLogo}
            endpoint="display"
            alt={`${store.storeName} logo`}
            fill
            imageContext="store"
            objectFit="contain"
            sizes="48px"
          />
        </div>

        {/* Store info */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900 truncate">
            {store.storeName}
          </p>
          <p className="text-xs text-gray-500 truncate">@{store.storeUsername}</p>
          <div className="mt-0.5">{renderStars(store.storeRating)}</div>
        </div>

        {/* Follow / Unfollow button (Req 7.10, 7.11) */}
        <button
          type="button"
          aria-label={isFollowing ? `Unfollow ${store.storeName}` : `Follow ${store.storeName}`}
          aria-pressed={isFollowing}
          disabled={isFollowLoading}
          onClick={handleFollowToggle}
          className={[
            'flex-shrink-0 flex items-center gap-1.5',
            'min-h-[36px] px-3 py-1.5 rounded-full text-xs font-semibold',
            'border transition-colors',
            'focus-visible:outline focus-visible:outline-2',
            'focus-visible:outline-offset-2 focus-visible:outline-blue-600',
            'disabled:opacity-60 disabled:cursor-not-allowed',
            isFollowing
              ? 'bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200'
              : 'bg-blue-600 border-blue-600 text-white hover:bg-blue-700',
          ].join(' ')}
        >
          {isFollowing ? (
            <>
              <UserCheck size={13} aria-hidden="true" />
              Following
            </>
          ) : (
            <>
              <UserPlus size={13} aria-hidden="true" />
              Follow
            </>
          )}
        </button>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Horizontal scrollable product row (Req 7.6)                         */}
      {/* ------------------------------------------------------------------ */}
      {store.recentProducts.length > 0 ? (
        <div
          className="px-4 pb-4"
          role="region"
          aria-label={`${store.storeName} recent products`}
        >
          <div
            className={[
              'flex gap-3 overflow-x-auto',
              'scrollbar-hide pb-1',
              // Smooth momentum scrolling on iOS
              '[&]:[-webkit-overflow-scrolling:touch]',
            ].join(' ')}
          >
            {store.recentProducts.map((product) => (
              <MiniProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      ) : (
        <div className="px-4 pb-4">
          <p className="text-xs text-gray-400 italic">No products yet</p>
        </div>
      )}
    </article>
  )
}
