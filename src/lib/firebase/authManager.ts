/**
 * Auth Manager — wraps Firebase Auth Web SDK v10 (modular).
 *
 * Implements all authentication methods required by the Downxtown Web Buyer App:
 *   - Google OAuth (signInWithPopup)
 *   - Email/Password sign-in and registration
 *   - Email verification
 *   - Phone OTP (RecaptchaVerifier + signInWithPhoneNumber)
 *   - Password reset
 *   - Sign-out with cross-tab propagation via BroadcastChannel
 *   - Session persistence via browserLocalPersistence
 *   - ID token retrieval
 *   - Auth state subscription
 *
 * Requirements: 2.1, 2.2, 2.4, 3.2, 4.1, 5.2, 5.4, 5.5, 27.7
 */

import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  signInWithCustomToken as firebaseSignInWithCustomToken,
  createUserWithEmailAndPassword,
  sendEmailVerification as firebaseSendEmailVerification,
  signInWithPhoneNumber,
  RecaptchaVerifier,
  PhoneAuthProvider,
  signInWithCredential,
  sendPasswordResetEmail as firebaseSendPasswordResetEmail,
  signOut as firebaseSignOut,
  setPersistence,
  browserLocalPersistence,
  onAuthStateChanged as firebaseOnAuthStateChanged,
  type UserCredential,
  type ConfirmationResult,
  type User,
  type Unsubscribe,
} from 'firebase/auth'
import firebaseApp from './firebaseApp'

// ---------------------------------------------------------------------------
// Auth Manager interface
// ---------------------------------------------------------------------------

export interface AuthManager {
  /** Sign in with Google OAuth popup. */
  signInWithGoogle(): Promise<UserCredential>

  /** Sign in with email and password. */
  signInWithEmailPassword(email: string, password: string): Promise<UserCredential>

  /** Sign in with a backend-issued Firebase custom token. */
  signInWithCustomToken(token: string): Promise<UserCredential>

  /** Register a new account with email and password. */
  registerWithEmail(email: string, password: string): Promise<UserCredential>

  /**
   * Send a verification email to the currently signed-in user.
   * Throws if no user is currently signed in.
   */
  sendEmailVerification(): Promise<void>

  /**
   * Send a phone OTP using Firebase Phone Auth.
   * Creates an invisible RecaptchaVerifier attached to `recaptchaContainerId`
   * (defaults to `'recaptcha-container'`).
   * Stores the ConfirmationResult internally for use by `confirmOtp`.
   */
  sendPhoneOtp(
    phoneNumber: string,
    recaptchaContainerId?: string,
  ): Promise<ConfirmationResult>

  /**
   * Confirm the OTP received by the user.
   * Must be called after `sendPhoneOtp`.
   */
  confirmOtp(otp: string): Promise<UserCredential>

  /** Send a password reset email to the given address. */
  sendPasswordResetEmail(email: string): Promise<void>

  /**
   * Sign out the current user.
   * Also posts `{ type: 'SIGN_OUT' }` to BroadcastChannel('auth') so all
   * other open tabs can clear their auth state (Req 27.7).
   */
  signOut(): Promise<void>

  /**
   * Get the current user's Firebase ID token.
   * Returns `null` if no user is signed in.
   */
  getCurrentIdToken(forceRefresh?: boolean): Promise<string | null>

  /**
   * Subscribe to Firebase auth state changes.
   * Returns the unsubscribe function.
   */
  onAuthStateChanged(callback: (user: User | null) => void): Unsubscribe
}

// ---------------------------------------------------------------------------
// Implementation
// ---------------------------------------------------------------------------

class AuthManagerImpl implements AuthManager {
  private readonly auth = getAuth(firebaseApp)
  private readonly googleProvider = new GoogleAuthProvider()

  /**
   * Holds the ConfirmationResult from the most recent `sendPhoneOtp` call.
   * Used by `confirmOtp` to verify the OTP without requiring the caller to
   * pass it back explicitly.
   */
  private pendingConfirmationResult: ConfirmationResult | null = null

