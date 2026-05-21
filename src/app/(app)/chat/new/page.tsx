'use client'

/**
 * Start_Chat_Page — `/chat/new`
 *
 * Lets the buyer search for users and stores to begin a new conversation.
 *
 * Sections:
 *  - Search input (debounced 300 ms)
 *  - When query ≥ 1 char:  Search Results (GET /chat/search-users)
 *  - When query is empty:  Recent Interactions (GET /chat/recent-interactions)
 *                          Your Network        (GET /chat/network)
 *
 * Each section is an independent TanStack Query `useQuery`; one error does
 * not affect the others.
 *
 * Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 2.9, 2.10,
 *               2.11, 2.15, 2.16
 */

import React, { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Search, X, User, AlertCircle } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { useDebounce } from '@/hooks/useDebounce'
import { api } from '@/lib/api/apiClient'
import { ShimmerCard } from '@/components/shared/ShimmerCard'
import { ParticipantRow } from '@/components/chat/ParticipantRow'
import { useUiStore } from '@/store/uiStore'
import type { ChatParticipant, ParticipantType } from '@/types/chat'

// ---------------------------------------------------------------------------
// Raw API response shapes (as returned by sigma-ktor)
// ---------------------------------------------------------------------------

interface CreateChatResponse {
  chatRoomId: string
}

/** Shape returned by GET /chat/search-users */
interface RawSearchResult {
  userId: string
  name: string
  username: string
  userType: ParticipantType
  profileImageUrl?: string | null
  storeName?: string | null
}
interface RawSearchResponse {
  users: RawSearchResult[]
  totalResults: number
  hasMore: boolean
}

/** Shape returned by GET /chat/recent-interactions */
interface RawRecentPartner {
  id: string
  name: string
  profileImage?: string | null
  participantType: ParticipantType
  lastInteraction: number
}

/** Shape returned by GET /chat/network */
interface RawNetworkResponse {
  followedStores: RawRecentPartner[]
  friends?: RawRecentPartner[]
}

// ---------------------------------------------------------------------------
// Normalisers — convert raw API shapes to ChatParticipant
// ---------------------------------------------------------------------------

function normaliseSearchResult(raw: RawSearchResult): ChatParticipant {
  const isBusiness = raw.userType === 'BUSINESS'
  return {
    id: raw.userId,
    // For stores: show the store name in bold, not the owner's name
    name: isBusiness ? (raw.storeName ?? raw.name) : raw.name,
    username: raw.username,
    type: raw.userType,
    profileImage: raw.profileImageUrl ?? null,
    // @username is already shown by ParticipantRow as the grey secondary line
    subtitle: undefined,
  }
}

function normaliseRecentPartner(raw: RawRecentPartner): ChatParticipant {
  return {
    id: raw.id,
    name: raw.name,
    // recent-interactions API has no username field — fall back to name
    username: raw.name,
    type: raw.participantType,
    profileImage: raw.profileImage ?? null,
  }
}

// ---------------------------------------------------------------------------
// Section skeleton
// ---------------------------------------------------------------------------

function SectionSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div role="status" aria-label="Loading…" aria-busy="true" className="space-y-0">
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="flex items-center gap-3 px-4 py-3">
          <ShimmerCard width={44} height={44} className="rounded-full flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <ShimmerCard width="55%" height={14} />
            <ShimmerCard width="40%" height={11} />
          </div>
        </div>
      ))}
      <span className="sr-only">Loading…</span>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Inline error state — compact, for within-section errors
// ---------------------------------------------------------------------------

