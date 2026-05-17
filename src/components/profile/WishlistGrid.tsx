'use client'

/**
 * WishlistGrid — fetches the buyer's wishlist and renders a 2-column grid
 * of MiniProductCard components, each with a remove button.
 *
 * Requirements: 29.4, 29.5, 6.4, 6.5
 */

import React, { useState, useEffect, useCallback } from 'react'
import { Heart, Loader2, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { api, ApiError } from '@/lib/api/apiClient'
import { MiniProductCard } from '@/components/feed/MiniProductCard'
import { EmptyState } from '@/components/shared'
import { Button } from '@/components/ui'
import { useUiStore } from '@/store/uiStore'
import type { MiniProduct } from '@/types/product'

export function WishlistGrid() {
  const router = useRouter()
  const [products, setProducts] = useState<MiniProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [removingId, setRemovingId] = useState<string | null>(null)
  const { setWishlistCount } = useUiStore()

  // -------------------------------------------------------------------------
  // Fetch wishlist
  // -------------------------------------------------------------------------
  const fetchWishlist = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await api.get<MiniProduct[]>('/buyer/wishlist')
      setProducts(data ?? [])
      setWishlistCount(data?.length ?? 0)
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Failed to load wishlist'
      setError(message)
    } finally {
      setLoading(false)
    }
  }, [setWishlistCount])

  useEffect(() => {
    fetchWishlist()
  }, [fetchWishlist])

  // -------------------------------------------------------------------------
  // Remove from wishlist (Req 29.4)
  // -------------------------------------------------------------------------
  const handleRemove = useCallback(
    async (productId: string) => {
      setRemovingId(productId)
      try {
        await api.delete(`/buyer/wishlist/${productId}`)
        setProducts((prev) => {
          const updated = prev.filter((p) => p.id !== productId)
          setWishlistCount(updated.length)
          return updated
        })
      } catch {
        // Silently ignore — item stays in list; user can retry
      } finally {
        setRemovingId(null)
      }
    },
    [setWishlistCount],
  )

  // -------------------------------------------------------------------------
  // Render states
  // -------------------------------------------------------------------------
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12" aria-live="polite" aria-label="Loading wishlist…">
        <Loader2 size={28} className="animate-spin text-blue-600" aria-hidden="true" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center gap-3 py-8 text-center">
        <p className="text-sm text-red-600">{error}</p>
        <button
          type="button"
          onClick={fetchWishlist}
          className="min-h-[44px] px-5 py-2.5 rounded-lg bg-blue-600 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
        >
          Retry
        </button>
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 py-10 text-center">
        <Heart
          size={48}
          strokeWidth={1.5}
          className="text-gray-300"
          aria-hidden="true"
        />
        <p className="text-sm text-gray-500">No items in your wishlist yet</p>
        <Button
          variant="secondary"
          onClick={() => router.push('/')}
        >
          Browse Products
        </Button>
      </div>
    )
  }

  return (
    <section aria-label="My Wishlist">
      {/* 2-column grid (Req 29.4) */}
      <ul
        className="grid grid-cols-2 gap-3"
        aria-label={`${products.length} wishlist item${products.length !== 1 ? 's' : ''}`}
      >
        {products.map((product) => (
          <li key={product.id} className="relative">
            <MiniProductCard product={product} />

            {/* Remove button */}
            <button
              type="button"
              aria-label={`Remove ${product.name} from wishlist`}
              onClick={() => handleRemove(product.id)}
              disabled={removingId === product.id}
              className={[
                'absolute top-1.5 right-1.5 z-10',
                'flex items-center justify-center',
                'w-8 h-8 rounded-full bg-white/90 shadow-sm',
                'text-red-500 hover:text-red-700 hover:bg-white',
                'transition-colors disabled:opacity-50',
                'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-500',
              ].join(' ')}
            >
              {removingId === product.id ? (
                <Loader2 size={14} className="animate-spin" aria-hidden="true" />
              ) : (
                <Trash2 size={14} aria-hidden="true" />
              )}
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
}
