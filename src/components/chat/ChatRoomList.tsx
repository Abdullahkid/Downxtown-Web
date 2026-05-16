'use client'

/**
 * ChatRoomList — displays all ChatRooms sorted by last message timestamp.
 *
 * - Fetches from `GET /chat/rooms`; falls back to `cacheStore.getChatRooms()` on error.
 * - Sorts rooms by `lastMessage.timestamp` descending (most recent first).
 * - Shows seller name, profile image, last message preview, and unread badge.
 *
 * Requirements: 15.1, 18.1, 18.2
 */

import React, { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { MessageCircle } from 'lucide-react'
import { api } from '@/lib/api/apiClient'
import { cacheStore } from '@/lib/cache/cacheStore'
import { ImageLoader } from '@/components/shared/ImageLoader'
import { ShimmerCard } from '@/components/shared/ShimmerCard'
import { EmptyState } from '@/components/shared/EmptyState'
import type { ChatRoom } from '@/types/chat'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function sortRoomsByLastMessage(rooms: ChatRoom[]): ChatRoom[] {
  return [...rooms].sort((a, b) => {
    const ta = a.lastMessage?.timestamp ?? 0
    const tb = b.lastMessage?.timestamp ?? 0
    return tb - ta
  })
}

function formatTimestamp(ts: number): string {
  const now = Date.now()
  const diff = now - ts
  const minutes = Math.floor(diff / 60_000)
  const hours = Math.floor(diff / 3_600_000)
  const days = Math.floor(diff / 86_400_000)

  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m`
  if (hours < 24) return `${hours}h`
  if (days < 7) return `${days}d`
  return new Date(ts).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

function truncatePreview(text: string | undefined, maxLen = 40): string {
  if (!text) return ''
  return text.length > maxLen ? text.slice(0, maxLen) + '…' : text
}

function getLastMessagePreview(room: ChatRoom): string {
  const msg = room.lastMessage
  if (!msg) return 'No messages yet'
  switch (msg.type) {
    case 'TEXT':
      return truncatePreview(msg.text)
    case 'IMAGE':
      return '📷 Image'
    case 'SHARED_PRODUCT':
      return '🛍️ Shared a product'
    case 'SHARED_STORE':
      return '🏪 Shared a store'
    default:
      return ''
  }
}

// ---------------------------------------------------------------------------
// Shimmer skeleton
// ---------------------------------------------------------------------------

function RoomSkeleton() {
  return (
    <div className="flex items-center gap-3 px-4 py-3" aria-hidden="true">
      <ShimmerCard width={48} height={48} className="rounded-full flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <ShimmerCard width="60%" height={14} />
        <ShimmerCard width="80%" height={12} />
      </div>
      <ShimmerCard width={32} height={12} />
    </div>
  )
}

// ---------------------------------------------------------------------------
// Room row
// ---------------------------------------------------------------------------

interface RoomRowProps {
  room: ChatRoom
}

function RoomRow({ room }: RoomRowProps) {
  const preview = getLastMessagePreview(room)
  const ts = room.lastMessage?.timestamp

  return (
    <Link
      href={`/chat/${room.id}`}
      className={[
        'flex items-center gap-3 px-4 py-3',
        'hover:bg-gray-50 active:bg-gray-100',
        'transition-colors focus-visible:outline-none focus-visible:ring-2',
        'focus-visible:ring-blue-500 focus-visible:ring-inset',
      ].join(' ')}
      aria-label={`Chat with ${room.sellerName}${room.unreadCount > 0 ? `, ${room.unreadCount} unread` : ''}`}
    >
      {/* Seller avatar */}
      <div className="relative flex-shrink-0">
        {room.sellerLogoId ? (
          <ImageLoader
            imageId={room.sellerLogoId}
            endpoint="display"
            alt={`${room.sellerName} logo`}
            width={48}
            height={48}
            className="rounded-full object-cover"
            imageContext="store"
          />
        ) : (
          <div
            className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-lg font-semibold"
            aria-hidden="true"
          >
            {room.sellerName.charAt(0).toUpperCase()}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline justify-between gap-2">
          <span
            className={[
              'text-sm font-semibold truncate',
              room.unreadCount > 0 ? 'text-gray-900' : 'text-gray-700',
            ].join(' ')}
          >
            {room.sellerName}
          </span>
          {ts != null && (
            <span className="text-xs text-gray-400 flex-shrink-0">
              {formatTimestamp(ts)}
            </span>
          )}
        </div>
        <p
          className={[
            'text-sm truncate mt-0.5',
            room.unreadCount > 0 ? 'text-gray-800 font-medium' : 'text-gray-500',
          ].join(' ')}
        >
          {preview}
        </p>
      </div>

      {/* Unread badge */}
      {room.unreadCount > 0 && (
        <span
          className={[
            'flex-shrink-0 min-w-[20px] h-5 px-1.5',
            'rounded-full bg-blue-600 text-white text-xs font-bold',
            'flex items-center justify-center',
          ].join(' ')}
          aria-label={`${room.unreadCount} unread messages`}
        >
          {room.unreadCount > 99 ? '99+' : room.unreadCount}
        </span>
      )}
    </Link>
  )
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function ChatRoomList() {
  const [rooms, setRooms] = useState<ChatRoom[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchRooms = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await api.get<ChatRoom[]>('/chat/rooms')
      const sorted = sortRoomsByLastMessage(data)
      setRooms(sorted)
      // Update cache for offline fallback (Req 18.1)
      await cacheStore.setChatRooms(sorted)
    } catch {
      // Offline fallback (Req 18.2)
      try {
        const cached = await cacheStore.getChatRooms()
        setRooms(sortRoomsByLastMessage(cached))
        if (cached.length === 0) {
          setError('Could not load chats. Check your connection.')
        }
      } catch {
        setError('Could not load chats. Check your connection.')
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchRooms()
  }, [fetchRooms])

  if (loading) {
    return (
      <div role="status" aria-label="Loading chats…">
        {Array.from({ length: 5 }).map((_, i) => (
          <RoomSkeleton key={i} />
        ))}
      </div>
    )
  }

  if (error && rooms.length === 0) {
    return (
      <EmptyState
        icon={<MessageCircle size={48} strokeWidth={1.5} />}
        heading="Could not load chats"
        body={error}
        ctaLabel="Retry"
        onCta={fetchRooms}
      />
    )
  }

  if (rooms.length === 0) {
    return (
      <EmptyState
        icon={<MessageCircle size={48} strokeWidth={1.5} />}
        heading="No conversations yet"
        body="Start a chat by visiting a store and tapping the Message button."
      />
    )
  }

  return (
    <div role="list" aria-label="Chat conversations">
      {rooms.map((room) => (
        <div key={room.id} role="listitem">
          <RoomRow room={room} />
          <div className="mx-4 border-b border-gray-100" aria-hidden="true" />
        </div>
      ))}
    </div>
  )
}
