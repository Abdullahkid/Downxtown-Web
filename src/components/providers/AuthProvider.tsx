'use client'

/**
 * AuthProvider — sets up the Firebase auth state listener, cross-tab
 * sign-out propagation via BroadcastChannel, and offline queue flushing.
 *
 * On mount:
 *  1. Subscribes to Firebase auth state changes via authManager.onAuthStateChanged.
 *     - When a Firebase user is present, fetches the buyer profile from the API
 *       and populates authStore via setUser.
 *     - When no Firebase user is present, clears authStore via clearUser.
 *  2. Opens a BroadcastChannel('auth') listener. On receiving
 *     { type: 'SIGN_OUT' }, clears authStore and redirects to /auth/login.
 *  3. Listens to the window `online` event and flushes the offline action
 *     queue so queued follow/message actions are replayed on reconnect.
 *
 * Requirements: 1.1, 18.3, 26.4, 26.6, 27.7
 */

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { authManager } from '@/lib/firebase/authManager'
import { fetchCurrentPersonalProfile } from '@/lib/api/profile'
import { useAuthStore } from '@/store/authStore'
import { useOfflineQueueStore } from '@/store/offlineQueueStore'

interface AuthProviderProps {
  children: React.ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const router = useRouter()

  useEffect(() => {
    // ------------------------------------------------------------------
    // 1. Firebase auth state listener
    // ------------------------------------------------------------------
    const unsubscribe = authManager.onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const profile = await fetchCurrentPersonalProfile()
          useAuthStore.getState().setUser(profile, firebaseUser)
        } catch {
          // If the profile fetch fails (e.g. network error or 401), clear
          // the auth state so the app doesn't show stale/partial data.
          useAuthStore.getState().clearUser()
        }
      } else {
        useAuthStore.getState().clearUser()
      }
    })

    // ------------------------------------------------------------------
    // 2. Cross-tab sign-out via BroadcastChannel (Req 27.7)
    // ------------------------------------------------------------------
    let channel: BroadcastChannel | null = null

    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      channel = new BroadcastChannel('auth')

      channel.onmessage = (event: MessageEvent<{ type: string }>) => {
        if (event.data?.type === 'SIGN_OUT') {
          useAuthStore.getState().clearUser()
          router.replace('/auth/login')
        }
      }
    }

    // ------------------------------------------------------------------
    // 3. Offline queue flush on reconnect (Req 18.3, 26.6)
    //
    // When the browser regains connectivity, replay any queued write
    // actions (follow store, send message, etc.) in order.
    // ------------------------------------------------------------------
    const handleOnline = () => {
      useOfflineQueueStore.getState().flush()
    }

    window.addEventListener('online', handleOnline)

    // ------------------------------------------------------------------
    // Cleanup on unmount
    // ------------------------------------------------------------------
    return () => {
      unsubscribe()
      channel?.close()
      window.removeEventListener('online', handleOnline)
    }
  }, [router])

  return <>{children}</>
}
