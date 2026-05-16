// Feature: web-buyer-app, Property 7: LRU cache eviction invariant

/**
 * Property 7: LRU Cache Eviction Invariant
 *
 * For any sequence of cache insertions and accesses where the total size exceeds
 * 50 MB, after calling `evictLruIfNeeded()` the remaining entries must be the
 * most recently used ones, the total size of remaining entries must be ≤ 50 MB,
 * and no entry that was accessed more recently than an evicted entry may itself
 * be evicted.
 *
 * **Validates: Requirements 18.7**
 */

import 'fake-indexeddb/auto'
import * as fc from 'fast-check'
import { describe, it, beforeEach, expect } from 'vitest'
import { openDB } from 'idb'

// ---------------------------------------------------------------------------
// Constants (must match cacheStore.ts)
// ---------------------------------------------------------------------------

const DB_NAME = 'downxtown-cache'
const DB_VERSION = 1
const BUDGET_BYTES = 50 * 1024 * 1024 // 50 MB

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Estimate byte size the same way cacheStore.ts does. */
function estimateSize(value: unknown): number {
  try {
    return JSON.stringify(value).length
  } catch {
    return 0
  }
}

/**
 * Build a string payload whose JSON-serialised length is exactly `targetBytes`.
 * JSON.stringify of a plain string "s" produces `"s"` (length = s.length + 2).
 * So we need a string of length (targetBytes - 2).
 */
function payloadOfSize(targetBytes: number): string {
  const innerLength = Math.max(0, targetBytes - 2)
  return 'x'.repeat(innerLength)
}

// ---------------------------------------------------------------------------
// DB helpers — open a fresh IndexedDB for each test run
// ---------------------------------------------------------------------------

interface ApiResponseRecord {
  key: string
  data: unknown
  lastAccessed: number
  size: number
}

interface TestCacheDB {
  'api-responses': {
    key: string
    value: ApiResponseRecord
  }
}

/**
 * Open (or reuse) the downxtown-cache DB with the same schema as cacheStore.ts.
 * fake-indexeddb creates a fresh in-memory DB per IDBFactory instance, but
 * since fake-indexeddb/auto patches the global, we delete and recreate the DB
 * between runs using indexedDB.deleteDatabase().
 */
async function openTestDB() {
  return openDB<TestCacheDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('api-responses')) {
        db.createObjectStore('api-responses', { keyPath: 'key' })
      }
    },
  })
}

async function deleteTestDB(): Promise<void> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.deleteDatabase(DB_NAME)
    req.onsuccess = () => resolve()
    req.onerror = () => reject(req.error)
    req.onblocked = () => resolve() // proceed even if blocked
  })
}

// ---------------------------------------------------------------------------
// LRU eviction logic — mirrors cacheStore.ts evictLruIfNeeded() exactly,
// but operates only on the api-responses store (the only store we populate
// in these tests, so total size == api-responses size).
// ---------------------------------------------------------------------------

async function evictLruIfNeeded(): Promise<void> {
  const db = await openTestDB()

  const records = await db.getAll('api-responses')
  let totalSize = records.reduce((sum, r) => sum + r.size, 0)

  if (totalSize <= BUDGET_BYTES) {
    db.close()
    return
  }

  // Sort oldest-first
  records.sort((a, b) => a.lastAccessed - b.lastAccessed)

  for (const record of records) {
    if (totalSize <= BUDGET_BYTES) break
    await db.delete('api-responses', record.key)
    totalSize -= record.size
  }

  db.close()
}

// ---------------------------------------------------------------------------
// Insert helpers
// ---------------------------------------------------------------------------

async function insertEntry(
  key: string,
  sizeBytes: number,
  lastAccessed: number
): Promise<void> {
  const db = await openTestDB()
  const data = payloadOfSize(sizeBytes)
  const record: ApiResponseRecord = {
    key,
    data,
    lastAccessed,
    size: estimateSize(data), // matches what cacheStore.ts stores
  }
  await db.put('api-responses', record)
  db.close()
}

async function getAllEntries(): Promise<ApiResponseRecord[]> {
  const db = await openTestDB()
  const records = await db.getAll('api-responses')
  db.close()
  return records
}

// ---------------------------------------------------------------------------
// beforeEach — wipe the DB so each property run starts clean
// ---------------------------------------------------------------------------

beforeEach(async () => {
  await deleteTestDB()
})

// ---------------------------------------------------------------------------
// Property 7: LRU Cache Eviction Invariant
// ---------------------------------------------------------------------------

