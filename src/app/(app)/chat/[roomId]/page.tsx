'use client'

/**
 * Chat room page — `/chat/[roomId]`
 *
 * - Connects `useWebSocket` on mount.
 * - Optimistic message display: adds message with `sending: true`, updates to `sent` on ack.
 * - "Reconnecting…" banner when `status === 'reconnecting'`.
 * - Creates/retrieves ChatRoom via `api.post('/chat/rooms')` when starting from Store Profile.
 * - Logs `chat_started` analytics event on new chat.
 *
 * Requirements: 15.2, 15.3, 15.5, 15.8, 15.9, 15.10, 25.7
 */

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft, WifiOff } from 'lucide-react'
import { useWebSocket } from '@/hooks/useWebSocket'
import { api } from '@/lib/api/apiClient'
import { useAuthStore } from '@/store/authStore'
import { logChatStarted } from '@/lib/analytics/analyticsProvider'
import { MessageBubble } from '@/components/chat/MessageBubble'
import { MessageInput } from '@/components/chat/MessageInput'
import { ShimmerCard } from '@/components/shared/ShimmerCard'
import type { ChatMessage, ChatRoom, OutgoingMessage, WebSocketMessage } from '@/types/chat'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type OptimisticMessage = ChatMessage & { sending?: boolean }

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function generateTempId(): string {
  return `temp_${Date.now()}_${Math.random().toString(36).slice(2)}`
}

// ---------------------------------------------------------------------------
// Loading skeleton
// ---------------------------------------------------------------------------

function MessagesSkeleton() {
  return (
    <div className="flex flex-col gap-3 px-4 py-4" aria-label="Loading messages…" role="status">
      {/* Received */}
      <div className="flex justify-start">
        <ShimmerCard width={200} height={40} className="rounded-2xl rounded-bl-sm" />
      </div>
      {/* Sent */}
      <div className="flex justify-end">
        <ShimmerCard width={160} height={40} className="rounded-2xl rounded-br-sm" />
      </div>
      {/* Received */}
      <div className="flex justify-start">
        <ShimmerCard width={240} height={40} className="rounded-2xl rounded-bl-sm" />
      </div>
      {/* Sent */}
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

  const [messages, setMessages] = useState<OptimisticMessage[]>([])
  const [room, setRoom] = useState<ChatRoom | null>(null)
  const [loadingRoom, setLoadingRoom] = useState(true)
  const [loadingMessages, setLoadingMessages] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Scroll to bottom when new messages arrive
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  // -------------------------------------------------------------------------
  // Load room info and message history
  // -------------------------------------------------------------------------

  useEffect(() => {
    let cancelled = false

    async function init() {
      try {
        // If starting a new chat from Store Profile, create/retrieve the room (Req 15.10)
        if (isNewChat && sellerId) {
          const newRoom = await api.post<ChatRoom>('/chat/rooms', { sellerId })
          if (!cancelled) {
            setRoom(newRoom)
            // Log analytics event for new chat (Req 25.7)
            logChatStarted({ store_id: sellerId })
          }
        } else {
          // Fetch existing room info
          const existingRoom = await api.get<ChatRoom>(`/chat/rooms/${roomId}`)
          if (!cancelled) setRoom(existingRoom)
        }
      } catch {
        // Non-critical — room header will just be empty
      } finally {
        if (!cancelled) setLoadingRoom(false)
      }

      // Fetch message history
      try {
        const history = await api.get<ChatMessage[]>(`/chat/rooms/${roomId}/messages`)
        if (!cancelled) {
          setMessages(history)
          setTimeout(scrollToBottom, 100)
        }
      } catch {
        // Non-critical — start with empty messages
      } finally {
        if (!cancelled) setLoadingMessages(false)
      }
    }

    init()
    return () => { cancelled = true }
  }, [roomId, isNewChat, sellerId, scrollToBottom])

  // -------------------------------------------------------------------------
  // WebSocket integration (Req 15.2, 15.3, 15.8, 15.9)
  // -------------------------------------------------------------------------

  const handleIncomingMessage = useCallback((data: unknown) => {
    const wsMsg = data as WebSocketMessage

    if (wsMsg.type === 'message') {
      // New message from server
      const incoming = wsMsg.payload as ChatMessage
      setMessages((prev) => {
        // Avoid duplicates
        if (prev.some((m) => m.id === incoming.id)) return prev
        return [...prev, incoming]
      })
      setTimeout(scrollToBottom, 50)
    } else if (wsMsg.type === 'ack') {
      // Server acknowledged our optimistic message — update sending → sent
      const ack = wsMsg.payload as { tempId: string; message: ChatMessage }
      setMessages((prev) =>
        prev.map((m) =>
          m.id === ack.tempId
            ? { ...ack.message, sending: false }
            : m
        )
      )
    }
  }, [scrollToBottom])

  const { send, status } = useWebSocket(roomId, {
    onMessage: handleIncomingMessage,
  })

  // -------------------------------------------------------------------------
  // Send message (optimistic) (Req 15.5)
  // -------------------------------------------------------------------------

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

      // Optimistically add to UI
      setMessages((prev) => [...prev, optimistic])
      setTimeout(scrollToBottom, 50)

      // Send via WebSocket with tempId for ack matching
      send({ ...outgoing, tempId })
    },
    [roomId, currentUserId, send, scrollToBottom]
  )

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------

  const isDisabled = status === 'disconnected' || status === 'connecting'

  return (
    <main className="flex flex-col h-screen bg-white">
      {/* Header */}
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
            <span className="text-base font-semibold text-gray-900 truncate">
              {room.sellerName}
            </span>
          </div>
        ) : (
          <span className="text-base font-semibold text-gray-900 flex-1">Chat</span>
        )}

        {/* Connection status indicator */}
        {status === 'connected' && (
          <span className="text-xs text-green-600 font-medium flex-shrink-0" aria-live="polite">
            Online
          </span>
        )}
        {status === 'disconnected' && (
          <WifiOff size={16} className="text-gray-400 flex-shrink-0" aria-label="Disconnected" />
        )}
      </header>

      {/* Reconnecting banner (Req 15.9) */}
      {status === 'reconnecting' && (
        <div
          className="bg-amber-50 border-b border-amber-200 px-4 py-2 flex items-center gap-2"
          role="alert"
          aria-live="assertive"
        >
          <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse flex-shrink-0" aria-hidden="true" />
          <span className="text-sm text-amber-700 font-medium">Reconnecting…</span>
        </div>
      )}

      {/* Messages area */}
      <section
        className="flex-1 overflow-y-auto px-2 py-2"
        role="log"
        aria-label="Chat messages"
        aria-live="polite"
        aria-relevant="additions"
      >
        {loadingMessages ? (
          <MessagesSkeleton />
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-6 py-12">
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
        {/* Scroll anchor */}
        <div ref={messagesEndRef} aria-hidden="true" />
      </section>

      {/* Message input */}
      <MessageInput
        roomId={roomId}
        onSend={handleSend}
        disabled={isDisabled}
      />
    </main>
  )
}
