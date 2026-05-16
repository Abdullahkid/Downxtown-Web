'use client'

/**
 * Forgot password page — sends a password reset email via Firebase.
 * Requirements: 3.7
 */

import { useState } from 'react'
import Link from 'next/link'
import { Loader2, CheckCircle2, ArrowLeft } from 'lucide-react'
import { authManager } from '@/lib/firebase/authManager'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) return

    setError(null)
    setLoading(true)
    try {
      await authManager.sendPasswordResetEmail(email.trim())
      setSent(true)
    } catch (err: unknown) {
      const code = (err as { code?: string }).code ?? ''
      if (code === 'auth/user-not-found' || code === 'auth/invalid-email') {
        // Don't reveal whether the email exists — show success anyway
        setSent(true)
      } else {
        setError('Failed to send reset email. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <Link
            href="/auth/login"
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to sign in
          </Link>

          {sent ? (
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="w-14 h-14 rounded-full bg-green-50 flex items-center justify-center">
                  <CheckCircle2 className="w-7 h-7 text-green-600" />
                </div>
              </div>
              <h2 className="text-xl font-bold text-gray-900">Check your email</h2>
              <p className="text-sm text-gray-500">
                If an account exists for <span className="font-medium text-gray-700">{email}</span>,
                we&apos;ve sent a password reset link.
              </p>
              <Link
                href="/auth/login"
                className="inline-block mt-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Return to sign in
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate className="space-y-5">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Reset your password</h2>
                <p className="mt-1 text-sm text-gray-500">
                  Enter your email and we&apos;ll send you a reset link.
                </p>
              </div>

              <div>
                <label htmlFor="fp-email" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Email address
                </label>
                <input
                  id="fp-email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(null) }}
                  placeholder="you@example.com"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  required
                />
              </div>

              {error && (
                <p role="alert" className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading || !email.trim()}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                Send reset link
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