function SectionError({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div
      role="alert"
      className="flex items-center justify-between gap-3 px-4 py-4"
    >
      <div className="flex items-center gap-2 min-w-0">
        <AlertCircle size={16} className="flex-shrink-0 text-red-500" aria-hidden="true" />
        <p className="text-sm text-gray-600 truncate">{message}</p>
      </div>
      <button
        type="button"
        onClick={onRetry}
        className={[
          'flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold',
          'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800',
          'focus-visible:outline focus-visible:outline-2',
          'focus-visible:outline-offset-2 focus-visible:outline-blue-600',
          'transition-colors',
        ].join(' ')}
      >
        Retry
      </button>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Section divider
// ---------------------------------------------------------------------------

function SectionDivider() {
  return <div className="mx-4 border-b border-gray-100" aria-hidden="true" />
}

// ---------------------------------------------------------------------------
// Start_Chat_Page
// ---------------------------------------------------------------------------

export default function StartChatPage() {
  const router = useRouter()
  const uiStore = useUiStore()

  // Raw query value (controlled input)
  const [rawQuery, setRawQuery] = useState('')
  // Debounced query drives the search API call (Req 2.8)
  const debouncedQuery = useDebounce(rawQuery, 300)
  // ID of the participant whose chat is currently being created (Req 2.14)
  const [creatingForId, setCreatingForId] = useState<string | null>(null)

  // Whether to show search results or static sections
  const showSearch = debouncedQuery.length >= 1

  // -------------------------------------------------------------------------
  // Query: Recent Interactions — GET /chat/recent-interactions?limit=20
  // Returns List<RecentChatPartner> directly (no wrapper).
  // Only enabled when not in search mode (Req 2.11).
  // -------------------------------------------------------------------------
  const {
    data: recentData,
    isLoading: recentLoading,
    isError: recentError,
    refetch: refetchRecent,
  } = useQuery<ChatParticipant[]>({
    queryKey: ['chat', 'recent-interactions'],
    queryFn: async () => {
      const raw = await api.get<RawRecentPartner[]>('/chat/recent-interactions?limit=20')
      return Array.isArray(raw) ? raw.map(normaliseRecentPartner) : []
    },
    enabled: !showSearch,
    staleTime: 60_000,
  })

  // -------------------------------------------------------------------------
  // Query: Your Network — GET /chat/network
  // Returns { followedStores: [...], friends: [...] } — we merge both lists.
  // Only enabled when not in search mode (Req 2.11).
  // -------------------------------------------------------------------------
  const {
    data: networkData,
    isLoading: networkLoading,
    isError: networkError,
    refetch: refetchNetwork,
  } = useQuery<ChatParticipant[]>({
    queryKey: ['chat', 'network'],
    queryFn: async () => {
      const raw = await api.get<RawNetworkResponse>('/chat/network')
      const stores = Array.isArray(raw?.followedStores) ? raw.followedStores : []
      const friends = Array.isArray(raw?.friends) ? raw.friends : []
      return [...stores, ...friends].map(normaliseRecentPartner)
    },
    enabled: !showSearch,
    staleTime: 60_000,
  })

  // -------------------------------------------------------------------------
  // Query: Search Users — GET /chat/search-users?q={query}&limit=20
  // Returns { users: [...], totalResults, hasMore } — we unwrap the users list.
  // Only enabled when query ≥ 1 char (Req 2.8).
  // -------------------------------------------------------------------------
  const {
    data: searchData,
    isLoading: searchLoading,
    isError: searchError,
    refetch: refetchSearch,
  } = useQuery<ChatParticipant[]>({
    queryKey: ['chat', 'search-users', debouncedQuery],
    queryFn: async ({ signal }) => {
      const raw = await api.get<RawSearchResponse>(
        `/chat/search-users?q=${encodeURIComponent(debouncedQuery)}&limit=20`,
        { signal } as never,
      )
      return Array.isArray(raw?.users) ? raw.users.map(normaliseSearchResult) : []
    },
    enabled: showSearch,
    staleTime: 0,
  })

  // -------------------------------------------------------------------------
  // Handle participant selection — POST /chat/create (Req 2.12, 2.13, 2.14)
  // -------------------------------------------------------------------------
  const handleSelect = useCallback(
    async (targetUserId: string, targetUserType: ParticipantType) => {
      if (creatingForId !== null) return // prevent duplicate submissions

      setCreatingForId(targetUserId)
      try {
        const { chatRoomId } = await api.post<CreateChatResponse>('/chat/create', {
          targetUserId,
          targetUserType,
        })
        router.push(`/chat/${chatRoomId}`)
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : 'Failed to start chat. Please try again.'
        uiStore.addToast({
          id: crypto.randomUUID(),
          message,
          type: 'error',
        })
        setCreatingForId(null)
      }
    },
    [creatingForId, router, uiStore],
  )

  // -------------------------------------------------------------------------
  // Combined empty state check (Req 2.15)
  // Both sections loaded successfully but both are empty.
  // -------------------------------------------------------------------------
  const bothLoaded = !recentLoading && !networkLoading
  const bothEmpty =
    bothLoaded &&
    !recentError &&
    !networkError &&
    (recentData?.length ?? 0) === 0 &&
    (networkData?.length ?? 0) === 0

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------
  return (
    <main className="flex flex-col min-h-screen bg-white">

      {/* ------------------------------------------------------------------ */}
      {/* Header                                                              */}
      {/* ------------------------------------------------------------------ */}
      <header className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className={[
              'flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center',
              'bg-white border border-gray-200 text-gray-600',
              'hover:bg-gray-50 active:bg-gray-100 transition-colors',
              'focus-visible:outline focus-visible:outline-2',
              'focus-visible:outline-offset-2 focus-visible:outline-blue-600',
            ].join(' ')}
            aria-label="Go back"
          >
            <ArrowLeft size={18} aria-hidden="true" />
          </button>
          <h1 className="text-lg font-bold text-gray-900">Start a New Chat</h1>
        </div>
      </header>

      {/* ------------------------------------------------------------------ */}
      {/* Search input                                                        */}
      {/* ------------------------------------------------------------------ */}
      <div className="px-4 py-3 border-b border-gray-100">
        <div className="relative">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            aria-hidden="true"
          />
          <input
            type="search"
            value={rawQuery}
            onChange={(e) => setRawQuery(e.target.value)}
            placeholder="Search users or stores…"
            aria-label="Search users or stores"
            autoComplete="off"
            className={[
              'w-full pl-9 pr-10 py-2.5 rounded-xl text-sm',
              'bg-gray-100 text-gray-900 placeholder-gray-400',
              'border border-transparent',
              'focus:outline-none focus:bg-white focus:border-blue-400',
              'transition-colors',
            ].join(' ')}
          />
          {rawQuery.length > 0 && (
            <button
              type="button"
              onClick={() => setRawQuery('')}
              aria-label="Clear search"
              className={[
                'absolute right-2 top-1/2 -translate-y-1/2',
                'w-6 h-6 rounded-full flex items-center justify-center',
                'text-gray-400 hover:text-gray-600 hover:bg-gray-200',
                'transition-colors',
              ].join(' ')}
            >
              <X size={14} aria-hidden="true" />
            </button>
          )}
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Content area                                                        */}
      {/* ------------------------------------------------------------------ */}
      <div className="flex-1 overflow-y-auto">

        {/* ---- Search Results (visible when query ≥ 1 char) -------------- */}
        {showSearch && (
          <section aria-label="Search results">
            {/* Loading skeleton (Req 2.9) */}
            {searchLoading && <SectionSkeleton rows={4} />}

            {/* Error state (Req 2.10) */}
            {!searchLoading && searchError && (
              <SectionError
                message="Could not search. Please try again."
                onRetry={() => refetchSearch()}
              />
            )}

            {/* Results */}
            {!searchLoading && !searchError && searchData && (
              <>
                {searchData.length > 0 ? (
                  <ul role="list" aria-label="Search results">
                    {searchData.map((participant, index) => (
                      <li key={participant.id} role="listitem">
                        <ParticipantRow
                          participant={participant}
                          creatingForId={creatingForId}
                          onSelect={handleSelect}
                        />
                        {index < searchData.length - 1 && <SectionDivider />}
                      </li>
                    ))}
                  </ul>
                ) : (
                  /* Zero results empty state (Req 2.16) */
                  <div
                    className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center"
                    role="status"
                  >
                    <Search
                      size={40}
                      strokeWidth={1.5}
                      className="text-gray-300"
                      aria-hidden="true"
                    />
                    <p className="text-sm font-medium text-gray-500">
                      No users or stores found. Try a different search.
                    </p>
                  </div>
                )}
              </>
            )}
          </section>
        )}

        {/* ---- Static sections (visible when query is empty) ------------- */}
        {!showSearch && (
          <>
            {/* Combined empty state when both sections are empty (Req 2.15) */}
            {bothEmpty && (
              <div
                className="flex flex-col items-center justify-center gap-3 px-6 py-20 text-center"
                role="status"
              >
                <User
                  size={48}
                  strokeWidth={1.5}
                  className="text-gray-300"
                  aria-hidden="true"
                />
                <p className="text-sm font-medium text-gray-500">
                  No recent interactions. Visit a store to start chatting.
                </p>
              </div>
            )}

            {/* Only show sections if not in combined empty state */}
            {!bothEmpty && (
              <>
                {/* ---- Recent Interactions (Req 2.2–2.4) ----------------- */}
                <section aria-label="Recent Interactions">
                  <div className="px-4 pt-4 pb-1">
                    <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      Recent Interactions
                    </h2>
                  </div>

                  {/* Loading skeleton (Req 2.3) */}
                  {recentLoading && <SectionSkeleton rows={3} />}

                  {/* Error state (Req 2.4) */}
                  {!recentLoading && recentError && (
                    <SectionError
                      message="Could not load recent interactions."
                      onRetry={() => refetchRecent()}
                    />
                  )}

                  {/* Results or empty state */}
                  {!recentLoading && !recentError && recentData && (
                    <>
                      {recentData.length > 0 ? (
                        <ul role="list" aria-label="Recent interactions">
                          {recentData.map((participant, index) => (
                            <li key={participant.id} role="listitem">
                              <ParticipantRow
                                participant={participant}
                                creatingForId={creatingForId}
                                onSelect={handleSelect}
                              />
                              {index < recentData.length - 1 && <SectionDivider />}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        /* Individual empty state — only shown when the other section has items */
                        <p className="px-4 py-3 text-sm text-gray-400 italic">
                          No recent interactions yet.
                        </p>
                      )}
                    </>
                  )}
                </section>

                {/* Section separator */}
                <div className="mx-4 my-2 border-b border-gray-100" aria-hidden="true" />

                {/* ---- Your Network (Req 2.5–2.7) ------------------------ */}
                <section aria-label="Your Network">
                  <div className="px-4 pt-3 pb-1">
                    <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      Your Network
                    </h2>
                  </div>

                  {/* Loading skeleton (Req 2.6) */}
                  {networkLoading && <SectionSkeleton rows={3} />}

                  {/* Error state (Req 2.7) */}
                  {!networkLoading && networkError && (
                    <SectionError
                      message="Could not load your network."
                      onRetry={() => refetchNetwork()}
                    />
                  )}

                  {/* Results or empty state */}
                  {!networkLoading && !networkError && networkData && (
                    <>
                      {networkData.length > 0 ? (
                        <ul role="list" aria-label="Your network">
                          {networkData.map((participant, index) => (
                            <li key={participant.id} role="listitem">
                              <ParticipantRow
                                participant={participant}
                                creatingForId={creatingForId}
                                onSelect={handleSelect}
                              />
                              {index < networkData.length - 1 && <SectionDivider />}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="px-4 py-3 text-sm text-gray-400 italic">
                          No stores in your network yet.
                        </p>
                      )}
                    </>
                  )}
                </section>

                {/* Bottom padding */}
                <div className="h-8" aria-hidden="true" />
              </>
            )}
          </>
        )}
      </div>
    </main>
  )
}
