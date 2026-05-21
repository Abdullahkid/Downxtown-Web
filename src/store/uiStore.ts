/**
 * UI store — tracks badge counts and the global toast queue.
 * Requirements: 15.11, 29.1, 5.4, 5.5
 */

import { create } from 'zustand'

export interface Toast {
  id: string
  message: string
  type: 'success' | 'error' | 'info'
  /** Optional click handler invoked when the toast body is tapped (Req 9.4). */
  onClick?: () => void
}

interface UiState {
  unreadChatCount: number
  wishlistCount: number
  cartCount: number
  toastQueue: Toast[]
  /**
   * Per-room unread counts used to recompute `unreadChatCount` when a
   * `messages_read` WS event arrives (Req 5.5).
   * Populated by `ChatRoomList` after a successful rooms fetch.
   */
  roomUnreadCounts: Record<string, number>
}

interface UiActions {
  // Unread chat badge
  incrementUnreadChat: () => void
  decrementUnreadChat: () => void
  setUnreadChat: (n: number) => void

  // Per-room unread map
  /**
   * Replace the entire per-room unread map (called after a rooms fetch).
   * Does NOT update `unreadChatCount` — callers should call `setUnreadChat`
   * with the sum themselves.
   */
  setRoomUnreadCounts: (counts: Record<string, number>) => void
  /**
   * Update a single room's unread count and recompute the total from the map.
   * Used when a `messages_read` WS event arrives (Req 5.5).
   */
  updateRoomUnread: (roomId: string, count: number) => void

  // Wishlist / cart counts (synced from server on profile load)
  setWishlistCount: (n: number) => void
  setCartCount: (n: number) => void

  // Toast queue
  addToast: (toast: Toast) => void
  removeToast: (id: string) => void
}

export type UiStore = UiState & UiActions

export const useUiStore = create<UiStore>((set) => ({
  unreadChatCount: 0,
  wishlistCount: 0,
  cartCount: 0,
  toastQueue: [],
  roomUnreadCounts: {},

  incrementUnreadChat: () =>
    set((state) => ({ unreadChatCount: state.unreadChatCount + 1 })),

  decrementUnreadChat: () =>
    set((state) => ({
      unreadChatCount: Math.max(0, state.unreadChatCount - 1),
    })),

  setUnreadChat: (n) => set({ unreadChatCount: Math.max(0, n) }),

  setRoomUnreadCounts: (counts) => set({ roomUnreadCounts: counts }),

  updateRoomUnread: (roomId, count) =>
    set((state) => {
      const updated = { ...state.roomUnreadCounts, [roomId]: count }
      const total = Object.values(updated).reduce((sum, c) => sum + c, 0)
      return { roomUnreadCounts: updated, unreadChatCount: Math.max(0, total) }
    }),

  setWishlistCount: (n) => set({ wishlistCount: Math.max(0, n) }),

  setCartCount: (n) => set({ cartCount: Math.max(0, n) }),

  addToast: (toast) =>
    set((state) => ({ toastQueue: [...state.toastQueue, toast] })),

  removeToast: (id) =>
    set((state) => ({
      toastQueue: state.toastQueue.filter((t) => t.id !== id),
    })),
}))
