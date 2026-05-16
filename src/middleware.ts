/**
 * Next.js Middleware — Auth Guard and Route Protection
 *
 * Protects the following routes from unauthenticated access:
 *   /chat, /orders, /profile, /checkout  (and all sub-paths)
 *
 * Strategy:
 *   Firebase Web SDK stores auth state client-side (IndexedDB / localStorage)
 *   and does NOT set server-readable cookies by default. To bridge this gap,
 *   the AuthProvider sets a lightweight `auth-token` cookie after every
 *   successful sign-in (see `src/lib/firebase/authCookie.ts`). This cookie
 *   is checked here as a fast, server-side signal that the user is logged in.
 *
 *   Important: this cookie is NOT a security boundary — the real auth token
 *   is the Firebase ID token validated server-side by the backend API. The
 *   cookie is only used to avoid an unnecessary client-side redirect flash
 *   for authenticated users.
 *
 * Requirements: 1.4, 21.3
 */

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/** Cookie name set by the AuthProvider after successful Firebase sign-in. */
const AUTH_COOKIE_NAME = 'auth-token'

/**
 * Protected path prefixes. Any request whose pathname starts with one of
 * these values will require the `auth-token` cookie to be present.
 */
const PROTECTED_PATHS = ['/chat', '/orders', '/profile', '/checkout'] as const

function isProtectedPath(pathname: string): boolean {
  return PROTECTED_PATHS.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  )
}

export function middleware(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl

  if (!isProtectedPath(pathname)) {
    return NextResponse.next()
  }

  const authToken = request.cookies.get(AUTH_COOKIE_NAME)?.value

  if (!authToken) {
    // Redirect to login, preserving the originally requested path so the
    // login page can redirect back after successful authentication (Req 1.4).
    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = '/auth/login'
    loginUrl.search = `?redirect=${encodeURIComponent(pathname)}`
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

/**
 * Matcher config — only run this middleware on the protected paths.
 * Using explicit path patterns avoids running the middleware on every
 * static asset, API route, and public page.
 */
export const config = {
  matcher: [
    '/chat',
    '/chat/:path*',
    '/orders',
    '/orders/:path*',
    '/profile',
    '/profile/:path*',
    '/checkout',
    '/checkout/:path*',
  ],
}
