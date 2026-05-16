'use client'

/**
 * ErrorBoundary — global React class error boundary.
 *
 * Catches unhandled render errors anywhere in the component tree below it.
 * On error:
 *  - Logs the error to analyticsProvider via logEvent('error', { message, stack })
 *  - Renders a user-friendly recovery screen with a "Reload" button
 *  - Does NOT expose raw stack traces to the user
 *
 * Requirements: 24.8
 */

import React from 'react'
import { logEvent } from '@/lib/analytics/analyticsProvider'

interface ErrorBoundaryProps {
  children: React.ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
}

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: React.ErrorInfo): void {
    // Log to Firebase Analytics (fire-and-forget; errors are non-fatal here)
    logEvent('error', {
      message: error.message,
      stack: error.stack ?? info.componentStack ?? 'unknown',
    }).catch(() => {
      // Swallow analytics errors — we don't want a logging failure to
      // prevent the recovery screen from rendering.
    })
  }

  private handleReload = (): void => {
    if (typeof window !== 'undefined') {
      window.location.reload()
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          role="alert"
          className="flex min-h-screen flex-col items-center justify-center gap-6 bg-white px-6 text-center"
        >
          <div className="flex flex-col items-center gap-3">
            <span className="text-5xl" aria-hidden="true">
              😕
            </span>
            <h1 className="text-xl font-semibold text-gray-900">
              Something went wrong
            </h1>
            <p className="max-w-sm text-sm text-gray-500">
              An unexpected error occurred. Please reload the app to continue.
            </p>
          </div>

          <button
            onClick={this.handleReload}
            className="rounded-lg bg-black px-6 py-3 text-sm font-medium text-white transition-opacity hover:opacity-80 focus:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2"
          >
            Reload
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
