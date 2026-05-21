'use client'

import { useEffect } from 'react'
import { useWsContext } from '@/lib/chat/wsContext'
import { wsManager } from '@/lib/chat/wsManager'
import type { WsStatus } from '@/types/chat'

/**
 * Returns the exponential backoff delay in milliseconds for a given attempt number.
 * delay = min(1000 * 2^n, 30_000)
 *
 * Kept as the canonical export — wsManager imports this directly (no duplication).
 * Requirements: 1.4
 */
export function getBackoffDelay(n: number): number {
  return Math.min(1000 * Math.pow(2, n), 30_000)
}

// Re-export WsStatus under the legacy alias so existing consumers are unaffected.
export type WebSocketStatus = WsStatus

export interface UseWebSocketOptions {
  onMessage?: (data: unknown) => void
  onOpen?: () => void
  onClose?: () => void
}

export interface UseWebSocketReturn {
  send: (data: unknown) => void
  status: WebSocketStatus
  disconnect: () => void
}

/**
 * Thin wrapper over WsContext that preserves the original per-room hook interface.
 *
 * - On mount  → ctx.joinRoom(roomId)  (Req 1.5)
 * - On unmount → ctx.leaveRoom(roomId) (Req 1.6)
 * - Forwards `new_message` and `message_ack` events to options?.onMessage
 *
 * The hook no longer manages its own WebSocket; the single persistent connection
 * is owned by WS_Manager and exposed via WsProvider/WsContext.
 *
 * Requirements: 1.5, 1.6
 */
export function useWebSocket(
  roomId: string,
  options?: UseWebSocketOptions,
): UseWebSocketReturn {
  const ctx = useWsContext()

  // Join the room on mount; leave on unmount or when roomId changes (Req 1.5, 1.6).
  useEffect(() => {
    ctx.joinRoom(roomId)
    return () => ctx.leaveRoom(roomId)
  }, [roomId, ctx])

  // Forward incoming WS events to options.onMessage.
  // We create a stable reference to options via the closure so the listener
  // always sees the latest callbacks without the effect needing to re-run.
  useEffect(() => {
    return ctx.addListener((event, payload) => {
      if (event === 'new_message' || event === 'message_ack') {
        options?.onMessage?.({ event, payload })
      }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ctx])

  return {
    /** Sends a `send_message` event through the shared WS connection. */
    send: (data: unknown) => ctx.send('send_message', data),
    /** Current connection status — driven by WsProvider, triggers re-renders. */
    status: ctx.status,
    /** Disconnect the shared WS connection (delegates to wsManager). */
    disconnect: () => wsManager.disconnect(),
  }
}
