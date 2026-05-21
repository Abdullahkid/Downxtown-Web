/**
 * WsContext and WsProvider — React context layer over the WS_Manager singleton.
 *
 * WsProvider:
 *  - Subscribes to authStore: connects when authenticated, disconnects when unauthenticated.
 *  - Subscribes to wsManager.onStatusChange so all consumers re-render on connection changes.
 *  - Exposes the WS_Manager API surface through context so components never import the
 *    singleton directly (improves testability and avoids stale closures).
 *  - Hosts the global `new_message` and `messages_read` WS listeners that update
 *    `uiStore.unreadChatCount` (Req 5.4, 5.5).  A `currentRoomIdRef` tracks which room
 *    is currently visible so `new_message` events for the active room are ignored.
 *  - Registers the FCM foreground chat notification handler once after authentication,
 *    passing `currentRoomIdRef` so same-room notifications are suppressed (Req 9.1–9.6).
 *
 * Requirements: 1.1, 1.2, 1.7, 1.8, 5.4, 5.5, 9.1, 9.2, 9.3, 9.4, 9.5, 9.6
 */

'use client'

import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { wsManager } from '@/lib/chat/wsManager'
import { useAuthStore } from '@/store/authStore'
import { useUiStore } from '@/store/uiStore'
import { registerFcmChatHandler } from '@/lib/firebase/fcmChatHandler'
import type { WsMessagesRead, WsNewMessage, WsStatus } from '@/types/chat'

// ---------------------------------------------------------------------------
// Context value shape
// ---------------------------------------------------------------------------

interface WsContextValue {
  /** Current WebSocket connection status — triggers re-renders on change. */
  status: WsStatus
  send: typeof wsManager.send
  sendMessage: typeof wsManager.sendMessage
  joinRoom: typeof wsManager.joinRoom
  leaveRoom: typeof wsManager.leaveRoom
  notifyTyping: typeof wsManager.notifyTyping
  stopTyping: typeof wsManager.stopTyping
  addListener: typeof wsManager.addListener
  /**
   * Called by Chat_Room_Page when it mounts / unmounts so the global unread
   * listener knows which room is currently active and can skip incrementing
   * for messages belonging to the visible room (Req 5.4).
   *
   * Pass `null` when no room is active (i.e. on unmount).
   */
  setCurrentRoomId: (roomId: string | null) => void
}

// ---------------------------------------------------------------------------
// Stable bound methods — created once so the context value reference is stable
// on every render (avoids unnecessary re-renders in consumers that use the
// function references directly in useEffect dependency arrays).
// ---------------------------------------------------------------------------

const boundMethods = {
  send: wsManager.send.bind(wsManager),
  sendMessage: wsManager.sendMessage.bind(wsManager),
  joinRoom: wsManager.joinRoom.bind(wsManager),
  leaveRoom: wsManager.leaveRoom.bind(wsManager),
  notifyTyping: wsManager.notifyTyping.bind(wsManager),
  stopTyping: wsManager.stopTyping.bind(wsManager),
  addListener: wsManager.addListener.bind(wsManager),
} as const

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

// eslint-disable-next-line @typescript-eslint/no-empty-function
const noop = () => {}

export const WsContext = createContext<WsContextValue>({
  status: 'disconnected',
  ...boundMethods,
  setCurrentRoomId: noop,
})

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export function WsProvider({ children }: { children: React.ReactNode }): React.JSX.Element {
  // Mirror wsManager.status in React state so any component that reads
  // status from context will re-render when the connection changes.
  const [status, setStatus] = useState<WsStatus>(() => wsManager.getStatus())

  const authStatus = useAuthStore((s) => s.status)
  const firebaseUser = useAuthStore((s) => s.firebaseUser)

  // Router instance for FCM handler navigation (Req 9.4).
  const router = useRouter()

  // ---------------------------------------------------------------------------
  // Current room tracking — ref so the WS listener always reads the latest value
  // without needing to be re-registered on every room navigation.
  // ---------------------------------------------------------------------------

  /**
   * The roomId of the Chat_Room_Page that is currently mounted and visible.
   * `null` when no chat room is open.
   */
  const currentRoomIdRef = useRef<string | null>(null)

  const setCurrentRoomId = useCallback((roomId: string | null) => {
    currentRoomIdRef.current = roomId
  }, [])

  // Subscribe to wsManager status changes once on mount.
  useEffect(() => {
    const unsubscribe = wsManager.onStatusChange((s) => setStatus(s))
    return unsubscribe
  }, [])

  // ---------------------------------------------------------------------------
  // Global unread count listener (Req 5.4, 5.5)
  //
  // Registered once on mount.  Uses uiStore actions accessed via getState() to
  // avoid stale closures — no dependency on React state.
  // ---------------------------------------------------------------------------

  useEffect(() => {
    const unsubscribe = wsManager.addListener((event, payload) => {
      if (event === 'new_message') {
        // Req 5.4: increment only when the message belongs to a room OTHER than
        // the one currently displayed in Chat_Room_Page.
        const data = payload as WsNewMessage
        const incomingRoomId = data?.message?.roomId
        if (incomingRoomId && incomingRoomId !== currentRoomIdRef.current) {
          useUiStore.getState().incrementUnreadChat()
        }
      } else if (event === 'messages_read') {
        // Req 5.5: update the per-room unread count and recompute the total.
        const data = payload as WsMessagesRead
        if (data?.roomId != null) {
          useUiStore.getState().updateRoomUnread(data.roomId, data.unreadCount ?? 0)
        }
      }
    })

    return unsubscribe
  }, [])

  // ---------------------------------------------------------------------------
  // FCM foreground chat notification handler (Req 9.1–9.6)
  //
  // Registered once on mount.  Passes a stable closure over `currentRoomIdRef`
  // so same-room notifications are suppressed without re-registering the handler
  // on every room navigation.
  // ---------------------------------------------------------------------------

  useEffect(() => {
    const unsubscribe = registerFcmChatHandler(
      () => currentRoomIdRef.current,
      router,
    )
    return unsubscribe
    // router is stable across the lifetime of the layout; currentRoomIdRef is a ref.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // React to auth state changes:
  //  - 'authenticated'   → get a fresh ID token and connect (Req 1.1, 1.2)
  //  - 'unauthenticated' → disconnect (Req 1.2)
  //  - 'loading'         → no-op, wait for Firebase to resolve
  useEffect(() => {
    if (authStatus === 'authenticated' && firebaseUser) {
      firebaseUser
        .getIdToken()
        .then((token) => {
          wsManager.connect(token)
        })
        .catch(() => {
          // Token fetch failed — manager stays disconnected (Req 1.2).
        })
    } else if (authStatus === 'unauthenticated') {
      wsManager.disconnect()
    }
  }, [authStatus, firebaseUser])

  const value: WsContextValue = {
    status,
    ...boundMethods,
    setCurrentRoomId,
  }

  return <WsContext.Provider value={value}>{children}</WsContext.Provider>
}

// ---------------------------------------------------------------------------
// Convenience hook
// ---------------------------------------------------------------------------

export function useWsContext(): WsContextValue {
  return useContext(WsContext)
}
