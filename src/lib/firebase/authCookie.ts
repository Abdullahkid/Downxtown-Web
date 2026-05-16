/**
 * Auth Cookie Helpers
 *
 * The Next.js middleware (`src/middleware.ts`) checks for an `auth-token`
 * cookie to determine whether a user is authenticated before serving
 * protected routes. Since Firebase Web SDK stores auth state in IndexedDB
 * (not in cookies), we manually set/clear a lightweight presence cookie
 * whenever the Firebase auth state changes.
 *
 * Security note:
 *   This cookie is NOT a security boundary. It is a UX optimisation that
 *   prevents an unnecessary redirect flash for authenticated users. The
 *   actual security is enforced by the backend API, which validates the
 *   Firebase ID token on every authenticated request.
 *
 *   The cookie intentionally does NOT carry the ID token value — it is
 *   simply a boolean presence signal (`"1"`).
 *
 * Requirements: 1.4
 */

/** The cookie name checked by the middleware. */
export const AUTH_COOKIE_NAME = 'auth-token'

/**
 * Set the auth presence cookie.
 * Call this after a successful Firebase sign-in.
 *
 * The cookie is:
 *   - SameSite=Strict  — not sent on cross-site requests
 *   - Secure           — only sent over HTTPS (skipped on localhost)
 *   - No HttpOnly      — must be writable from JS (middleware reads it server-side)
 *   - Max-Age=604800   — 7 days, matching Firebase's default session duration
 */
export function setAuthCookie(): void {
  if (typeof document === 'undefined') return

  const isLocalhost =
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1'

  const secureFlag = isLocalhost ? '' : '; Secure'
  const maxAge = 60 * 60 * 24 * 7 // 7 days in seconds

  document.cookie = [
    `${AUTH_COOKIE_NAME}=1`,
    `Max-Age=${maxAge}`,
    'Path=/',
    'SameSite=Strict',
    secureFlag,
  ]
    .filter(Boolean)
    .join('; ')
}

/**
 * Clear the auth presence cookie.
 * Call this after a successful Firebase sign-out.
 */
export function clearAuthCookie(): void {
  if (typeof document === 'undefined') return

  // Setting Max-Age=0 immediately expires the cookie.
  document.cookie = `${AUTH_COOKIE_NAME}=; Max-Age=0; Path=/; SameSite=Strict`
}
