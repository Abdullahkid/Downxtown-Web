'use client'

/**
 * Chat room page — `/chat/[roomId]`
 *
 * - Uses WsContext (WS_Manager singleton) for real-time events.
 * - Joins / leaves the room on mount / unmount via wsManager.
 * - Optimistic message display: adds message with `sending: true`, updates to sent on ack.
 * - Paginated message loading: sentinel IntersectionObserver at top triggers page fetches.
 * - Scroll position preserved when prepending older messages (useLayoutEffect snapshot).
 * - "Reconnecting…" banner when `status === 'reconnecting'`.
 * - Marks room as read via POST /chat/{roomId}/read on mount; updates uiStore.
 * - Per-room message cache (IndexedDB): populated on successful load, read on API failure.
 *
 * Requirements: 4.5, 4.6, 4.7, 5.2, 5.3, 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 6.8, 6.9,
 *               8.2, 8.3, 8.4, 8.5
 */

import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft, Loader2, RefreshCw, WifiOff } from 'lucide-react'
import { useWsContext } from '@/lib/chat/wsContext'
import { mergeMessages } from '@/lib/chat/messageUtils'
import { api } from '@/lib/api/apiClient'
import { useAuthStore } from '@/store/authStore'
import { useUiStore } from '@/store/uiStore'
import { cacheStore } from '@/lib/cache/cacheStore'
import { logChatStarted } from '@/lib/analytics/analyticsProvider'
import { MessageBubble } from '@/components/chat/MessageBubble'
import { MessageInput } from '@/components/chat/MessageInput'
import { PresenceIndicator } from '@/components/chat/PresenceIndicator'
import { TypingIndicator } from '@/components/chat/TypingIndicator'
import { ShimmerCard } from '@/components/shared/ShimmerCard'
import type { ChatMessage, ChatRoom, OutgoingMessage, WsRoomPresence, WsUserOnline, WsUserOffline, WsUserTyping, WsTypingStoppedIn } from '@/types/chat'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type OptimisticMessage = ChatMessage & { sending?: boolean }

/** Per-user typing state tracked in Chat_Room_Page. */
interface TypingUser {
  userId: string
  displayName: string
  /** Auto-hide timer handle — cleared on `typing_stopped` or WS disconnect. */
  timer: ReturnType<typeof setTimeout>
}

const PAGE_LIMIT = 30

/**
 * Shape returned by `GET /chat/{roomId}/messages?page=N&limit=M`.
 * Falls back to a plain array for backward compat.
 */
