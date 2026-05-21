/**
 * Cache Store — IndexedDB-backed persistence layer using `idb`.
 *
 * Database: `downxtown-cache`
 * Object stores: user-profile, feed-stores, search-history, chat-rooms, api-responses,
 *                chat-messages
 *
 * LRU eviction enforces a 50 MB total budget across all stores.
 * Per-room message cache is additionally capped at 30 rooms (LRU).
 *
 * Requirements: 18.1, 18.2, 18.7, 8.10, 8.1, 8.6
 */

import { openDB, type IDBPDatabase } from 'idb'
import type { Personal } from '@/types/user'
import type { FeedStore } from '@/types/feed'
import type { ChatRoomDto, ChatMessage } from '@/types/chat'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const DB_NAME = 'downxtown-cache'
const DB_VERSION = 2
const BUDGET_BYTES = 50 * 1024 * 1024 // 50 MB
const MAX_SEARCH_HISTORY = 50
const MAX_CACHED_ROOMS = 30

// ---------------------------------------------------------------------------
// Object-store record shapes
// ---------------------------------------------------------------------------

interface ProfileRecord {
  id: 'profile'
  data: Personal
  lastAccessed: number
  size: number
}

interface FeedRecord {
  id: 'feed'
  data: FeedStore[]
  lastAccessed: number
  size: number
}

interface SearchHistoryRecord {
  id: 'history'
  queries: string[]
  lastAccessed: number
  size: number
}

interface ChatRoomsRecord {
  id: 'rooms'
  data: ChatRoomDto[]
  lastAccessed: number
  size: number
}

interface ApiResponseRecord {
  key: string
  data: unknown
  lastAccessed: number
  size: number
}

/** Per-room message cache record stored in the `chat-messages` object store. */
export interface ChatMessageRecord {
  /** Primary key — the chat room ID. */
  roomId: string
  messages: ChatMessage[]
  lastAccessed: number
  size: number
}

// ---------------------------------------------------------------------------
// DB schema type (used by idb for type-safe access)
// ---------------------------------------------------------------------------

interface DownxtownCacheDB {
  'user-profile': {
    key: string
    value: ProfileRecord
  }
  'feed-stores': {
    key: string
    value: FeedRecord
  }
  'search-history': {
    key: string
    value: SearchHistoryRecord
  }
  'chat-rooms': {
    key: string
    value: ChatRoomsRecord
  }
  'api-responses': {
    key: string
    value: ApiResponseRecord
  }
  'chat-messages': {
    key: string
    value: ChatMessageRecord
  }
}

// ---------------------------------------------------------------------------
// CacheStore interface
// ---------------------------------------------------------------------------

export interface CacheStore {
  getUserProfile(): Promise<Personal | null>
  setUserProfile(profile: Personal): Promise<void>

  getFeedStores(): Promise<FeedStore[]>
  setFeedStores(stores: FeedStore[]): Promise<void>

  getSearchHistory(): Promise<string[]>
  addSearchQuery(query: string): Promise<void>
  clearSearchHistory(): Promise<void>

  getChatRooms(): Promise<ChatRoomDto[]>
  setChatRooms(rooms: ChatRoomDto[]): Promise<void>

  getApiResponse<T>(key: string): Promise<T | null>
  setApiResponse<T>(key: string, value: T): Promise<void>

  getMessages(roomId: string): Promise<ChatMessage[]>
  setMessages(roomId: string, messages: ChatMessage[]): Promise<void>

  evictLruIfNeeded(): Promise<void>
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Estimate byte size of a value by serialising it to JSON. */
function estimateSize(value: unknown): number {
  try {
    return JSON.stringify(value).length
  } catch {
    return 0
  }
}

// ---------------------------------------------------------------------------
// Implementation
// ---------------------------------------------------------------------------

class CacheStoreImpl implements CacheStore {
  private dbPromise: Promise<IDBPDatabase<DownxtownCacheDB>>

