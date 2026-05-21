'use client'

/**
 * Chat list page — `/chat`
 *
 * Displays all ChatRooms sorted by last message timestamp.
 * Tapping a room navigates to `/chat/{roomId}`.
 *
 * Requirements: 15.1, 1.4, 2.1
 */

import React from 'react'
import Link from 'next/link'
import { Pencil } from 'lucide-react'
import { ChatRoomList } from '@/components/chat'

export default function ChatPage() {
  return (
    <main className="flex flex-col min-h-screen bg-white">
      {/* Page header */}
      <header className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">Messages</h1>
          {/* New Chat action button (Req 2.1) */}
          <Link
            href="/chat/new"
            aria-label="Start a new chat"
            className={[
              'flex items-center gap-1.5 px-3 py-1.5 rounded-full',
              'bg-blue-600 text-white text-sm font-medium',
              'hover:bg-blue-700 active:bg-blue-800',
              'transition-colors focus-visible:outline-none focus-visible:ring-2',
              'focus-visible:ring-blue-500 focus-visible:ring-offset-2',
            ].join(' ')}
          >
            <Pencil size={15} aria-hidden="true" />
            New Chat
          </Link>
        </div>
      </header>

      {/* Room list */}
      <section className="flex-1 overflow-y-auto" aria-label="Chat conversations">
        <ChatRoomList />
      </section>
    </main>
  )
}
