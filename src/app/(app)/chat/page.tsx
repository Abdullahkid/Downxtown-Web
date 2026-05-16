'use client'

/**
 * Chat list page — `/chat`
 *
 * Displays all ChatRooms sorted by last message timestamp.
 * Tapping a room navigates to `/chat/{roomId}`.
 *
 * Requirements: 15.1, 1.4
 */

import React from 'react'
import { ChatRoomList } from '@/components/chat'

export default function ChatPage() {
  return (
    <main className="flex flex-col min-h-screen bg-white">
      {/* Page header */}
      <header className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-3">
        <h1 className="text-xl font-bold text-gray-900">Messages</h1>
      </header>

      {/* Room list */}
      <section className="flex-1 overflow-y-auto" aria-label="Chat conversations">
        <ChatRoomList />
      </section>
    </main>
  )
}