  constructor() {
    this.dbPromise = openDB<DownxtownCacheDB>(DB_NAME, DB_VERSION, {
      upgrade(db, oldVersion) {
        // Version 1 stores — created on fresh install or upgrade from nothing
        if (oldVersion < 1) {
          if (!db.objectStoreNames.contains('user-profile')) {
            db.createObjectStore('user-profile', { keyPath: 'id' })
          }
          if (!db.objectStoreNames.contains('feed-stores')) {
            db.createObjectStore('feed-stores', { keyPath: 'id' })
          }
          if (!db.objectStoreNames.contains('search-history')) {
            db.createObjectStore('search-history', { keyPath: 'id' })
          }
          if (!db.objectStoreNames.contains('chat-rooms')) {
            db.createObjectStore('chat-rooms', { keyPath: 'id' })
          }
          if (!db.objectStoreNames.contains('api-responses')) {
            db.createObjectStore('api-responses', { keyPath: 'key' })
          }
        }

        // Version 2 — per-room message cache (Requirements: 8.1)
        if (oldVersion < 2) {
          if (!db.objectStoreNames.contains('chat-messages')) {
            db.createObjectStore('chat-messages', { keyPath: 'roomId' })
          }
        }
      },
    })
  }

  private async db(): Promise<IDBPDatabase<DownxtownCacheDB>> {
    return this.dbPromise
  }

  // -------------------------------------------------------------------------
  // User Profile
  // -------------------------------------------------------------------------

  async getUserProfile(): Promise<Personal | null> {
    const db = await this.db()
    const record = await db.get('user-profile', 'profile')
    if (!record) return null

    // Update lastAccessed timestamp
    await db.put('user-profile', { ...record, lastAccessed: Date.now() })
    return record.data
  }

  async setUserProfile(profile: Personal): Promise<void> {
    const db = await this.db()
    const size = estimateSize(profile)
    const record: ProfileRecord = {
      id: 'profile',
      data: profile,
      lastAccessed: Date.now(),
      size,
    }
    await db.put('user-profile', record)
    await this.evictLruIfNeeded()
  }

  // -------------------------------------------------------------------------
  // Feed Stores
  // -------------------------------------------------------------------------

  async getFeedStores(): Promise<FeedStore[]> {
    const db = await this.db()
    const record = await db.get('feed-stores', 'feed')
    if (!record) return []

    await db.put('feed-stores', { ...record, lastAccessed: Date.now() })
    return record.data
  }

  async setFeedStores(stores: FeedStore[]): Promise<void> {
    const db = await this.db()
    const size = estimateSize(stores)
    const record: FeedRecord = {
      id: 'feed',
      data: stores,
      lastAccessed: Date.now(),
      size,
    }
    await db.put('feed-stores', record)
    await this.evictLruIfNeeded()
  }

  // -------------------------------------------------------------------------
  // Search History
  // -------------------------------------------------------------------------

  async getSearchHistory(): Promise<string[]> {
    const db = await this.db()
    const record = await db.get('search-history', 'history')
    if (!record) return []

    await db.put('search-history', { ...record, lastAccessed: Date.now() })
    return record.queries
  }

  async addSearchQuery(query: string): Promise<void> {
    const db = await this.db()
    const existing = await db.get('search-history', 'history')
    const currentQueries: string[] = existing?.queries ?? []

    // Prepend, deduplicate, cap at MAX_SEARCH_HISTORY
    const deduped = [query, ...currentQueries.filter((q) => q !== query)]
    const capped = deduped.slice(0, MAX_SEARCH_HISTORY)

    const record: SearchHistoryRecord = {
      id: 'history',
      queries: capped,
      lastAccessed: Date.now(),
      size: estimateSize(capped),
    }
    await db.put('search-history', record)
  }

  async clearSearchHistory(): Promise<void> {
    const db = await this.db()
    await db.delete('search-history', 'history')
  }

  // -------------------------------------------------------------------------
  // Chat Rooms
  // -------------------------------------------------------------------------

  async getChatRooms(): Promise<ChatRoomDto[]> {
    const db = await this.db()
    const record = await db.get('chat-rooms', 'rooms')
    if (!record) return []

    await db.put('chat-rooms', { ...record, lastAccessed: Date.now() })
    return record.data
  }

  async setChatRooms(rooms: ChatRoomDto[]): Promise<void> {
    const db = await this.db()
    const size = estimateSize(rooms)
    const record: ChatRoomsRecord = {
      id: 'rooms',
      data: rooms,
      lastAccessed: Date.now(),
      size,
    }
    await db.put('chat-rooms', record)
    await this.evictLruIfNeeded()
  }

  // -------------------------------------------------------------------------
  // API Response Cache
  // -------------------------------------------------------------------------

  async getApiResponse<T>(key: string): Promise<T | null> {
    const db = await this.db()
    const record = await db.get('api-responses', key)
    if (!record) return null

    // Touch lastAccessed
    await db.put('api-responses', { ...record, lastAccessed: Date.now() })
    return record.data as T
  }

