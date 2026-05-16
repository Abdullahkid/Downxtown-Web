/**
 * UI store — tracks badge counts and the global toast queue.
 * Requirements: 15.11, 29.1
 */

import { create } from 'zustand'

export interface Toast {
  id: string
  message: string
  type: 'success' | 'error' | 'info'
}

interface UiState {
  unreadChatCount: number
  wishlistCount: number
  cartCount: number
  toastQueue: Toast[]
}

interface UiActions {
  // Unread chat badge
  incrementUnreadChat: () => void
  decrementUnreadChat: () => void
  setUnreadChat: (n: number) => void

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

  incrementUnreadChat: () =>
    set((state) => ({ unreadChatCount: state.unreadChatCount + 1 })),

  decrementUnreadChat: () =>
    set((state) => ({
      unreadChatCount: Math.max(0, state.unreadChatCount - 1),
    })),

  setUnreadChat: (n) => set({ unreadChatCount: Math.max(0, n) }),

  setWishlistCount: (n) => set({ wishlistCount: Math.max(0, n) }),

  setCartCount: (n) => set({ cartCount: Math.max(0, n) }),

  addToast: (toast) =>
    set((state) => ({ toastQueue: [...state.toastQueue, toast] })),

  removeToast: (id) =>
    set((state) => ({
      toastQueue: state.toastQueue.filter((t) => t.id !== id),
    })),
}))
