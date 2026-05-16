/**
 * Auth store — holds the authenticated user's profile and Firebase user object.
 * Requirements: 1.4, 26.6
 */

import { create } from 'zustand'
import type { User as FirebaseUser } from 'firebase/auth'
import type { Personal } from '@/types/user'

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated'

interface AuthState {
  user: Personal | null
  firebaseUser: FirebaseUser | null
  status: AuthStatus
}

interface AuthActions {
  setUser: (user: Personal, firebaseUser: FirebaseUser) => void
  clearUser: () => void
}

export type AuthStore = AuthState & AuthActions

export const useAuthStore = create<AuthStore>((set) => ({
  // Initial state — loading until Firebase resolves the auth session
  user: null,
  firebaseUser: null,
  status: 'loading',

  setUser: (user, firebaseUser) =>
    set({ user, firebaseUser, status: 'authenticated' }),

  clearUser: () =>
    set({ user: null, firebaseUser: null, status: 'unauthenticated' }),
}))
