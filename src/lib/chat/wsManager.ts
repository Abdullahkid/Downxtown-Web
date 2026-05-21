/**
 * WS_Manager — singleton WebSocket connection manager for the Downxtown chat system.
 *
 * Manages a single persistent WebSocket connection to wss://api.downxtown.com/chat/ws.
 * Handles exponential-backoff reconnection, outgoing event queuing, room join/leave
 * tracking, typing indicators (throttle + auto-stop), and an event listener registry.
 *
 * Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.9, 1.10, 1.11, 1.12, 4.1, 4.2, 4.3,
 *               4.4, 4.8
 */

import { getBackoffDelay } from '@/hooks/useWebSocket'
import type {
  MessageType,
  OutgoingMessage,
  QueuedEvent,
  WsEventType,
  WsStatus,
} from '@/types/chat'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const WS_URL = 'wss://api.downxtown.com/chat/ws'
const MAX_RECONNECT_ATTEMPTS = 10
/** Minimum ms between `typing_started` sends for the same room (Req 4.8). */
const TYPING_THROTTLE_MS = 2_000
/** Ms of typing silence before `typing_stopped` is auto-sent (Req 4.2). */
const TYPING_STOP_DELAY_MS = 2_000

// ---------------------------------------------------------------------------
// Internal types
// ---------------------------------------------------------------------------

type WsListener = (event: WsEventType, payload: unknown) => void
type StatusListener = (s: WsStatus) => void

interface TypingState {
  /** Handle for the auto typing_stopped timeout. */
  timer: ReturnType<typeof setTimeout> | null
  /** Timestamp of the last `typing_started` sent for this room. */
  lastSentAt: number
}

// ---------------------------------------------------------------------------
// WsManager class
// ---------------------------------------------------------------------------

class WsManager {
  private ws: WebSocket | null = null
  private status: WsStatus = 'disconnected'
  private attempt = 0
  private intentionalClose = false
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null

  /** Token stored so we can reconnect with a fresh copy when needed. */
  private token: string | null = null

  /** Outgoing events buffered while the connection is down (Req 1.11). */
  private outgoingQueue: QueuedEvent[] = []

  /** Rooms currently joined — re-joined after every reconnect (Req 1.12). */
  private activeRooms: Set<string> = new Set()

  /** Per-room typing debounce state (Req 4.8). */
  private typingStates: Map<string, TypingState> = new Map()

  /** Incoming-event listeners registered by components. */
  private listeners: Set<WsListener> = new Set()

  /** Connection-status listeners (e.g. WsProvider banner updates). */
  private statusListeners: Set<StatusListener> = new Set()

  // -------------------------------------------------------------------------
  // Public API
  // -------------------------------------------------------------------------

  /**
   * Open the WebSocket using a Firebase ID token.
   * If a token is absent the manager stays `disconnected` (Req 1.2).
   */
  connect(token: string): void {
    if (!token) {
      this.setStatus('disconnected')
      return
    }
    this.token = token
    this.intentionalClose = false
    this.attempt = 0
    this.createWebSocket(token)
  }

  /**
   * Gracefully close the WebSocket and stop all reconnection attempts.
   */
  disconnect(): void {
    this.intentionalClose = true
    this.clearReconnectTimer()
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
    this.setStatus('disconnected')
  }

