/**
 * Custom Service Worker — Downxtown Web Buyer App
 *
 * This file extends the Workbox-generated service worker produced by
 * @ducanh2912/next-pwa. It adds:
 *   1. Workbox precaching for the Next.js build manifest
 *   2. FCM background message handler (push events)
 *   3. Notification click handler (deep-link navigation)
 *   4. Background sync handler for the offline action queue
 *
 * Requirements: 18.4, 18.5, 24.7, 24.8
 */

// TypeScript: tell the compiler this file runs in a ServiceWorkerGlobalScope,
// not a Window or Node context.
// @ts-nocheck
declare const self: ServiceWorkerGlobalScope

import { precacheAndRoute } from 'workbox-precaching'

// ---------------------------------------------------------------------------
// 1. Workbox precaching
// ---------------------------------------------------------------------------
// __WB_MANIFEST is injected by @ducanh2912/next-pwa at build time.
// It contains the list of all static assets to precache.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
precacheAndRoute((self as any).__WB_MANIFEST || [])

// ---------------------------------------------------------------------------
// 2. FCM background message handler (push events)
// ---------------------------------------------------------------------------
// When the app is in the background or closed, Firebase Cloud Messaging
// delivers push payloads as raw `push` events to the service worker.
// We parse the payload and show a browser notification.

self.addEventListener('push', (event: PushEvent) => {
  if (!event.data) return

  let payload: {
    title?: string
    body?: string
    icon?: string
    data?: {
      orderId?: string
      deepLink?: string
      [key: string]: unknown
    }
  } = {}

  try {
    payload = event.data.json()
  } catch {
    // Fallback: treat the raw text as the notification body
    payload = { title: 'Downxtown', body: event.data.text() }
  }

  const title = payload.title ?? 'Downxtown'
  const options: NotificationOptions = {
    body: payload.body ?? '',
    icon: payload.icon ?? '/icons/icon-192.png',
    badge: '/icons/icon-192.png',
    data: payload.data ?? {},
    // Vibrate pattern: 200ms on, 100ms off, 200ms on
    vibrate: [200, 100, 200],
  }

  event.waitUntil(self.registration.showNotification(title, options))
})

// ---------------------------------------------------------------------------
// 3. Notification click handler
// ---------------------------------------------------------------------------
// When the user taps a notification, we either focus an existing tab that is
// already open on the deep-link URL, or open a new tab.

self.addEventListener('notificationclick', (event: NotificationEvent) => {
  event.notification.close()

  const notificationData = event.notification.data as {
    orderId?: string
    deepLink?: string
  }

  // Resolve the target URL: prefer an explicit deepLink, fall back to the
  // orders detail page when an orderId is present, otherwise go to root.
  const targetUrl: string =
    notificationData?.deepLink ??
    (notificationData?.orderId
      ? `/orders/${notificationData.orderId}`
      : '/')

  const absoluteUrl = new URL(targetUrl, self.location.origin).href

  event.waitUntil(
    self.clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Try to find an existing tab already on the target URL
        for (const client of clientList) {
          if (client.url === absoluteUrl && 'focus' in client) {
            return (client as WindowClient).focus()
          }
        }

        // No matching tab found — open a new one
        if (self.clients.openWindow) {
          return self.clients.openWindow(absoluteUrl)
        }
      })
  )
})

// ---------------------------------------------------------------------------
// 4. Background sync handler for the offline action queue
// ---------------------------------------------------------------------------
// When the browser regains connectivity it fires a `sync` event for each
// registered sync tag. The 'offline-queue' tag is registered by
// `offlineQueueStore` whenever an action is enqueued while offline.
// Here we trigger a fetch to the dedicated flush endpoint so the store can
// replay the queued actions.

self.addEventListener('sync', (event: SyncEvent) => {
  if (event.tag === 'offline-queue') {
    event.waitUntil(
      // POST to the internal Next.js route handler that flushes the queue.
      // The route handler reads the queue from IndexedDB and replays each
      // action against the backend API.
      fetch('/api/offline-queue/flush', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      }).catch(() => {
        // Swallow network errors — the browser will retry the sync
        // automatically when connectivity is restored again.
      })
    )
  }
})
