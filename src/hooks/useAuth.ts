'use client'

/**
 * useAuth — subscribes to authStore and exposes the current user, auth status,
 * and a signOut helper that clears all local state before redirecting.
 *
 * Requirements: 5.6, 26.6
 */

import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { authManager } from '@/lib/firebase/authManager'
import { cacheStore } from '@/lib/cache/cacheStore'

export function useAuth() {
  const router = useRouter()
  const { user, status } = useAuthStore()

  const signOut = async (): Promise<void> => {
    // 1. Propagate sign-out to other tabs and revoke the Firebase session.
    await authManager.signOut()

    // 2. Clear all IndexedDB caches so the next user starts fresh.
    await Promise.allSettled([
      cacheStore.setUserProfile(null as never),   // clears profile slot
      cacheStore.setFeedStores([]),
      cacheStore.setChatRooms([]),
    ])

    // 3. Reset the Zustand auth store.
    useAuthStore.getState().clearUser()

    // 4. Redirect to login.
    router.push('/auth/login')
  }

  return { user, status, signOut }
}
