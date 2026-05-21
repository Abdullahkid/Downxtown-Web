'use client'

/**
 * ParticipantRow — a tappable row representing a single ChatParticipant.
 *
 * - Renders an avatar via `ImageLoader` (endpoint="display"), participant name,
 *   a subtitle (falls back to `@username`), and a type badge (PERSONAL/BUSINESS).
 * - When `creatingForId === participant.id`, overlays a `Loader2` spinner to
 *   signal that a `POST /chat/create` is in progress for this row (Req 2.14).
 * - While any participant is being created (`creatingForId !== null`), the
 *   whole row is disabled to prevent duplicate submissions (Req 2.14).
 * - On click, delegates to `onSelect(id, type)` — the parent page handles the
 *   actual `POST /chat/create` call and navigation (Req 2.12).
 * - On `POST` failure, the parent shows an error toast; this component just
 *   re-enables itself when `creatingForId` is reset to `null` (Req 2.13).
 *
 * Requirements: 2.12, 2.13, 2.14
 */

import React from 'react'
import { Store, User, Loader2 } from 'lucide-react'
import type { ChatParticipant, ParticipantType } from '@/types/chat'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ParticipantRowProps {
  participant: ChatParticipant
  /** ID of the participant whose chat creation is currently in progress. */
  creatingForId: string | null
  /** Called when the buyer taps this row and no creation is already in progress. */
  onSelect: (id: string, type: ParticipantType) => void
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ParticipantRow({
  participant,
  creatingForId,
  onSelect,
}: ParticipantRowProps) {
  const isCreating = creatingForId === participant.id
  const isAnyCreating = creatingForId !== null

  return (
    <button
      type="button"
      onClick={() => {
        if (!isAnyCreating) {
          onSelect(participant.id, participant.type)
        }
      }}
      disabled={isAnyCreating}
      aria-busy={isCreating}
      aria-label={`Start chat with ${participant.name}`}
      className={[
        'w-full flex items-center gap-3 px-4 py-3 text-left',
        'hover:bg-gray-50 active:bg-gray-100 transition-colors',
        'focus-visible:outline-none focus-visible:ring-2',
        'focus-visible:ring-blue-500 focus-visible:ring-inset',
        isAnyCreating ? 'cursor-not-allowed opacity-60' : 'cursor-pointer',
        // Keep full opacity on the row being created so the spinner stays visible
        isCreating ? 'opacity-100' : '',
      ].join(' ')}
    >
      {/* ------------------------------------------------------------------ */}
      {/* Avatar                                                              */}
      {/* ------------------------------------------------------------------ */}
      <div className="relative flex-shrink-0 w-11 h-11">
        {participant.profileImage ? (
          // profileImage is a full URL returned directly by the API
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={participant.profileImage}
            alt={`${participant.name} avatar`}
            width={44}
            height={44}
            className="w-11 h-11 rounded-full object-cover"
          />
        ) : (
          <div
            className={[
              'w-11 h-11 rounded-full flex items-center justify-center',
              'text-white text-base font-semibold',
              participant.type === 'BUSINESS' ? 'bg-blue-500' : 'bg-purple-500',
            ].join(' ')}
            aria-hidden="true"
          >
            {participant.name.slice(0, 1).toUpperCase()}
          </div>
        )}

        {/* Participant type badge (BUSINESS = store icon, PERSONAL = user icon) */}
        <span
          className={[
            'absolute -bottom-0.5 -right-0.5',
            'w-4 h-4 rounded-full flex items-center justify-center',
            'ring-2 ring-white',
            participant.type === 'BUSINESS' ? 'bg-blue-500' : 'bg-purple-500',
          ].join(' ')}
          aria-hidden="true"
        >
          {participant.type === 'BUSINESS' ? (
            <Store size={9} className="text-white" />
          ) : (
            <User size={9} className="text-white" />
          )}
        </span>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Text content                                                        */}
      {/* ------------------------------------------------------------------ */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900 truncate">
          {participant.name}
        </p>
        <p className="text-xs text-gray-500 truncate">
          {participant.subtitle ? participant.subtitle : `@${participant.username}`}
        </p>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Loading spinner — visible only while creating chat for this row    */}
      {/* ------------------------------------------------------------------ */}
      {isCreating && (
        <Loader2
          size={18}
          className="flex-shrink-0 text-blue-600 animate-spin"
          aria-hidden="true"
        />
      )}
    </button>
  )
}
