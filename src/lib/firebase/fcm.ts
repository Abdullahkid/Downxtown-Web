/**
 * Firebase Cloud Messaging (FCM) — Web Push Notifications
 *
 * Responsibilities:
 *  - Request browser notification permission and register the FCM Web SDK
 *  - Send the FCM token to the backend so the server can target this device
 *  - Wrap `onMessage` for foreground notification handling
 *  - Expose a non-intrusive post-order permission prompt
 *
 * The service worker FCM handler (background push events + notification click)
 * lives in `src/service-worker/sw.ts` and is NOT duplicated here.
 *
 * Requirements: 19.1, 19.2, 19.3, 19.4
 */

import {
  getMessaging,
  getToken,
  onMessage,
  type Messaging,
  type MessagePayload,
} from 'firebase/messaging'

import { firebaseApp } from '@/lib/firebase/firebaseApp'
import { api } from '@/lib/api/apiClient'
import { useUiStore } from '@/store/uiStore'

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/**
 * Lazily initialise the FCM Messaging instance.
 * Returns null when called in a non-browser environment (SSR) or when the
 * browser does not support the Push API.
 */
function getMessagingInstance(): Messaging | null {
  if (typeof window === 'undefined') return null
  if (!('Notification' in window)) return null
  if (!('serviceWorker' in navigator)) return null

  try {
    return getMessaging(firebaseApp)
  } catch {
    // Firebase throws if the app is not configured — fail gracefully.
    return null
  }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Request browser notification permission, register the FCM Web SDK, and
 * send the resulting token to the backend.
 *
 * Safe to call on every app start — it is a no-op when:
 *  - Running on the server (SSR)
 *  - The browser does not support the Notifications API
 *  - The user has already denied permission
 *
 * @returns The FCM registration token, or null if permission was not granted
 *          or the environment does not support push notifications.
 *
 * Requirements: 19.1
 */
export async function requestNotificationPermission(): Promise<string | null> {
  // Guard: SSR
  if (typeof window === 'undefined') return null

  // Guard: browser support
  if (!('Notification' in window)) return null

  // Request (or read the already-granted) permission
  const permission = await Notification.requestPermission()
  if (permission !== 'granted') return null

  const messaging = getMessagingInstance()
  if (!messaging) return null

  try {
    const token = await getToken(messaging, {
      vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
    })

    if (!token) return null

    // Register the token with the backend so the server can send targeted
    // push notifications to this device.
    await api.post('/buyer/fcm-token', { token })

    return token
  } catch (error) {
    // Token retrieval can fail when the service worker is not yet active or
    // when the VAPID key is missing. Log and return null rather than throwing.
    console.error('[FCM] Failed to get or register token:', error)
    return null
  }
}

/**
 * Subscribe to foreground FCM messages (app is open and in focus).
 *
 * Firebase does NOT show a browser notification automatically when the app is
 * in the foreground — the caller is responsible for rendering an in-app
 * notification (e.g. a toast) from the received payload.
 *
 * @param callback  Called with the FCM `MessagePayload` for each message.
 * @returns An unsubscribe function. Call it to stop listening.
 *
 * Requirements: 19.2
 */
export function onForegroundMessage(
  callback: (payload: MessagePayload) => void,
): () => void {
  const messaging = getMessagingInstance()

  if (!messaging) {
    // Return a no-op unsubscribe when FCM is unavailable.
    return () => {}
  }

  return onMessage(messaging, callback)
}

// ---------------------------------------------------------------------------
// Post-order notification prompt
// ---------------------------------------------------------------------------

const PROMPT_SHOWN_KEY = 'fcm_prompt_shown'

/**
 * Show a non-intrusive notification permission prompt after the buyer places
 * their first order.
 *
 * The prompt is shown at most once per browser session (tracked via
 * sessionStorage) and only when:
 *  - The browser supports the Notifications API
 *  - Permission has not already been granted or denied
 *
 * The prompt is delivered as an `info` toast via `uiStore` so it integrates
 * with the existing toast infrastructure and does not block the UI.
 *
 * Requirements: 19.4
 */
export function showPostOrderNotificationPrompt(): void {
  // Guard: SSR
  if (typeof window === 'undefined') return

  // Guard: browser support
  if (!('Notification' in window)) return

  // Only prompt when permission is still undecided
  if (Notification.permission !== 'default') return

  // Show the prompt at most once per session
  if (sessionStorage.getItem(PROMPT_SHOWN_KEY)) return
  sessionStorage.setItem(PROMPT_SHOWN_KEY, '1')

  // Enqueue a toast that invites the buyer to enable notifications.
  // The toast message is intentionally brief and non-blocking.
  useUiStore.getState().addToast({
    id: 'fcm-permission-prompt',
    message: 'Enable notifications to get order status updates instantly.',
    type: 'info',
  })
}
