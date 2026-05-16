'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

const WS_BASE_URL = 'wss://api.downxtown.com'
const MAX_RECONNECT_ATTEMPTS = 10

/**
 * Returns the exponential backoff delay in milliseconds for a given attempt number.
 * delay = min(1000 * 2^n, 30_000)
 */
export function getBackoffDelay(n: number): number {
  return Math.min(1000 * Math.pow(2, n), 30_000)
}

export type WebSocketStatus = 'connected' | 'connecting' | 'reconnecting' | 'disconnected'

export interface UseWebSocketOptions {
  onMessage?: (data: unknown) => void
  onOpen?: () => void
  onClose?: () => void
}

export interface UseWebSocketReturn {
  send: (data: unknown) => void
  status: WebSocketStatus
  disconnect: () => void
}

export function useWebSocket(
  roomId: string,
  options?: UseWebSocketOptions
): UseWebSocketReturn {
  const [status, setStatus] = useState<WebSocketStatus>('connecting')

  const wsRef = useRef<WebSocket | null>(null)
  const attemptRef = useRef<number>(0)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  // When true, reconnection is suppressed (user called disconnect or component unmounted)
  const intentionalCloseRef = useRef<boolean>(false)

  // Keep options in a ref so the connect closure always sees the latest callbacks
  // without needing to be re-created on every render.
  const optionsRef = useRef<UseWebSocketOptions | undefined>(options)
  useEffect(() => {
    optionsRef.current = options
  })

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }, [])

  const connect = useCallback(() => {
    // Guard: never open a new socket if we intentionally disconnected
    if (intentionalCloseRef.current) return

    const url = `${WS_BASE_URL}/chat/${roomId}`
    const ws = new WebSocket(url)
    wsRef.current = ws

    ws.onopen = () => {
      attemptRef.current = 0
      setStatus('connected')
      optionsRef.current?.onOpen?.()
    }

    ws.onmessage = (event: MessageEvent) => {
      try {
        const data: unknown = JSON.parse(event.data as string)
        optionsRef.current?.onMessage?.(data)
      } catch {
        // If the payload is not JSON, pass the raw string
        optionsRef.current?.onMessage?.(event.data)
      }
    }

    ws.onclose = () => {
      optionsRef.current?.onClose?.()

      if (intentionalCloseRef.current) {
        setStatus('disconnected')
        return
      }

      const attempt = attemptRef.current
      if (attempt < MAX_RECONNECT_ATTEMPTS) {
        setStatus('reconnecting')
        const delay = getBackoffDelay(attempt)
        attemptRef.current = attempt + 1
        timerRef.current = setTimeout(() => {
          connect()
        }, delay)
      } else {
        setStatus('disconnected')
      }
    }

    ws.onerror = () => {
      // onerror is always followed by onclose, so we let onclose handle reconnection.
      // We close explicitly here to ensure onclose fires in all environments.
      ws.close()
    }
  }, [roomId])

  // Connect on mount; clean up on unmount or when roomId changes
  useEffect(() => {
    intentionalCloseRef.current = false
    attemptRef.current = 0
    setStatus('connecting')
    connect()

    return () => {
      intentionalCloseRef.current = true
      clearTimer()
      wsRef.current?.close()
      wsRef.current = null
    }
  }, [connect, clearTimer])

  const send = useCallback((data: unknown) => {
    const ws = wsRef.current
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(data))
    }
    // No-op when not connected
  }, [])

  const disconnect = useCallback(() => {
    intentionalCloseRef.current = true
    clearTimer()
    wsRef.current?.close()
    wsRef.current = null
    setStatus('disconnected')
  }, [clearTimer])

  return { send, status, disconnect }
}
