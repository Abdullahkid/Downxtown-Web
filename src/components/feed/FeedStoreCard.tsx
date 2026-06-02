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
import { Star, ChevronRight } from 'lucide-react'
import { ImageLoader } from '@/components/shared'
import { InstantLink } from '@/components/shared/InstantLink'
import { MiniProductCard } from './MiniProductCard'
import { api } from '@/lib/api/apiClient'
import { logStoreClick, logFollowStore } from '@/lib/analytics/analyticsProvider'
import type { FeedStore } from '@/types/feed'

interface FeedStoreCardProps {
  store: FeedStore
}

export function FeedStoreCard({ store }: FeedStoreCardProps) {
  // Local optimistic follow state — starts from server value
  const [isFollowing, setIsFollowing] = useState(store.isFollowing)
  const [isFollowLoading, setIsFollowLoading] = useState(false)

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

  return (
    <article
      className={[
        'bg-bg-3 rounded-[16px] shadow-sm border border-border',
        'overflow-hidden transition-all duration-200',
        'hover:border-border-accent hover:-translate-y-[2px] relative group'
      ].join(' ')}
      aria-label={`${store.storeName} store card`}
    >
      {/* Glow effect on hover */}
      <div className="absolute inset-0 rounded-[16px] bg-gradient-to-br from-brand/5 to-brand-accent/5 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity" />

      {/* Brand Cover Placeholder */}
      <div className="h-[65px] bg-bg-4 relative overflow-hidden pattern-2">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-bg-3/80" />
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Store header — Link for instant prefetch navigation (Req 7.7)       */}
      {/* Analytics fires as a non-blocking side effect on click              */}
      {/* ------------------------------------------------------------------ */}
      <InstantLink
        href={`/store/${store.storeUsername}`}
        className="relative z-10 w-full flex items-start gap-3 px-3 pb-3"
        aria-label={`Visit ${store.storeName} store`}
        onClick={() => logStoreClick({
          store_id: store.businessId,
          store_username: store.storeUsername,
        })}
      >
        {/* Store logo - overlapping cover */}
        <div className="flex-shrink-0 w-[52px] h-[52px] rounded-[14px] overflow-hidden bg-white border-2 border-bg-3 -mt-[26px] p-[5px] flex items-center justify-center relative">
          <ImageLoader
            imageId={store.storeLogo}
            endpoint="display"
            alt={`${store.storeName} logo`}
            fill
            imageContext="store"
            objectFit="contain"
            sizes="48px"
          />
          {/* Fallback if no image */}
          {!store.storeLogo && (
             <span className="font-display text-lg text-brand uppercase tracking-wider">
               {store.storeName.substring(0, 2)}
             </span>
          )}
        </div>

        {/* Store info */}
        <div className="flex-1 min-w-0 pt-2">
          <div className="flex items-center gap-2 min-w-0">
            <p className="text-[16px] font-semibold text-text-1 truncate">
              {store.storeName}
            </p>
            {/* Single star + rating — only shown when rating > 0 */}
            {store.storeRating > 0 && (
              <span
                className="flex items-center gap-0.5 flex-shrink-0 text-[11px] font-medium text-text-2"
                aria-label={`${store.storeRating.toFixed(1)} out of 5`}
              >
                <Star size={11} className="fill-amber-400 text-amber-400" aria-hidden="true" />
                {store.storeRating.toFixed(1)}
              </span>
            )}
          </div>
          <p className="text-[12px] text-text-3 truncate mt-0.5">@{store.storeUsername}</p>
        </div>

        {/* Follow / Unfollow button (Req 7.10, 7.11) */}
        <button
          type="button"
          aria-label={isFollowing ? `Unfollow ${store.storeName}` : `Follow ${store.storeName}`}
          aria-pressed={isFollowing}
          disabled={isFollowLoading}
          onClick={handleFollowToggle}
          className={[
            'flex-shrink-0 flex items-center gap-1.5 mt-2',
            'px-4 py-[7px] rounded-full text-[12px] font-semibold tracking-wide font-sans',
            'border transition-colors whitespace-nowrap',
            'focus-visible:outline focus-visible:outline-2',
            'focus-visible:outline-offset-2 focus-visible:outline-brand',
            'disabled:opacity-60 disabled:cursor-not-allowed',
            isFollowing
              ? 'bg-brand border-brand text-white'
              : 'bg-transparent border-border-accent text-brand hover:bg-brand-accent/10',
          ].join(' ')}
        >
          {isFollowing ? (
            'Following'
          ) : (
            'Follow'
          )}
        </button>
      </InstantLink>

      {/* ------------------------------------------------------------------ */}
      {/* Horizontal scrollable product row (Req 7.6)                         */}
      {/* ------------------------------------------------------------------ */}
      {store.recentProducts.length > 0 ? (
        <div
          className="pb-4 relative z-10"
          role="region"
          aria-label={`${store.storeName} recent products`}
        >
          <div
            className={[
              // px-3 tighter internal padding; pr-[10vw] on mobile creates the
              // intentional peek of the 3rd card, signalling the row is scrollable.
              // On md+ the container is wider so a fixed pr-3 is fine.
              'flex gap-3 px-3 pr-[10vw] md:pr-3 pb-1 overflow-x-auto',
              'scrollbar-hide',
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
          <p className="text-[12px] text-text-3 italic">No products yet</p>
        </div>
      )}

      {/* See all products — navigates to store profile */}
      <InstantLink
        href={`/store/${store.storeUsername}`}
        className={[
          'relative z-10 flex items-center justify-center gap-1 py-2.5',
          'border-t border-border text-xs font-medium text-brand',
          'hover:bg-brand-accent/5 transition-colors rounded-b-[16px]',
          'focus-visible:outline focus-visible:outline-2',
          'focus-visible:outline-offset-2 focus-visible:outline-brand',
        ].join(' ')}
        aria-label={`See all products from ${store.storeName}`}
        onClick={(e) => e.stopPropagation()}
      >
        See all products
        <ChevronRight size={13} aria-hidden="true" />
      </InstantLink>
    </article>
  )
}
