/**
 * Offline queue store — serializes write actions attempted while offline and
 * replays them in order when the network is restored.
 * Requirements: 18.3, 26.6
 */

import { create } from 'zustand'
import { api } from '@/lib/api/apiClient'

export interface QueuedAction {
  id: string
  method: 'GET' | 'POST' | 'PUT' | 'DELETE'
  path: string
  body?: unknown
  timestamp: number
}

interface OfflineQueueState {
  queue: QueuedAction[]
}

interface OfflineQueueActions {
  /**
   * Add an action to the queue. `id` and `timestamp` are generated automatically.
   */
  enqueue: (action: Omit<QueuedAction, 'id' | 'timestamp'>) => void

  /**
   * Attempt to replay all queued actions against the API.
   * Successfully replayed actions are removed from the queue.
   * Failed actions remain so they can be retried on the next flush.
   */
  flush: () => Promise<void>
}

export type OfflineQueueStore = OfflineQueueState & OfflineQueueActions

export const useOfflineQueueStore = create<OfflineQueueStore>((set, get) => ({
  queue: [],

  enqueue: (action) => {
    const queued: QueuedAction = {
      ...action,
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      timestamp: Date.now(),
    }
    set((state) => ({ queue: [...state.queue, queued] }))
  },

  flush: async () => {
    const { queue } = get()
    if (queue.length === 0) return

    const successfulIds: string[] = []

    for (const action of queue) {
      try {
        const method = action.method.toLowerCase() as 'get' | 'post' | 'put' | 'delete'

        if (method === 'get') {
          await api.get(action.path)
        } else if (method === 'delete') {
          await api.delete(action.path)
        } else {
          // post / put both accept a body
          await api[method](action.path, action.body)
        }

        successfulIds.push(action.id)
      } catch {
        // Leave failed actions in the queue for the next flush attempt
      }
    }

    if (successfulIds.length > 0) {
      set((state) => ({
        queue: state.queue.filter((a) => !successfulIds.includes(a.id)),
      }))
    }
  },
}))
