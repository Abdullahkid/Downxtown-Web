'use client'

/**
 * TypingIndicator — shows animated typing dots and the first typing user's name.
 *
 * - Returns `null` when `typingUsers` is empty (no DOM node rendered).
 * - Three animated dots via CSS keyframe animation (staggered bounce).
 * - Wrapped in `<div aria-live="polite">` so screen readers announce typing
 *   without interrupting the user's current flow.
 * - Auto-hide timeout per user (3 000 ms) is managed by the parent Chat_Room_Page.
 *
 * Requirements: 4.5
 */

import React from 'react'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface TypingIndicatorProps {
  typingUsers: { userId: string; displayName: string }[]
}

// ---------------------------------------------------------------------------
// Dot animation
// ---------------------------------------------------------------------------

/**
 * Three dots that bounce in sequence using Tailwind's `animate-bounce` with
 * staggered animation delays via inline styles. This matches the minimal
 * CSS-only approach used throughout the project (no external animation libs).
 */
function AnimatedDots() {
  return (
    <span className="flex items-center gap-[3px]" aria-hidden="true">
      {[0, 150, 300].map((delay) => (
        <span
          key={delay}
          className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce"
          style={{ animationDelay: `${delay}ms` }}
        />
      ))}
    </span>
  )
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function TypingIndicator({ typingUsers }: TypingIndicatorProps): JSX.Element | null {
  if (typingUsers.length === 0) return null

  const firstName = typingUsers[0].displayName

  return (
    <div aria-live="polite" aria-atomic="true">
      <div
        className={[
          'flex items-center gap-2 px-4 py-1.5',
          'text-sm text-gray-500',
        ].join(' ')}
      >
        <AnimatedDots />
        <span>
          <span className="font-medium text-gray-700">{firstName}</span>
          {' is typing…'}
        </span>
      </div>
    </div>
  )
}
