'use client'

/**
 * MessageBubble — renders a single chat message.
 *
 * - Right-aligned for sent messages (senderType === 'PERSONAL' for buyer).
 * - Left-aligned for received messages.
 * - TEXT: sanitizes via `sanitize()` then renders.
 * - IMAGE: renders via `ImageLoader`.
 * - SHARED_PRODUCT / SHARED_STORE: card with name + link.
 * - Uses IntersectionObserver to mark messages as read when visible.
 * - Updates `uiStore.unreadChatCount` when marking read.
 *
 * Requirements: 15.3, 15.7, 15.11, 27.5
 */

import React, { useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import { ShoppingBag, Store } from 'lucide-react'
import { sanitize } from '@/lib/sanitize/sanitize'
import { ImageLoader } from '@/components/shared/ImageLoader'
import { useUiStore } from '@/store/uiStore'
import { api } from '@/lib/api/apiClient'
import type { ChatMessage } from '@/types/chat'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface MessageBubbleProps {
  message: ChatMessage & { sending?: boolean }
  /** The current buyer's participant type — used to determine sent vs received. */
  currentUserId: string
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatTime(ts: number): string {
  return new Date(ts).toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
  })
}

// ---------------------------------------------------------------------------
// Sub-renderers
// ---------------------------------------------------------------------------

function TextContent({ text }: { text: string }) {
  const clean = sanitize(text)
  return (
    <p
      className="text-sm leading-relaxed break-words whitespace-pre-wrap"
      // sanitize() strips all XSS vectors — safe to use dangerouslySetInnerHTML
      // for inline formatting (bold, italic) that DOMPurify allows. (Req 27.5)
      dangerouslySetInnerHTML={{ __html: clean }}
    />
  )
}

function ImageContent({ imageId, isSent }: { imageId: string; isSent: boolean }) {
  return (
    <div className="rounded-lg overflow-hidden max-w-[220px]">
      <ImageLoader
        imageId={imageId}
        endpoint="detail"
        alt="Shared image"
        width={220}
        height={220}
        className={['rounded-lg object-cover', isSent ? '' : ''].join(' ')}
        imageContext="product"
      />
    </div>
  )
}

function SharedProductContent({ productId }: { productId: string }) {
  return (
    <Link
      href={`/product/${productId}`}
      className={[
        'flex items-center gap-3 p-3 rounded-xl',
        'bg-white/20 hover:bg-white/30 transition-colors',
        'border border-white/30',
        'min-w-[180px] max-w-[240px]',
      ].join(' ')}
      aria-label="View shared product"
    >
      <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-white/30 flex items-center justify-center">
        <ShoppingBag size={20} aria-hidden="true" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold truncate">Shared Product</p>
        <p className="text-xs opacity-75 truncate">Tap to view</p>
      </div>
    </Link>
  )
}

function SharedStoreContent({ storeId }: { storeId: string }) {
  return (
    <Link
      href={`/store/${storeId}`}
      className={[
        'flex items-center gap-3 p-3 rounded-xl',
        'bg-white/20 hover:bg-white/30 transition-colors',
        'border border-white/30',
        'min-w-[180px] max-w-[240px]',
      ].join(' ')}
      aria-label="View shared store"
    >
      <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-white/30 flex items-center justify-center">
        <Store size={20} aria-hidden="true" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold truncate">Shared Store</p>
        <p className="text-xs opacity-75 truncate">Tap to view</p>
      </div>
    </Link>
  )
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function MessageBubble({ message, currentUserId }: MessageBubbleProps) {
  const isSent = message.senderId === currentUserId
  const decrementUnreadChat = useUiStore((s) => s.decrementUnreadChat)
  const bubbleRef = useRef<HTMLDivElement>(null)
  const markedRef = useRef(false)

  // Mark message as read via IntersectionObserver when it enters the viewport.
  // Only mark received, unread messages. (Req 15.11)
  const markRead = useCallback(async () => {
    if (markedRef.current || isSent || message.isRead) return
    markedRef.current = true
    try {
      await api.post(`/chat/rooms/${message.roomId}/messages/${message.id}/read`, {})
      decrementUnreadChat()
    } catch {
      // Non-critical — silently ignore read-receipt failures
      markedRef.current = false
    }
  }, [isSent, message.isRead, message.roomId, message.id, decrementUnreadChat])

  useEffect(() => {
    const el = bubbleRef.current
    if (!el || isSent || message.isRead) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          markRead()
          observer.disconnect()
        }
      },
      { threshold: 0.5 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [isSent, message.isRead, markRead])

  // Bubble color scheme
  const bubbleClasses = isSent
    ? 'bg-blue-600 text-white rounded-br-sm'
    : 'bg-gray-100 text-gray-900 rounded-bl-sm'

  return (
    <div
      ref={bubbleRef}
      className={['flex mb-2', isSent ? 'justify-end' : 'justify-start'].join(' ')}
      role="listitem"
    >
      <div className={['max-w-[75%] flex flex-col', isSent ? 'items-end' : 'items-start'].join(' ')}>
        {/* Bubble */}
        <div
          className={[
            'px-3 py-2 rounded-2xl',
            bubbleClasses,
            message.sending ? 'opacity-60' : '',
          ].join(' ')}
        >
          {message.type === 'TEXT' && message.text != null && (
            <TextContent text={message.text} />
          )}
          {message.type === 'IMAGE' && message.imageId != null && (
            <ImageContent imageId={message.imageId} isSent={isSent} />
          )}
          {message.type === 'SHARED_PRODUCT' && message.sharedProductId != null && (
            <SharedProductContent productId={message.sharedProductId} />
          )}
          {message.type === 'SHARED_STORE' && message.sharedStoreId != null && (
            <SharedStoreContent storeId={message.sharedStoreId} />
          )}
        </div>

        {/* Timestamp + status */}
        <div className="flex items-center gap-1 mt-0.5 px-1">
          <span className="text-[10px] text-gray-400">
            {formatTime(message.timestamp)}
          </span>
          {isSent && (
            <span className="text-[10px] text-gray-400" aria-label={message.sending ? 'Sending' : 'Sent'}>
              {message.sending ? '○' : '✓'}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
