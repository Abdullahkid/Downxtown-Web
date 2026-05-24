'use client'

/**
 * AuthGuard — wraps a page that requires authentication.
 *
 * Behaviour:
 *  - status === 'loading'          → shows a centered spinner (Firebase resolving)
 *  - status === 'unauthenticated'  → shows a "Sign in" prompt with a link to /auth/login
 *  - status === 'authenticated'    → renders children normally
 *
 * The middleware already redirects unauthenticated server-side requests, but
 * this guard handles the client-side hydration window where status is still
 * 'loading', and provides a polished fallback UI instead of a raw API error.
 *
 * Requirements: 1.4
 */

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Loader2, LogIn } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'

interface AuthGuardProps {
  children: React.ReactNode
}

export function AuthGuard({ children }: AuthGuardProps) {
  const status = useAuthStore((s) => s.status)
  const pathname = usePathname()

  // ── Resolving Firebase auth state ──────────────────────────────────────
  if (status === 'loading') {
    return (
      <main className="flex min-h-[60vh] items-center justify-center">
        <Loader2
          size={32}
          className="animate-spin text-brand"
          aria-label="Checking sign-in status…"
        />
      </main>
    )
  }

  // ── Not signed in ───────────────────────────────────────────────────────
  if (status === 'unauthenticated') {
    const loginHref = `/auth/login?redirect=${encodeURIComponent(pathname)}`

    return (
      <main className="flex min-h-[60vh] items-center justify-center px-4">
        <div className="flex flex-col items-center gap-5 text-center max-w-xs">
          {/* Icon */}
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-bg">
            <LogIn size={28} className="text-brand" aria-hidden="true" />
          </div>

          {/* Copy */}
          <div className="space-y-1.5">
            <h1 className="text-lg font-bold text-text-1">Sign in to continue</h1>
            <p className="text-sm text-text-3">
              You need to be signed in to view this page.
            </p>
          </div>

          {/* CTA */}
          <Link
            href={loginHref}
            className={[
              'inline-flex items-center justify-center gap-2',
              'min-h-[44px] w-full rounded-xl px-6 py-2.5',
              'bg-brand text-white text-sm font-semibold',
              'hover:bg-brand/90 transition-colors',
              'focus-visible:outline focus-visible:outline-2',
              'focus-visible:outline-offset-2 focus-visible:outline-brand',
            ].join(' ')}
          >
            <LogIn size={16} aria-hidden="true" />
            Sign In
          </Link>

          {/* Register nudge */}
          <p className="text-xs text-text-3">
            Don&apos;t have an account?{' '}
            <Link
              href="/auth/register"
              className="text-brand font-medium hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand rounded"
            >
              Create one
            </Link>
          </p>
        </div>
      </main>
    )
  }

  // ── Authenticated ───────────────────────────────────────────────────────
  return <>{children}</>
}