interface ChatMessagesPage {
  messages: ChatMessage[]
  hasMore: boolean
  page: number
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function generateTempId(): string {
  return `temp_${Date.now()}_${Math.random().toString(36).slice(2)}`
}

function parsePage(raw: ChatMessagesPage | ChatMessage[]): {
  messages: ChatMessage[]
  hasMore: boolean
} {
  if (Array.isArray(raw)) {
    return { messages: raw, hasMore: false }
  }
  return {
    messages: raw.messages ?? [],
    hasMore: raw.hasMore ?? false,
  }
}

// ---------------------------------------------------------------------------
// Loading skeleton
// ---------------------------------------------------------------------------

function MessagesSkeleton() {
  return (
    <div className="flex flex-col gap-3 px-4 py-4" aria-label="Loading messages…" role="status">
      <div className="flex justify-start">
        <ShimmerCard width={200} height={40} className="rounded-2xl rounded-bl-sm" />
      </div>
      <div className="flex justify-end">
        <ShimmerCard width={160} height={40} className="rounded-2xl rounded-br-sm" />
      </div>
      <div className="flex justify-start">
        <ShimmerCard width={240} height={40} className="rounded-2xl rounded-bl-sm" />
      </div>
      <div className="flex justify-end">
        <ShimmerCard width={180} height={56} className="rounded-2xl rounded-br-sm" />
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------

export default function ChatRoomPage() {
  const params = useParams<{ roomId: string }>()
  const searchParams = useSearchParams()
  const router = useRouter()

  const roomId = params.roomId
  // When navigating from Store Profile, `sellerId` query param may be present
  const sellerId = searchParams.get('sellerId')
  const isNewChat = searchParams.get('new') === '1'

  const currentUser = useAuthStore((s) => s.user)
  const currentUserId = currentUser?.id ?? ''
  const setUnreadChat = useUiStore((s) => s.setUnreadChat)

  // ---------------------------------------------------------------------------
  // State
  // ---------------------------------------------------------------------------

  const [messages, setMessages] = useState<OptimisticMessage[]>([])
  const [room, setRoom] = useState<ChatRoom | null>(null)
  const [loadingRoom, setLoadingRoom] = useState(true)
  const [loadingMessages, setLoadingMessages] = useState(true)

  /** True when messages were loaded from the IndexedDB cache due to an API failure (Req 8.4, 8.5). */
  const [offlineMessages, setOfflineMessages] = useState(false)

  /** Current highest page number already fetched. */
  const [currentPage, setCurrentPage] = useState(1)
  /** Whether the server indicated more pages exist. */
  const [hasMore, setHasMore] = useState(false)
  /** True while an older-page request is in flight. */
  const [loadingOlder, setLoadingOlder] = useState(false)
  /** True after a pagination request fails — shows retry button. */
  const [paginationError, setPaginationError] = useState(false)

  /**
   * Map of userId → per-user typing info (display name + auto-hide timer).
   * Using a Map keyed by userId so each user's timer can be reset independently.
   * Stored as a ref-driven React state to avoid stale closure issues inside the
   * WS listener while keeping the component reactive to typing changes.
   *
   * Requirements: 4.5, 4.6
   */
  const [typingUsers, setTypingUsers] = useState<Map<string, TypingUser>>(
    () => new Map()
  )

  /**
   * Whether the seller is currently online.
   * `null` means we have not yet received a `room_presence` response
   * (and the 5 s timeout has not fired yet) — indicator is omitted.
   * `true`/`false` reflect the server's answer.
   * Requirements: 7.2, 7.3, 7.4, 7.5, 7.6
   */
  const [sellerOnline, setSellerOnline] = useState<boolean | null>(null)

  /**
   * True once the 5 000 ms presence timeout fires without a server reply —
   * used to suppress the indicator permanently for this session (Req 7.6).
   */
  const presenceTimedOutRef = useRef(false)

  // ---------------------------------------------------------------------------
  // Refs
  // ---------------------------------------------------------------------------

  /** Scroll container for the messages list — used for scroll preservation. */
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  /** Invisible div at the bottom — scroll target for new messages. */
  const messagesEndRef = useRef<HTMLDivElement>(null)
  /** Invisible sentinel at the TOP of the list — triggers pagination. */
  const sentinelRef = useRef<HTMLDivElement>(null)

  /**
   * Snapshot of scrollHeight captured immediately before prepending older messages.
   * useLayoutEffect reads this after React updates the DOM and adjusts scrollTop.
   */
  const scrollHeightBeforePrependRef = useRef<number | null>(null)

  /**
   * Ref guard: prevents duplicate in-flight pagination requests even when the
   * IntersectionObserver fires before React state (`loadingOlder`) has updated.
   */
  const loadingOlderRef = useRef(false)

  /** The page number that should be retried on pagination error. */
  const retryPageRef = useRef(2)

  /**
   * Ref mirror of `typingUsers` — lets the WS-disconnect effect clear all
   * timers without capturing a stale snapshot of the state map.
   */
  const typingUsersRef = useRef<Map<string, TypingUser>>(new Map())

  // ---------------------------------------------------------------------------
  // WS context
  // ---------------------------------------------------------------------------

  const ctx = useWsContext()

  // ---------------------------------------------------------------------------
  // Scroll helpers
  // ---------------------------------------------------------------------------

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  // ---------------------------------------------------------------------------
  // Join / leave room on mount / unmount (Req 1.5, 1.6)
  // Register current room with WsProvider so global new_message listener can
  // skip incrementing unread for the room the buyer is actively viewing (Req 5.4).
  // ---------------------------------------------------------------------------

  useEffect(() => {
    ctx.joinRoom(roomId)
    ctx.setCurrentRoomId(roomId)
    return () => {
      ctx.leaveRoom(roomId)
      ctx.setCurrentRoomId(null)
    }
  }, [roomId, ctx])

  // ---------------------------------------------------------------------------
  // Presence: send get_room_presence on mount, handle server reply events
  // Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6
  // ---------------------------------------------------------------------------

  useEffect(() => {
    // Reset state whenever roomId changes
    setSellerOnline(null)
    presenceTimedOutRef.current = false

    // Send the presence request (Req 7.1)
    ctx.send('get_room_presence', { roomId })

    // 5 s fallback: if no room_presence arrives, silently omit the indicator (Req 7.6)
    const timeoutHandle = setTimeout(() => {
      presenceTimedOutRef.current = true
      // If we still have null (no reply), keep it null so the indicator stays hidden.
      // We do not set an error state.
    }, 5000)

    return () => clearTimeout(timeoutHandle)
  }, [roomId, ctx])

  useEffect(() => {
    return ctx.addListener((event, payload) => {
      if (event === 'room_presence') {
        // Ignore if the 5 s timeout already fired (edge case: very late reply)
        if (presenceTimedOutRef.current) return
        const data = payload as WsRoomPresence
        if (data?.roomId !== roomId) return
        const sellerIdForRoom = room?.sellerId ?? null
        if (!sellerIdForRoom) return
        // Req 7.2 / 7.3: show indicator iff seller's ID is in the list
        setSellerOnline((data.onlineUserIds ?? []).includes(sellerIdForRoom))
      } else if (event === 'user_online') {
        const data = payload as WsUserOnline
        if (sellerOnline === null) return   // no presence data yet
        const sellerIdForRoom = room?.sellerId ?? null
        if (sellerIdForRoom && data?.userId === sellerIdForRoom) {
          // Req 7.4
          setSellerOnline(true)
        }
      } else if (event === 'user_offline') {
        const data = payload as WsUserOffline
        const sellerIdForRoom = room?.sellerId ?? null
        if (sellerIdForRoom && data?.userId === sellerIdForRoom) {
          // Req 7.5
          setSellerOnline(false)
        }
      }
    })
    // `room` is included so the listener uses the latest sellerId once room loads
  }, [ctx, roomId, room, sellerOnline])

  // ---------------------------------------------------------------------------
  // WS event listeners — new_message and message_ack
  // ---------------------------------------------------------------------------

  useEffect(() => {
    return ctx.addListener((event, payload) => {
      if (event === 'new_message') {
        // Payload shape: { message: ChatMessage }
        const data = payload as { message: ChatMessage }
        if (!data?.message || data.message.roomId !== roomId) return
        setMessages((prev) => {
          if (prev.some((m) => m.id === data.message.id)) return prev
          const next = [...prev, data.message]
          // Req 8.3 — append new message to the IndexedDB cache
          cacheStore.setMessages(roomId, next).catch(() => {
            // Cache write failure is non-critical; swallow silently
          })
          return next
        })
        setTimeout(scrollToBottom, 50)
      } else if (event === 'message_ack') {
        // Payload shape: { tempId: string; message: ChatMessage }
        const ack = payload as { tempId: string; message: ChatMessage }
        setMessages((prev) =>
          prev.map((m) =>
            m.id === ack.tempId ? { ...ack.message, sending: false } : m
          )
        )
      }
    })
  }, [ctx, roomId, scrollToBottom])

  // ---------------------------------------------------------------------------
  // Sync typingUsers state into ref so disconnect effect can read latest map
  // ---------------------------------------------------------------------------

  useEffect(() => {
    typingUsersRef.current = typingUsers
  }, [typingUsers])

  // ---------------------------------------------------------------------------
  // WS event listeners — user_typing and typing_stopped (Req 4.5, 4.6, 4.7)
  // ---------------------------------------------------------------------------

  useEffect(() => {
    return ctx.addListener((event, payload) => {
      if (event === 'user_typing') {
        const data = payload as WsUserTyping
        if (!data?.userId || data.roomId !== roomId) return

        setTypingUsers((prev) => {
          // Cancel any existing auto-hide timer for this user before re-arming
          const existing = prev.get(data.userId)
          if (existing) clearTimeout(existing.timer)

          // Arm a fresh 3000 ms auto-hide timer (Req 4.6)
          const timer = setTimeout(() => {
            setTypingUsers((current) => {
              if (!current.has(data.userId)) return current
              const next = new Map(current)
              next.delete(data.userId)
              return next
            })
          }, 3000)

          const next = new Map(prev)
          next.set(data.userId, {
            userId: data.userId,
            displayName: data.displayName,
            timer,
          })
          return next
        })
      } else if (event === 'typing_stopped') {
        const data = payload as WsTypingStoppedIn
        if (!data?.userId || data.roomId !== roomId) return

        setTypingUsers((prev) => {
          const existing = prev.get(data.userId)
          if (!existing) return prev
          clearTimeout(existing.timer)
          const next = new Map(prev)
          next.delete(data.userId)
          return next
        })
      }
    })
  }, [ctx, roomId])

  // ---------------------------------------------------------------------------
  // Clear all typing indicators within 500 ms of WS disconnect (Req 4.7)
  // ---------------------------------------------------------------------------

  useEffect(() => {
    if (ctx.status === 'disconnected' || ctx.status === 'reconnecting') {
      const clearHandle = setTimeout(() => {
        // Cancel all per-user auto-hide timers
        typingUsersRef.current.forEach((u) => clearTimeout(u.timer))
        setTypingUsers(new Map())
      }, 500)
      return () => clearTimeout(clearHandle)
    }
  }, [ctx.status])

  // ---------------------------------------------------------------------------
  // Scroll preservation — runs synchronously after DOM updates (Req 6.3)
  // useLayoutEffect fires after every `messages` state change; the null-check
  // means it only acts after a pagination prepend (sentinel was set).
  // ---------------------------------------------------------------------------

  useLayoutEffect(() => {
    const container = messagesContainerRef.current
    const snapshotHeight = scrollHeightBeforePrependRef.current

    if (snapshotHeight !== null && container) {
      const delta = container.scrollHeight - snapshotHeight
      if (delta > 0) {
        container.scrollTop += delta
      }
      scrollHeightBeforePrependRef.current = null
    }
  }, [messages])

  // ---------------------------------------------------------------------------
  // Initial load: room info + first message page + mark-read (Req 6.1, 5.2, 5.3)
  // ---------------------------------------------------------------------------

  useEffect(() => {
    let cancelled = false

    async function init() {
      // --- Load room info ---
      let roomUnreadCount = 0
      try {
        if (isNewChat && sellerId) {
          const newRoom = await api.post<ChatRoom>('/chat/rooms', { sellerId })
          if (!cancelled) {
            setRoom(newRoom)
            roomUnreadCount = newRoom.unreadCount ?? 0
            logChatStarted({ store_id: sellerId })
          }
        } else {
          const existingRoom = await api.get<ChatRoom>(`/chat/rooms/${roomId}`)
          if (!cancelled) {
            setRoom(existingRoom)
            roomUnreadCount = existingRoom.unreadCount ?? 0
          }
        }
      } catch {
        // Non-critical — room header will just be minimal
      } finally {
        if (!cancelled) setLoadingRoom(false)
      }

      // --- Load first page of messages (Req 6.1) ---
      try {
        const raw = await api.get<ChatMessagesPage | ChatMessage[]>(
          `/chat/${roomId}/messages?page=1&limit=${PAGE_LIMIT}`
        )
        if (!cancelled) {
          const { messages: msgs, hasMore: more } = parsePage(raw as ChatMessagesPage)
          setMessages(msgs)
          setCurrentPage(1)
          setHasMore(more)
          retryPageRef.current = 2
          setTimeout(scrollToBottom, 100)
          // Req 8.2 — persist the first page to the IndexedDB message cache
          cacheStore.setMessages(roomId, msgs).catch(() => {
            // Cache write failure is non-critical; swallow silently
          })
        }
      } catch {
        // Req 8.4 / 8.5 — API failed; try the message cache
        if (!cancelled) {
          try {
            const cached = await cacheStore.getMessages(roomId)
            setMessages(cached)
            setOfflineMessages(true)
          } catch {
            // Cache read also failed; leave messages empty (empty state shown below)
          }
        }
      } finally {
        if (!cancelled) setLoadingMessages(false)
      }

      // --- Mark room as read (Req 5.2, 5.3) ---
      if (!cancelled) {
        try {
          await api.post(`/chat/${roomId}/read`, {})
          // Recompute unread count: subtract this room's previous unread contribution.
          // Access current store state directly (outside React render) to avoid stale closure.
          if (roomUnreadCount > 0 && !cancelled) {
            const currentTotal = useUiStore.getState().unreadChatCount
            setUnreadChat(Math.max(0, currentTotal - roomUnreadCount))
          }
        } catch {
          // Req 5.3: leave `unreadChatCount` unchanged on read-receipt failure
        }
      }
    }

    init()
    return () => {
      cancelled = true
    }
  }, [roomId, isNewChat, sellerId, scrollToBottom, setUnreadChat])

  // ---------------------------------------------------------------------------
  // Load older messages (pagination) — Req 6.2, 6.3, 6.4, 6.5
  // ---------------------------------------------------------------------------

  const loadOlderMessages = useCallback(
    async (page: number) => {
      // Ref guard prevents duplicate calls before React state updates
      if (loadingOlderRef.current || !hasMore) return

      loadingOlderRef.current = true
      setLoadingOlder(true)
      setPaginationError(false)
      retryPageRef.current = page

      // Snapshot scrollHeight BEFORE the prepend so useLayoutEffect can restore (Req 6.3)
      if (messagesContainerRef.current) {
        scrollHeightBeforePrependRef.current = messagesContainerRef.current.scrollHeight
      }

      try {
        const raw = await api.get<ChatMessagesPage | ChatMessage[]>(
          `/chat/${roomId}/messages?page=${page}&limit=${PAGE_LIMIT}`
        )
        const { messages: incoming, hasMore: more } = parsePage(raw as ChatMessagesPage)
        // mergeMessages prepends `incoming` (older) before `existing` (newer), deduped by id
        setMessages((prev) => mergeMessages(prev, incoming))
        setCurrentPage(page)
        setHasMore(more)
      } catch {
        // Reset snapshot on failure — scroll position unchanged (Req 6.8)
        scrollHeightBeforePrependRef.current = null
        setPaginationError(true)
      } finally {
        loadingOlderRef.current = false
        setLoadingOlder(false)
      }
    },
    [roomId, hasMore]
  )

  // ---------------------------------------------------------------------------
  // IntersectionObserver sentinel — triggers pagination when user reaches top
  // Only attached when hasMore === true and no error/in-progress state (Req 6.7)
  // ---------------------------------------------------------------------------

  useEffect(() => {
    // Do not attach when there is nothing more to load, a load is in progress,
    // or an error banner is shown (Req 6.7, 6.8)
    if (!hasMore || paginationError) return

    const sentinel = sentinelRef.current
    if (!sentinel) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          loadOlderMessages(currentPage + 1)
        }
      },
      {
        // Fire when any part of the sentinel enters the scroll container
        threshold: 0.1,
      }
    )

    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [hasMore, paginationError, currentPage, loadOlderMessages])

  // ---------------------------------------------------------------------------
  // Retry handler (Req 6.9)
  // ---------------------------------------------------------------------------

  const handleRetryPagination = useCallback(() => {
    loadOlderMessages(retryPageRef.current)
  }, [loadOlderMessages])

  // ---------------------------------------------------------------------------
  // Send message (optimistic)
  // ---------------------------------------------------------------------------

  const handleSend = useCallback(
    (outgoing: OutgoingMessage) => {
      const tempId = generateTempId()
      const optimistic: OptimisticMessage = {
        id: tempId,
        roomId,
        senderId: currentUserId,
        senderType: 'PERSONAL',
        type: outgoing.type,
        text: outgoing.text,
        imageId: outgoing.imageId,
        sharedProductId: outgoing.sharedProductId,
        sharedStoreId: outgoing.sharedStoreId,
        timestamp: Date.now(),
        isRead: false,
        sending: true,
      }

      setMessages((prev) => [...prev, optimistic])
      setTimeout(scrollToBottom, 50)

      // Dispatch via WS_Manager — queued if disconnected (Req 1.11)
      ctx.sendMessage(roomId, outgoing.type, outgoing, tempId)
    },
    [roomId, currentUserId, ctx, scrollToBottom]
  )

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  const isDisabled = ctx.status === 'disconnected'

  /** Stable array derived from the Map — recalculated only when typingUsers changes. */
  const typingUsersArray = Array.from(typingUsers.values()).map(({ userId, displayName }) => ({
    userId,
    displayName,
  }))

  return (
    <main className="flex flex-col h-screen bg-white">
      {/* ------------------------------------------------------------------ */}
      {/* Header */}
      {/* ------------------------------------------------------------------ */}
      <header className="sticky top-0 z-10 bg-white border-b border-gray-200 flex items-center gap-3 px-3 py-2 min-h-[56px]">
        <button
          type="button"
          onClick={() => router.back()}
          className={[
            'p-2 rounded-full hover:bg-gray-100 active:bg-gray-200',
            'transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center',
          ].join(' ')}
          aria-label="Go back"
        >
          <ArrowLeft size={20} aria-hidden="true" />
        </button>

        {loadingRoom ? (
          <div className="flex items-center gap-2 flex-1">
            <ShimmerCard width={36} height={36} className="rounded-full" />
            <ShimmerCard width={120} height={16} />
          </div>
        ) : room ? (
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {room.sellerLogoId ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={`https://api.downxtown.com/get-display-image/${room.sellerLogoId}`}
                alt={`${room.sellerName} logo`}
                width={36}
                height={36}
                className="rounded-full object-cover flex-shrink-0"
              />
            ) : (
              <div
                className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-semibold flex-shrink-0"
                aria-hidden="true"
              >
                {room.sellerName.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="flex flex-col min-w-0">
              <span className="text-base font-semibold text-gray-900 truncate">
                {room.sellerName}
              </span>
              {/* Presence indicator — shown only when sellerOnline is true (Req 7.2, 7.3) */}
              {sellerOnline === true && (
                <PresenceIndicator isOnline={true} />
              )}
            </div>
          </div>
        ) : (
          <span className="text-base font-semibold text-gray-900 flex-1">Chat</span>
        )}

        {/* Connection status indicator */}
        {ctx.status === 'disconnected' && (
          <WifiOff
            size={16}
            className="text-gray-400 flex-shrink-0"
            aria-label="Disconnected"
          />
        )}
      </header>

      {/* ------------------------------------------------------------------ */}
      {/* Reconnecting banner (Req 1.7) */}
      {/* ------------------------------------------------------------------ */}
      {ctx.status === 'reconnecting' && (
        <div
          className="bg-amber-50 border-b border-amber-200 px-4 py-2 flex items-center gap-2"
          role="alert"
          aria-live="assertive"
        >
          <div
            className="w-2 h-2 rounded-full bg-amber-500 animate-pulse flex-shrink-0"
            aria-hidden="true"
          />
          <span className="text-sm text-amber-700 font-medium">Reconnecting…</span>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* Offline / cached messages banner (Req 8.4, 8.5) */}
      {/* ------------------------------------------------------------------ */}
      {offlineMessages && (
        <div
          className="bg-gray-100 border-b border-gray-300 px-4 py-2 flex items-center gap-2"
          role="alert"
          aria-live="polite"
        >
          <WifiOff size={14} className="text-gray-500 flex-shrink-0" aria-hidden="true" />
          <span className="text-sm text-gray-600">
            You&apos;re offline. Showing cached messages.
          </span>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* Messages area */}
      {/* ------------------------------------------------------------------ */}
      <section
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto px-2 py-2"
        role="log"
        aria-label="Chat messages"
        aria-live="polite"
        aria-relevant="additions"
      >
        {loadingMessages ? (
          <MessagesSkeleton />
        ) : (
          <>
            {/* ---- Pagination sentinel (invisible, at the very top) ---- */}
            {/* Only rendered when hasMore && !paginationError (Req 6.7) */}
            {hasMore && !paginationError && (
              <div
                ref={sentinelRef}
                className="h-px w-full"
                aria-hidden="true"
                data-testid="pagination-sentinel"
              />
            )}

            {/* ---- Loading spinner while fetching older messages (Req 6.5) ---- */}
            {loadingOlder && (
              <div
                className="flex items-center justify-center py-3"
                role="status"
                aria-label="Loading older messages…"
              >
                <Loader2
                  size={20}
                  className="animate-spin text-blue-500"
                  aria-hidden="true"
                />
              </div>
            )}

            {/* ---- Pagination error retry button (Req 6.8, 6.9) ---- */}
            {paginationError && (
              <div className="flex items-center justify-center py-3">
                <button
                  type="button"
                  onClick={handleRetryPagination}
                  className={[
                    'flex items-center gap-1.5 px-4 py-2 rounded-full',
                    'text-sm text-blue-600 font-medium',
                    'bg-blue-50 hover:bg-blue-100 active:bg-blue-200',
                    'border border-blue-200 transition-colors',
                  ].join(' ')}
                  aria-label="Retry loading older messages"
                >
                  <RefreshCw size={14} aria-hidden="true" />
                  Could not load older messages. Tap to retry.
                </button>
              </div>
            )}

            {/* ---- Message list ---- */}
            {messages.length === 0 ? (
              /* Empty state (Req 6.6) */
              <div className="flex flex-col items-center justify-center h-full text-center px-6 py-12 min-h-[300px]">
                <p className="text-gray-400 text-sm">No messages yet. Say hello! 👋</p>
              </div>
            ) : (
              <div role="list">
                {messages.map((msg) => (
                  <MessageBubble
                    key={msg.id}
                    message={msg}
                    currentUserId={currentUserId}
                  />
                ))}
              </div>
            )}

            {/* Scroll anchor — always at the very bottom */}
            <div ref={messagesEndRef} aria-hidden="true" />
          </>
        )}
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* Typing indicator (Req 4.5) */}
      {/* ------------------------------------------------------------------ */}
      <TypingIndicator typingUsers={typingUsersArray} />

      {/* ------------------------------------------------------------------ */}
      {/* Message input */}
      {/* ------------------------------------------------------------------ */}
      <MessageInput
        roomId={roomId}
        onSend={handleSend}
        disabled={isDisabled}
        status={ctx.status}
        onTyping={() => ctx.notifyTyping(roomId)}
        onStopTyping={() => ctx.stopTyping(roomId)}
      />
    </main>
  )
}
