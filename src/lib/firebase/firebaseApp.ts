/**
 * Firebase App initialization — modular SDK v10.
 * Uses a singleton pattern to avoid duplicate app initialization in Next.js
 * (which can re-execute module code across hot reloads and SSR/CSR boundaries).
 *
 * Requirements: 2.1, 2.2, 5.2, 5.4
 */

import { initializeApp, getApps, type FirebaseApp } from 'firebase/app'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
}

/**
 * Singleton Firebase app instance.
 * `getApps().length === 0` guard prevents "Firebase App named '[DEFAULT]' already exists"
 * errors during Next.js hot module replacement and server-side rendering.
 */
export const firebaseApp: FirebaseApp =
  getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]

export default firebaseApp
