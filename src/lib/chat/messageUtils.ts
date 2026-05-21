import type { ChatMessage } from '@/types/chat'

/**
 * Merges two arrays of ChatMessage objects, deduplicating by `message.id`.
 *
 * The `incoming` array is placed first (useful for prepending older paginated
 * messages), followed by any `existing` messages whose IDs were not already
 * present in `incoming`. When the same `id` appears in both arrays the
 * `incoming` entry is kept.
 *
 * Requirements: 6.4
 *
 * @param existing - Messages already displayed / held in state.
 * @param incoming - New messages to merge in (e.g. an older paginated page).
 * @returns A deduplicated array with `incoming` entries first.
 */
export function mergeMessages(
  existing: ChatMessage[],
  incoming: ChatMessage[],
): ChatMessage[] {
  const incomingIds = new Set<string>(incoming.map((m) => m.id))

  // Prepend incoming, then append any existing messages not already covered.
  return [...incoming, ...existing.filter((m) => !incomingIds.has(m.id))]
}
