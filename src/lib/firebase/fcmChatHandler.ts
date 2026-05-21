/**
 * FCM Chat Notification Handler
 *
 * Registers a foreground Firebase Cloud Messaging listener that handles
 * incoming CHAT-type push notifications while the app is open in the browser.
 *
 * Firebase does NOT auto-show browser notifications when the app is in the
 * foreground, so this handler bridges the gap by:
 *  - Incrementing the unread chat badge via uiStore (Req 9.1)
 *  - Enqueueing a tappable in-app toast (Req 9.3, 9.4)
 *  - Optionally firing a native browser Notification when permission is granted (Req 9.6)
 *
 * Payload shape expected from the backend:
 *   data.type          === 'CHAT'
 *   data.chatRoomId    — the room that received the message
 *   data.senderName    — display name of the sender
 *   data.messagePreview — raw preview text (truncated here to 50 chars)
 *
 * Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6
 */

import type { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime'
import { onForegroundMessage } from '@/lib/firebase/fcm'
import { useUiStore } from '@/store/uiStore'
import type { ChatFcmData } from '@/types/chat'

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/** Maximum length for the preview shown in both the toast and the native notification. */
const PREVIEW_MAX_LEN = 50

/**
 * Truncate a string to `PREVIEW_MAX_LEN` characters, appending "…" when cut.
 */
function truncatePreview(text: string): string {
  if (text.length <= PREVIEW_MAX_LEN) return text
  return text.slice(0, PREVIEW_MAX_LEN) + '…'
}

/**
 * Narrow-check that a raw FCM `data` record contains the fields required for
 * a valid CHAT notification (Req 9.5).
 *
 * Returns a typed `ChatFcmData` on success, or `null` to discard silently.
 */
function parseChatFcmData(data: Record<string, string> | undefined): ChatFcmData | null {
  if (!data) return null
  if (data.type !== 'CHAT') return null
  if (!data.chatRoomId) return null

  return {
    type: 'CHAT',
    chatRoomId: data.chatRoomId,
    senderName: data.senderName ?? 'Someone',
    messagePreview: data.messagePreview ?? '',
  }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Register the foreground FCM listener for CHAT messages.
 *
 * Call this once from the authenticated app shell after Firebase Messaging is
 * initialised.  The returned function unregisters the listener (suitable as a
 * `useEffect` cleanup).
 *
 * @param getCurrentRoomId  Closure returning the roomId of the currently visible
 *                          Chat_Room_Page, or `null` when no chat room is open.
 * @param router            Next.js App Router instance used to navigate on toast tap.
 * @returns Unsubscribe function — call it to stop listening.
 *
 * Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6
 */
export function registerFcmChatHandler(
  getCurrentRoomId: () => string | null,
  router: AppRouterInstance,
): () => void {
  const unsubscribe = onForegroundMessage((payload) => {
    // Step 1 — Validate payload (Req 9.5)
    const fcmData = parseChatFcmData(payload.data as Record<string, string> | undefined)
    if (!fcmData) {
      // Not a CHAT message or missing chatRoomId — discard silently.
      return
    }

    const { chatRoomId, senderName, messagePreview } = fcmData

    // Step 2 — No-op if the buyer is already viewing this room (Req 9.2)
    if (chatRoomId === getCurrentRoomId()) {
      return
    }

    const truncatedPreview = truncatePreview(messagePreview)

    // Step 3 — Increment badge and enqueue an in-app toast (Req 9.1, 9.3, 9.4)
    const uiStore = useUiStore.getState()

    uiStore.incrementUnreadChat()

    uiStore.addToast({
      id: `chat-fcm-${chatRoomId}-${Date.now()}`,
      message: `${senderName}: ${truncatedPreview}`,
      type: 'info',
      onClick: () => {
        router.push(`/chat/${chatRoomId}`)
      },
    })

    // Step 4 — Native browser notification when permission is granted (Req 9.6)
    if (typeof window !== 'undefined' && Notification.permission === 'granted') {
      try {
        new Notification(senderName, { body: truncatedPreview })
      } catch {
        // Some browsers may throw if the notification cannot be created
        // (e.g. ServiceWorker not yet active). Fail silently.
      }
    }
  })

  return unsubscribe
}
