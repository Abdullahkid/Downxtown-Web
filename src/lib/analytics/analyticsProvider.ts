/**
 * Analytics Provider — Firebase Analytics wrapper.
 *
 * Initializes Firebase Analytics lazily (browser-only, only when supported)
 * and respects the browser's Do Not Track preference.
 *
 * Requirements: 25.1, 25.8
 */

import {
  getAnalytics,
  logEvent as firebaseLogEvent,
  isSupported,
  type Analytics,
} from 'firebase/analytics'
import { firebaseApp } from '@/lib/firebase/firebaseApp'

// ---------------------------------------------------------------------------
// Lazy analytics instance
// ---------------------------------------------------------------------------

let analyticsPromise: Promise<Analytics | null> | null = null

/**
 * Returns the Firebase Analytics instance, initializing it on first call.
 * Returns `null` when running server-side or when Analytics is not supported
 * by the current browser environment.
 */
function getAnalyticsInstance(): Promise<Analytics | null> {
  if (analyticsPromise === null) {
    analyticsPromise = isSupported().then((yes) =>
      yes ? getAnalytics(firebaseApp) : null,
    )
  }
  return analyticsPromise
}

// ---------------------------------------------------------------------------
// Do Not Track helper
// ---------------------------------------------------------------------------

/**
 * Returns `true` when the browser's Do Not Track preference is enabled.
 * Checks both the standard `navigator.doNotTrack` and the legacy
 * `window.doNotTrack` property for maximum compatibility.
 */
export function isDntEnabled(): boolean {
  if (typeof window === 'undefined') return false
  return (
    navigator.doNotTrack === '1' ||
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).doNotTrack === '1'
  )
}

// ---------------------------------------------------------------------------
// Core logEvent wrapper
// ---------------------------------------------------------------------------

/**
 * Logs a Firebase Analytics event.
 *
 * Silently no-ops when:
 * - Running server-side (SSR / RSC)
 * - The browser's Do Not Track preference is enabled (Req 25.8)
 * - Firebase Analytics is not supported in the current environment
 *
 * @param name   - The event name (snake_case, e.g. `store_click`)
 * @param params - Optional key/value parameters attached to the event
 */
export async function logEvent(
  name: string,
  params?: Record<string, unknown>,
): Promise<void> {
  // Guard: SSR — window is not available
  if (typeof window === 'undefined') return

  // Guard: Do Not Track (Req 25.8)
  if (isDntEnabled()) return

  const analytics = await getAnalyticsInstance()
  if (!analytics) return

  // Firebase Analytics accepts `{ [key: string]: unknown }` at runtime even
  // though the SDK types are narrower; the cast keeps TypeScript happy.
  firebaseLogEvent(analytics, name, params as Record<string, string | number | boolean> | undefined)
}

// ---------------------------------------------------------------------------
// Typed event helpers (Req 25.2 – 25.7)
// ---------------------------------------------------------------------------

/**
 * Logs a `store_click` event when a buyer navigates to a Store Profile screen.
 * Req 25.2
 */
export function logStoreClick(params: {
  store_id: string
  store_username: string
}): Promise<void> {
  return logEvent('store_click', params)
}

/**
 * Logs a `product_click` event when a buyer navigates to a Product Page.
 * Req 25.3
 */
export function logProductClick(params: {
  product_id: string
  store_id: string
  category: string
}): Promise<void> {
  return logEvent('product_click', params)
}

/**
 * Logs a `search_query` event when a buyer submits a search.
 * Req 25.4
 */
export function logSearchQuery(params: {
  query: string
  result_count: number
}): Promise<void> {
  return logEvent('search_query', params)
}

/**
 * Logs an `order_placed` event when an order is placed successfully.
 * Req 25.5
 */
export function logOrderPlaced(params: {
  order_id: string
  payment_method: string
  total_amount: number
}): Promise<void> {
  return logEvent('order_placed', params)
}

/**
 * Logs a `follow_store` event when a buyer follows a store.
 * Req 25.6
 */
export function logFollowStore(params: { store_id: string }): Promise<void> {
  return logEvent('follow_store', params)
}

/**
 * Logs a `chat_started` event when a buyer initiates a new chat.
 * Req 25.7
 */
export function logChatStarted(params: { store_id: string }): Promise<void> {
  return logEvent('chat_started', params)
}