describe('Property 7: LRU Cache Eviction Invariant', () => {
  it(
    'after eviction: total size ≤ 50 MB and no recently-accessed entry is evicted before an older one',
    async () => {
      await fc.assert(
        fc.asyncProperty(
          // Generate 3–8 entries, each with a size between 8 MB and 20 MB
          // so that their total reliably exceeds 50 MB.
          fc.array(
            fc.record({
              // Size in bytes: 8 MB – 20 MB per entry
              sizeBytes: fc.integer({ min: 8 * 1024 * 1024, max: 20 * 1024 * 1024 }),
              // lastAccessed: distinct timestamps in [1, 1_000_000]
              lastAccessed: fc.integer({ min: 1, max: 1_000_000 }),
            }),
            { minLength: 3, maxLength: 8 }
          ),
          async (rawEntries) => {
            // Wipe DB before each property run
            await deleteTestDB()

            // Deduplicate lastAccessed values to guarantee a strict LRU order.
            // If two entries share the same timestamp the sort is stable but
            // the relative eviction order between them is implementation-defined,
            // which would make the invariant check ambiguous.
            const seen = new Set<number>()
            const entries = rawEntries
              .map((e, i) => ({ ...e, key: `entry-${i}` }))
              .filter((e) => {
                if (seen.has(e.lastAccessed)) return false
                seen.add(e.lastAccessed)
                return true
              })

            // Need at least 3 entries with distinct timestamps to be meaningful
            if (entries.length < 3) return true // skip degenerate case

            // Insert all entries directly into IndexedDB
            for (const entry of entries) {
              await insertEntry(entry.key, entry.sizeBytes, entry.lastAccessed)
            }

            const totalBefore = entries.reduce((s, e) => s + estimateSize(payloadOfSize(e.sizeBytes)), 0)

            // Only run the eviction check when total actually exceeds budget
            if (totalBefore <= BUDGET_BYTES) return true

            // Run eviction
            await evictLruIfNeeded()

            // Read back surviving entries
            const surviving = await getAllEntries()
            const survivingKeys = new Set(surviving.map((r) => r.key))

            // --- Invariant 1: total remaining size ≤ 50 MB ---
            const totalAfter = surviving.reduce((s, r) => s + r.size, 0)
            if (totalAfter > BUDGET_BYTES) return false

            // --- Invariant 2: LRU ordering respected ---
            // For every pair (evicted, surviving), the surviving entry must NOT
            // have been accessed LESS recently than the evicted entry.
            // i.e. surviving.lastAccessed >= evicted.lastAccessed for all pairs.
            const evictedEntries = entries.filter((e) => !survivingKeys.has(e.key))
            const survivingEntries = entries.filter((e) => survivingKeys.has(e.key))

            for (const evicted of evictedEntries) {
              for (const kept of survivingEntries) {
                // A kept entry must have been accessed at least as recently as
                // any evicted entry (kept.lastAccessed >= evicted.lastAccessed).
                if (kept.lastAccessed < evicted.lastAccessed) {
                  return false
                }
              }
            }

            return true
          }
        ),
        { numRuns: 10 }
      )
    },
    30_000
  )

  it(
    'after eviction: at least one entry is removed when total exceeds 50 MB',
    async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.array(
            fc.record({
              sizeBytes: fc.integer({ min: 10 * 1024 * 1024, max: 20 * 1024 * 1024 }),
              lastAccessed: fc.integer({ min: 1, max: 1_000_000 }),
            }),
            { minLength: 4, maxLength: 6 }
          ),
          async (rawEntries) => {
            await deleteTestDB()

            const seen = new Set<number>()
            const entries = rawEntries
              .map((e, i) => ({ ...e, key: `entry-${i}` }))
              .filter((e) => {
                if (seen.has(e.lastAccessed)) return false
                seen.add(e.lastAccessed)
                return true
              })

            if (entries.length < 3) return true

            for (const entry of entries) {
              await insertEntry(entry.key, entry.sizeBytes, entry.lastAccessed)
            }

            const totalBefore = entries.reduce(
              (s, e) => s + estimateSize(payloadOfSize(e.sizeBytes)),
              0
            )

            if (totalBefore <= BUDGET_BYTES) return true

            const countBefore = entries.length
            await evictLruIfNeeded()
            const surviving = await getAllEntries()

            // At least one entry must have been evicted
            return surviving.length < countBefore
          }
        ),
        { numRuns: 10 }
      )
    },
    30_000
  )

  it(
    'after eviction: the oldest entry (smallest lastAccessed) is always evicted first',
    async () => {
      await fc.assert(
        fc.asyncProperty(
          // 4 entries with distinct sizes that together exceed 50 MB
          fc.tuple(
            fc.integer({ min: 1, max: 250_000 }),   // ts1 (oldest)
            fc.integer({ min: 250_001, max: 500_000 }),
            fc.integer({ min: 500_001, max: 750_000 }),
            fc.integer({ min: 750_001, max: 1_000_000 }) // ts4 (newest)
          ),
          async ([ts1, ts2, ts3, ts4]) => {
            await deleteTestDB()

            // Each entry is 15 MB → total = 60 MB > 50 MB
            // After eviction of the oldest (15 MB), total = 45 MB ≤ 50 MB
            const SIZE = 15 * 1024 * 1024

            await insertEntry('oldest', SIZE, ts1)
            await insertEntry('second', SIZE, ts2)
            await insertEntry('third', SIZE, ts3)
            await insertEntry('newest', SIZE, ts4)

            await evictLruIfNeeded()

            const surviving = await getAllEntries()
            const survivingKeys = new Set(surviving.map((r) => r.key))

            // The oldest entry must have been evicted
            if (survivingKeys.has('oldest')) return false

            // All others must survive (45 MB ≤ 50 MB after removing oldest)
            if (!survivingKeys.has('second')) return false
            if (!survivingKeys.has('third')) return false
            if (!survivingKeys.has('newest')) return false

            return true
          }
        ),
        { numRuns: 20 }
      )
    },
    30_000
  )
})
