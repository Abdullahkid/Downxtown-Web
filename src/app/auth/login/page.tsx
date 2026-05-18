'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff, Loader2, Mail, Phone, User } from 'lucide-react'
import { authManager } from '@/lib/firebase/authManager'
import { api, ApiError } from '@/lib/api/apiClient'
import { fetchCurrentPersonalProfile } from '@/lib/api/profile'
import { useAuthStore } from '@/store/authStore'
import { setAuthCookie } from '@/lib/firebase/authCookie'

type LoginMode = 'email' | 'phone' | 'username'

interface PasswordLoginResponse {
  success: boolean
  message?: string
  customFirebaseToken?: string
}

function detectLoginMode(input: string): LoginMode | null {
  const trimmed = input.trim()
  if (!trimmed) return null
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) return 'email'
  if (/^[+]?[0-9]{10,13}$/.test(trimmed)) return 'phone'
  if (/^[a-zA-Z0-9_]{3,30}$/.test(trimmed)) return 'username'
  return null
}

function normalizePhoneNumber(phoneInput: string): string | null {
  const cleaned = phoneInput.replace(/[^+0-9]/g, '')
  if (cleaned.startsWith('+91') && cleaned.length === 13) return cleaned
  if (cleaned.startsWith('91') && cleaned.length === 12) return `+${cleaned}`
  if (/^[0-9]{10}$/.test(cleaned)) return `+91${cleaned}`
  return null
}

function buildPhoneLoginCandidates(rawInput: string): string[] {
  const cleanedDigits = rawInput.replace(/\D/g, '')
  const candidates: string[] = []

  const normalized = normalizePhoneNumber(rawInput)
  if (normalized) candidates.push(normalized)

  // Legacy compatibility fallbacks (some old accounts may be stored differently)
  if (cleanedDigits.length === 10) {
    candidates.push(cleanedDigits)
    candidates.push(`91${cleanedDigits}`)
  } else if (cleanedDigits.length === 12 && cleanedDigits.startsWith('91')) {
    candidates.push(cleanedDigits)
    candidates.push(`+${cleanedDigits}`)
    candidates.push(cleanedDigits.slice(2))
  } else if (cleanedDigits.length === 13 && cleanedDigits.startsWith('91')) {
    candidates.push(cleanedDigits)
  }

  // De-duplicate while preserving order
  return Array.from(new Set(candidates))
}

function LoginPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

  const redirectTo = searchParams.get('redirect') ?? '/'
  const loginMode = detectLoginMode(identifier)

  async function handlePostAuth() {
    const profile = await fetchCurrentPersonalProfile()
    const { getAuth } = await import('firebase/auth')
    const { default: firebaseApp } = await import('@/lib/firebase/firebaseApp')
    const auth = getAuth(firebaseApp)
    const currentUser = auth.currentUser
    if (!currentUser) throw new Error('No Firebase user after sign-in')
    useAuthStore.getState().setUser(profile, currentUser)
    setAuthCookie()
    router.push(redirectTo)
  }

  async function loginWithEmailPassword(email: string, pass: string) {
    const response = await api.post<PasswordLoginResponse>(
      '/auth/login/email',
      {
        email,
        password: pass,
        accountType: 'PERSONAL',
      },
      { auth: false },
    )

    if (!response.success || !response.customFirebaseToken) {
      throw new Error(response.message || 'Incorrect email or password.')
    }
    await authManager.signInWithCustomToken(response.customFirebaseToken)
  }

  async function loginWithPhonePassword(phoneInput: string, pass: string) {
    const phoneCandidates = buildPhoneLoginCandidates(phoneInput)
    if (phoneCandidates.length === 0) {
      throw new Error('Please enter a valid phone number.')
    }

    let lastError: unknown = null
    for (const phoneCandidate of phoneCandidates) {
      try {
        const response = await api.post<PasswordLoginResponse>(
          '/auth/login/phone-password',
          {
            phoneNumber: phoneCandidate,
            password: pass,
            accountType: 'PERSONAL',
          },
          { auth: false },
        )

        if (!response.success || !response.customFirebaseToken) {
          throw new Error(response.message || 'Incorrect phone number or password.')
        }
        await authManager.signInWithCustomToken(response.customFirebaseToken)
        return
      } catch (err: unknown) {
        lastError = err

        // Retry only for "not found" variants; fail fast otherwise.
        if (err instanceof ApiError) {
          const msg = err.message.toLowerCase()
          const isNotFoundLike = err.status === 404 || msg.includes('not found') || msg.includes('no account found')
          if (isNotFoundLike) continue
        }
        if (err instanceof Error && err.message.toLowerCase().includes('not found')) {
          continue
        }
        throw err
      }
    }

    throw (lastError instanceof Error
      ? lastError
      : new Error('No account found with this phone number.'))
  }

  async function loginWithUsername(username: string, pass: string) {
    const response = await api.post<PasswordLoginResponse>(
      '/auth/login/username',
      {
        username,
        password: pass,
      },
      { auth: false },
    )

    if (!response.success || !response.customFirebaseToken) {
      throw new Error(response.message || 'Incorrect username or password.')
    }
    await authManager.signInWithCustomToken(response.customFirebaseToken)
  }

  async function handleIdentifierSignIn(e: React.FormEvent) {
    e.preventDefault()
    if (!identifier.trim() || !password) return

    setError(null)
    setLoading(true)
    try {
      if (loginMode === 'email') {
        await loginWithEmailPassword(identifier.trim(), password)
      } else if (loginMode === 'phone') {
        await loginWithPhonePassword(identifier.trim(), password)
      } else if (loginMode === 'username') {
        await loginWithUsername(identifier.trim(), password)
      } else {
        throw new Error('Enter a valid email, phone number, or username.')
      }

      await handlePostAuth()
    } catch (err: unknown) {
      setError((err as Error)?.message || 'Sign-in failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  async function handleGoogleSignIn() {
    setError(null)
    setGoogleLoading(true)
    try {
      await authManager.signInWithGoogle()
      await handlePostAuth()
    } catch (err: unknown) {
      const code = (err as { code?: string }).code ?? ''
      if (code !== 'auth/popup-closed-by-user' && code !== 'auth/cancelled-popup-request') {
        setError('Google sign-in failed. Please try again.')
      }
    } finally {
      setGoogleLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Welcome back</h1>
          <p className="mt-2 text-sm text-gray-500">Sign in with email or phone number</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={googleLoading || loading}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {googleLoading ? (
              <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
            )}
            Continue with Google
          </button>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-xs text-gray-400 uppercase tracking-wide">
              <span className="bg-white px-3">or</span>
            </div>
          </div>

          <form onSubmit={handleIdentifierSignIn} noValidate className="space-y-4">
            <div>
                <label htmlFor="identifier" className="block text-sm font-medium text-gray-700 mb-1.5">
                Email, phone number, or username
                </label>
              <div className="relative">
                <input
                  id="identifier"
                  type="text"
                  autoComplete="username"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="you@example.com, 9876543210, or john_doe"
                  className="w-full px-4 py-3 pr-11 rounded-xl border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  required
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  {loginMode === 'phone' ? (
                    <Phone className="w-4 h-4" />
                  ) : loginMode === 'username' ? (
                    <User className="w-4 h-4" />
                  ) : (
                    <Mail className="w-4 h-4" />
                  )}
                </span>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <Link href="/auth/forgot-password" className="text-xs text-blue-600 hover:text-blue-700 font-medium">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full px-4 py-3 pr-12 rounded-xl border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {error && (
              <p role="alert" className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading || googleLoading || !identifier.trim() || !password}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Sign In
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            Prefer OTP sign-in?{' '}
            <Link href={`/auth/phone?redirect=${encodeURIComponent(redirectTo)}`} className="text-blue-600 hover:text-blue-700 font-medium">
              Continue with OTP
            </Link>
          </p>

          <p className="mt-3 text-center text-sm text-gray-500">
            Don&apos;t have an account?{' '}
            <Link href="/auth/register" className="text-blue-600 hover:text-blue-700 font-medium">
              Create account
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginPageContent />
    </Suspense>
  )
}