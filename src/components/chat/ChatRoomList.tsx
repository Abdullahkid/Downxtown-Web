'use client'

/**
 * ChatRoomList — displays all ChatRooms sorted by last message timestamp.
 *
 * - Fetches from `GET /chat/rooms`; falls back to `cacheStore.getChatRooms()` on error.
 * - Sorts rooms by `lastMessageTime` descending (most recent first).
 * - Displays the first "other participant" returned by the backend (buyer excluded server-side).
 *
 * Requirements: 15.1, 18.1, 18.2
 */

import React, { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { MessageCircle } from 'lucide-react'
import { api } from '@/lib/api/apiClient'
import { cacheStore } from '@/lib/cache/cacheStore'
import { ImageLoader } from '@/components/shared/ImageLoader'
import { ShimmerCard } from '@/components/shared/ShimmerCard'
import { EmptyState } from '@/components/shared/EmptyState'
import { useAuthStore } from '@/store/authStore'
import type { ChatListResponse, ChatRoomDto, ParticipantInfo } from '@/types/chat'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function sortRoomsByLastMessage(rooms: ChatRoomDto[]): ChatRoomDto[] {
  return [...rooms].sort((a, b) => {
    const ta = a.lastMessageTime ?? 0
    const tb = b.lastMessageTime ?? 0
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
  return text.length > maxLen ? text.slice(0, maxLen) + '...' : text
}

function getLastMessagePreview(room: ChatRoomDto): string {
  const text = room.lastMessage ?? undefined
  if (!text) return 'No messages yet'
  switch (room.lastMessageType) {
    case 'TEXT':
      return truncatePreview(text)
    case 'IMAGE':
      return 'Image'
    case 'SHARED_PRODUCT':
      return 'Shared a product'
    case 'SHARED_STORE':
      return 'Shared a store'
    default:
      return truncatePreview(text)
  }
}

function getPrimaryParticipant(room: ChatRoomDto): ParticipantInfo | null {
  return room.participants?.[0] ?? null
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
  room: ChatRoomDto
}

function RoomRow({ room }: RoomRowProps) {
  const preview = getLastMessagePreview(room)
  const ts = room.lastMessageTime ?? undefined
  const other = getPrimaryParticipant(room)
  const name = other?.name?.trim() || other?.username?.trim() || 'Chat'
  const avatarId = other?.profileImage ?? null

  return (
    <Link
      href={`/chat/${room.id}`}
      className={[
        'flex items-center gap-3 px-4 py-3',
        'hover:bg-gray-50 active:bg-gray-100',
        'transition-colors focus-visible:outline-none focus-visible:ring-2',
        'focus-visible:ring-blue-500 focus-visible:ring-inset',
      ].join(' ')}
      aria-label={`Chat with ${name}${room.unreadCount > 0 ? `, ${room.unreadCount} unread` : ''}`}
    >
      {/* Seller avatar */}
      <div className="relative flex-shrink-0">
        {avatarId ? (
          <ImageLoader
            imageId={avatarId}
            endpoint="display"
            alt={`${name} avatar`}
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
            {name.slice(0, 1).toUpperCase()}
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
          {name}
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
  const router = useRouter()
  const authStatus = useAuthStore((s) => s.status)

  const [rooms, setRooms] = useState<ChatRoomDto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchRooms = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await api.get<ChatListResponse | ChatRoomDto[]>('/chat/rooms?page=1&limit=50')

      // Backend returns ChatListResponse; keep array fallback for safety.
      const roomsArray: ChatRoomDto[] = Array.isArray(data) ? data : (data?.chatRooms ?? [])

      const sorted = sortRoomsByLastMessage(roomsArray)
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
    if (authStatus === 'authenticated') {
      fetchRooms()
      return
    }

    if (authStatus === 'unauthenticated') {
      setLoading(false)
      setRooms([])
      setError('Please sign in to view your messages.')
    }
  }, [fetchRooms, authStatus])

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
        ctaLabel={authStatus === 'unauthenticated' ? 'Sign in' : 'Retry'}
        onCta={authStatus === 'unauthenticated' ? () => router.push('/auth/login') : fetchRooms}
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