  constructor() {
    // Set session persistence to browserLocalPersistence so the user stays
    // signed in after closing and reopening the browser tab (Req 5.4).
    // This is a fire-and-forget initialisation; errors are non-fatal because
    // Firebase falls back to in-memory persistence.
    setPersistence(this.auth, browserLocalPersistence).catch((err) => {
      console.error('[AuthManager] Failed to set persistence:', err)
    })
  }

  // -------------------------------------------------------------------------
  // Sign-in methods
  // -------------------------------------------------------------------------

  async signInWithGoogle(): Promise<UserCredential> {
    return signInWithPopup(this.auth, this.googleProvider)
  }

  async signInWithEmailPassword(
    email: string,
    password: string,
  ): Promise<UserCredential> {
    return signInWithEmailAndPassword(this.auth, email, password)
  }

  async signInWithCustomToken(token: string): Promise<UserCredential> {
    return firebaseSignInWithCustomToken(this.auth, token)
  }

  async registerWithEmail(
    email: string,
    password: string,
  ): Promise<UserCredential> {
    return createUserWithEmailAndPassword(this.auth, email, password)
  }

  async sendEmailVerification(): Promise<void> {
    const user = this.auth.currentUser
    if (!user) {
      throw new Error('[AuthManager] No user is currently signed in.')
    }
    return firebaseSendEmailVerification(user)
  }

  async sendPhoneOtp(
    phoneNumber: string,
    recaptchaContainerId = 'recaptcha-container',
  ): Promise<ConfirmationResult> {
    // Create an invisible RecaptchaVerifier each time to avoid stale verifier
    // state across multiple OTP requests (e.g. resend flow).
    const recaptchaVerifier = new RecaptchaVerifier(
      this.auth,
      recaptchaContainerId,
      { size: 'invisible' },
    )

    const confirmationResult = await signInWithPhoneNumber(
      this.auth,
      phoneNumber,
      recaptchaVerifier,
    )

    this.pendingConfirmationResult = confirmationResult
    return confirmationResult
  }

  async confirmOtp(otp: string): Promise<UserCredential> {
    if (!this.pendingConfirmationResult) {
      throw new Error(
        '[AuthManager] No pending OTP confirmation. Call sendPhoneOtp first.',
      )
    }
    const credential = await this.pendingConfirmationResult.confirm(otp)
    this.pendingConfirmationResult = null
    return credential
  }

  async sendPasswordResetEmail(email: string): Promise<void> {
    return firebaseSendPasswordResetEmail(this.auth, email)
  }

  // -------------------------------------------------------------------------
  // Sign-out
  // -------------------------------------------------------------------------

  async signOut(): Promise<void> {
    // Propagate sign-out to all other open tabs before clearing local state
    // so they can react (e.g. clear authStore) before the token is revoked.
    // BroadcastChannel is not available in SSR/Node environments, so guard it.
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      const channel = new BroadcastChannel('auth')
      channel.postMessage({ type: 'SIGN_OUT' })
      // Close immediately — the message is already queued for delivery.
      channel.close()
    }

    return firebaseSignOut(this.auth)
  }

  // -------------------------------------------------------------------------
  // Session helpers
  // -------------------------------------------------------------------------

  async getCurrentIdToken(forceRefresh = false): Promise<string | null> {
    const user = this.auth.currentUser
    if (!user) return null
    return user.getIdToken(forceRefresh)
  }

  onAuthStateChanged(callback: (user: User | null) => void): Unsubscribe {
    return firebaseOnAuthStateChanged(this.auth, callback)
  }
}

// ---------------------------------------------------------------------------
// Singleton export
// ---------------------------------------------------------------------------

/**
 * Singleton `AuthManager` instance.
 * Import this wherever Firebase auth operations are needed.
 *
 * @example
 * import { authManager } from '@/lib/firebase/authManager'
 * await authManager.signInWithGoogle()
 */
export const authManager: AuthManager = new AuthManagerImpl()