  /**
   * Transmit a JSON-encoded event to the server.
   * If the connection is not `connected`, the event is buffered (Req 1.11).
   */
  send(event: string, payload: unknown): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ event, ...((payload as object) ?? {}) }))
    } else {
      this.outgoingQueue.push({ event, payload, enqueuedAt: Date.now() })
    }
  }

  /**
   * High-level helper: send a `send_message` event with a temporary client ID.
   * Queued automatically if disconnected (Req 1.10, 1.11).
   */
  sendMessage(
    roomId: string,
    type: MessageType,
    payload: Partial<OutgoingMessage>,
    tempId: string,
  ): void {
    this.send('send_message', { roomId, type, tempId, ...payload })
  }

  /**
   * Track the room and send `join_chat_room` to the server (Req 1.5).
   * The room is also recorded so it can be rejoined after a reconnect (Req 1.12).
   */
  joinRoom(roomId: string): void {
    this.activeRooms.add(roomId)
    this.send('join_chat_room', { roomId })
  }

  /**
   * Untrack the room and send `leave_chat_room` to the server (Req 1.6).
   */
  leaveRoom(roomId: string): void {
    this.activeRooms.delete(roomId)
    this.send('leave_chat_room', { roomId })
  }

  /**
   * Typing throttle + auto-stop.
   *
   * - Sends `typing_started` at most once per TYPING_THROTTLE_MS per room (Req 4.8, 4.1).
   * - Always resets the 2000 ms auto-stop timer (Req 4.2).
   */
  notifyTyping(roomId: string): void {
    const now = Date.now()
    const state = this.getOrCreateTypingState(roomId)

    // Rate-gate: only send if the throttle window has elapsed (Req 4.8).
    if (now - state.lastSentAt >= TYPING_THROTTLE_MS) {
      this.send('typing_started', { roomId })
      state.lastSentAt = now
    }

    // Always reset the auto-stop timer (Req 4.2).
    this.resetTypingStopTimer(roomId, state)
  }

  /**
   * Immediately send `typing_stopped` and cancel any pending debounce timer (Req 4.3, 4.4).
   */
  stopTyping(roomId: string): void {
    const state = this.typingStates.get(roomId)
    if (state?.timer !== null && state?.timer !== undefined) {
      clearTimeout(state.timer)
      state.timer = null
    }
    // Reset tracking so the next notifyTyping immediately sends a new typing_started.
    if (state) {
      state.lastSentAt = 0
    }
    this.send('typing_stopped', { roomId })
  }

  /**
   * Register a listener for incoming server events.
   * Returns an unsubscribe function.
   */
  addListener(listener: WsListener): () => void {
    this.listeners.add(listener)
    return () => {
      this.listeners.delete(listener)
    }
  }

  /**
   * Register a listener for connection-status changes.
   * Returns an unsubscribe function.
   */
  onStatusChange(listener: StatusListener): () => void {
    this.statusListeners.add(listener)
    return () => {
      this.statusListeners.delete(listener)
    }
  }

  /** Return the current connection status synchronously. */
  getStatus(): WsStatus {
    return this.status
  }

  // -------------------------------------------------------------------------
  // Private helpers
  // -------------------------------------------------------------------------

  /** Open a new WebSocket with the token appended as a query param (Req 1.3). */
  private createWebSocket(token: string): void {
    this.setStatus('connecting')

    const url = `${WS_URL}?token=${encodeURIComponent(token)}`
    const ws = new WebSocket(url)
    this.ws = ws

    ws.onopen = () => {
      this.attempt = 0
      this.setStatus('connected')
      // Re-join rooms and flush queued events in the correct order (Req 1.12).
      this.rejoinRooms()
      this.flushQueue()
    }

    ws.onmessage = (ev: MessageEvent) => {
      try {
        const parsed = JSON.parse(ev.data as string) as { event: WsEventType; [k: string]: unknown }
        const { event, ...rest } = parsed
        this.dispatch(event, rest)
      } catch {
        // Non-JSON frame — ignore.
      }
    }

    ws.onclose = () => {
      if (this.intentionalClose) {
        this.setStatus('disconnected')
        return
      }
      this.scheduleReconnect()
    }

    ws.onerror = () => {
      // onerror is always followed by onclose; let onclose handle reconnection.
      ws.close()
    }
  }

  /**
   * Schedule the next reconnection attempt with exponential backoff (Req 1.4).
   * After MAX_RECONNECT_ATTEMPTS, set status to `disconnected` and stop (Req 1.9).
   */
  private scheduleReconnect(): void {
    if (this.attempt >= MAX_RECONNECT_ATTEMPTS) {
      // Req 1.9: exceed max attempts → disconnected, no more retries.
      this.setStatus('disconnected')
      return
    }

    this.setStatus('reconnecting')
    const delay = getBackoffDelay(this.attempt)
    this.attempt += 1

    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null
      if (!this.intentionalClose && this.token) {
        this.createWebSocket(this.token)
      }
    }, delay)
  }

  /**
   * Re-send `join_chat_room` for every active room after a reconnect (Req 1.12).
   * This runs before `flushQueue` so room-join events always precede queued messages.
   */
  private rejoinRooms(): void {
    for (const roomId of this.activeRooms) {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ event: 'join_chat_room', roomId }))
      }
    }
  }

  /**
   * Drain the outgoing queue in FIFO order after rooms have been rejoined (Req 1.11).
   * The queue is already in enqueue order (no sorting needed — items are appended).
   */
  private flushQueue(): void {
    const queued = this.outgoingQueue.splice(0)
    for (const item of queued) {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ event: item.event, ...(item.payload as object ?? {}) }))
      } else {
        // Connection closed again during flush — re-queue remaining events.
        this.outgoingQueue.unshift(item)
        break
      }
    }
  }

  /**
   * Notify all registered listeners about an incoming server event.
   */
  private dispatch(event: WsEventType, payload: unknown): void {
    for (const listener of this.listeners) {
      listener(event, payload)
    }
  }

  /** Update `status` and notify all status listeners. */
  private setStatus(s: WsStatus): void {
    if (this.status === s) return
    this.status = s
    for (const listener of this.statusListeners) {
      listener(s)
    }
  }

  /** Cancel any pending reconnect timer. */
  private clearReconnectTimer(): void {
    if (this.reconnectTimer !== null) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }
  }

  /** Get or create the typing state entry for a room. */
  private getOrCreateTypingState(roomId: string): TypingState {
    let state = this.typingStates.get(roomId)
    if (!state) {
      state = { timer: null, lastSentAt: 0 }
      this.typingStates.set(roomId, state)
    }
    return state
  }

  /**
   * Clear any existing auto-stop timer and set a fresh one that fires after
   * TYPING_STOP_DELAY_MS of silence, sending `typing_stopped` (Req 4.2).
   */
  private resetTypingStopTimer(roomId: string, state: TypingState): void {
    if (state.timer !== null) {
      clearTimeout(state.timer)
    }
    state.timer = setTimeout(() => {
      state.timer = null
      this.send('typing_stopped', { roomId })
    }, TYPING_STOP_DELAY_MS)
  }
}

// ---------------------------------------------------------------------------
// Module-level singleton export
// ---------------------------------------------------------------------------

export const wsManager: WsManager = new WsManager()
