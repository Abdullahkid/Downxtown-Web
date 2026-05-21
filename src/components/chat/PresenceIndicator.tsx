'use client'

/**
 * PresenceIndicator — displays an "Online" badge next to a seller's name.
 *
 * - Renders a small green dot and an "Online" label when `isOnline` is `true`.
 * - Returns `null` when `isOnline` is `false` so no DOM node is injected.
 * - Intended to be rendered in the Chat_Room_Page header alongside the
 *   seller's name; presence state is driven by `room_presence`, `user_online`,
 *   and `user_offline` WebSocket events handled by the parent page.
 *
 * Requirements: 7.2, 7.3
 */

import React from 'react'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface PresenceIndicatorProps {
  /** Whether the other participant is currently online. */
  isOnline: boolean
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function PresenceIndicator({ isOnline }: PresenceIndicatorProps): JSX.Element | null {
  if (!isOnline) return null

  return (
    <span
      className="flex items-center gap-1.5"
      aria-label="Online"
      role="status"
    >
      {/* Green presence dot */}
      <span
        className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0"
        aria-hidden="true"
      />
      <span className="text-xs font-medium text-green-600">Online</span>
    </span>
  )
}