  async setApiResponse<T>(key: string, value: T): Promise<void> {
    const db = await this.db()
    const size = estimateSize(value)
    const record: ApiResponseRecord = {
      key,
      data: value,
      lastAccessed: Date.now(),
      size,
    }
    await db.put('api-responses', record)
    await this.evictLruIfNeeded()
  }

  // -------------------------------------------------------------------------
  // Per-Room Message Cache (Requirements: 8.1, 8.6)
  // -------------------------------------------------------------------------

  async getMessages(roomId: string): Promise<ChatMessage[]> {
    const db = await this.db()
    const record = await db.get('chat-messages', roomId)
    if (!record) return []

    // Touch lastAccessed so this room doesn't get evicted prematurely
    await db.put('chat-messages', { ...record, lastAccessed: Date.now() })
    return record.messages
  }

  async setMessages(roomId: string, messages: ChatMessage[]): Promise<void> {
    const db = await this.db()
    const size = estimateSize(messages)
    const record: ChatMessageRecord = {
      roomId,
      messages,
      lastAccessed: Date.now(),
      size,
    }
    await db.put('chat-messages', record)

    // LRU eviction: keep at most MAX_CACHED_ROOMS (30) distinct rooms (Req 8.6)
    const allRecords = await db.getAll('chat-messages')
    if (allRecords.length > MAX_CACHED_ROOMS) {
      // Sort ascending by lastAccessed — oldest first
      allRecords.sort((a, b) => a.lastAccessed - b.lastAccessed)
      // Evict until we are back at the cap
      const toEvict = allRecords.slice(0, allRecords.length - MAX_CACHED_ROOMS)
      for (const staleRecord of toEvict) {
        await db.delete('chat-messages', staleRecord.roomId)
      }
    }
  }

  // -------------------------------------------------------------------------
  // LRU Eviction
  // -------------------------------------------------------------------------

  /**
   * Collects all entries across every store, sorted by `lastAccessed` ascending
   * (oldest first). Evicts entries one by one until total size ≤ 50 MB.
   *
   * Requirements: 18.7
   */
  async evictLruIfNeeded(): Promise<void> {
    const db = await this.db()

    // Gather all entries with their store name, key, size, and lastAccessed
    type EvictableEntry = {
      store: keyof DownxtownCacheDB
      key: string
      size: number
      lastAccessed: number
    }

    const entries: EvictableEntry[] = []

    // user-profile
    const profileRecords = await db.getAll('user-profile')
    for (const r of profileRecords) {
      entries.push({ store: 'user-profile', key: r.id, size: r.size, lastAccessed: r.lastAccessed })
    }

    // feed-stores
    const feedRecords = await db.getAll('feed-stores')
    for (const r of feedRecords) {
      entries.push({ store: 'feed-stores', key: r.id, size: r.size, lastAccessed: r.lastAccessed })
    }

    // search-history
    const historyRecords = await db.getAll('search-history')
    for (const r of historyRecords) {
      entries.push({ store: 'search-history', key: r.id, size: r.size, lastAccessed: r.lastAccessed })
    }

    // chat-rooms
    const chatRecords = await db.getAll('chat-rooms')
    for (const r of chatRecords) {
      entries.push({ store: 'chat-rooms', key: r.id, size: r.size, lastAccessed: r.lastAccessed })
    }

    // api-responses
    const apiRecords = await db.getAll('api-responses')
    for (const r of apiRecords) {
      entries.push({ store: 'api-responses', key: r.key, size: r.size, lastAccessed: r.lastAccessed })
    }

    // chat-messages
    const chatMessageRecords = await db.getAll('chat-messages')
    for (const r of chatMessageRecords) {
      entries.push({ store: 'chat-messages', key: r.roomId, size: r.size, lastAccessed: r.lastAccessed })
    }

    // Calculate total size
    let totalSize = entries.reduce((sum, e) => sum + e.size, 0)

    if (totalSize <= BUDGET_BYTES) return

    // Sort by lastAccessed ascending — evict oldest first
    entries.sort((a, b) => a.lastAccessed - b.lastAccessed)

    for (const entry of entries) {
      if (totalSize <= BUDGET_BYTES) break

      await db.delete(entry.store, entry.key)
      totalSize -= entry.size
    }
  }
}

// ---------------------------------------------------------------------------
// Singleton export
// ---------------------------------------------------------------------------

export const cacheStore: CacheStore = new CacheStoreImpl()
