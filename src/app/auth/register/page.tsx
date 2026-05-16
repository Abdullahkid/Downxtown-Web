'use client'

/**
 * Registration page — four-step wizard.
 *
 * Step 1 — EmailInputStep:       collect email, validate format
 * Step 2 — PasswordCreationStep: collect + confirm password, validate rules
 * Step 3 — EmailVerificationStep: register with Firebase, send verification email, wait for verification
 * Step 4 — PersonalUserDetailsStep: name, username, gender, DOB → POST /buyer/profile
 *
 * Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 5.1, 5.3
 */

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff, Loader2, CheckCircle2, XCircle, Mail, RefreshCw } from 'lucide-react'
import { authManager } from '@/lib/firebase/authManager'
import { api, ApiError } from '@/lib/api/apiClient'
import { useAuthStore } from '@/store/authStore'
import { validatePassword } from '@/lib/utils/validators'
import { setAuthCookie } from '@/lib/firebase/authCookie'
import type { Personal } from '@/types/user'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type Step = 1 | 2 | 3 | 4

interface WizardState {
  email: string
  password: string
}

// ---------------------------------------------------------------------------
// Progress indicator
// ---------------------------------------------------------------------------

function StepIndicator({ current, total }: { current: Step; total: number }) {
  return (
    <div className="flex items-center justify-center gap-2 mb-8" aria-label={`Step ${current} of ${total}`}>
      {Array.from({ length: total }, (_, i) => {
        const step = (i + 1) as Step
        const isCompleted = step < current
        const isActive = step === current
        return (
          <div key={step} className="flex items-center gap-2">
            <div
              className={[
                'w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-colors',
                isCompleted
                  ? 'bg-blue-600 text-white'
                  : isActive
                  ? 'bg-blue-600 text-white ring-4 ring-blue-100'
                  : 'bg-gray-100 text-gray-400',
              ].join(' ')}
            >
              {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : step}
            </div>
            {i < total - 1 && (
              <div
                className={[
                  'w-8 h-0.5 transition-colors',
                  isCompleted ? 'bg-blue-600' : 'bg-gray-200',
                ].join(' ')}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Step 1 — Email Input
// ---------------------------------------------------------------------------

function EmailInputStep({
  onNext,
}: {
  onNext: (email: string) => void
}) {
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)

  function validate(value: string): string | null {
    if (!value.trim()) return 'Email is required.'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) return 'Please enter a valid email address.'
    return null
  }

  function handleContinue(e: React.FormEvent) {
    e.preventDefault()
    const err = validate(email)
    if (err) { setError(err); return }
    onNext(email.trim())
  }

  return (
    <form onSubmit={handleContinue} noValidate className="space-y-5">
      <div className="text-center mb-2">
        <h2 className="text-xl font-bold text-gray-900">Create your account</h2>
        <p className="mt-1 text-sm text-gray-500">Start with your email address</p>
      </div>

      <div>
        <label htmlFor="reg-email" className="block text-sm font-medium text-gray-700 mb-1.5">
          Email address
        </label>
        <input
          id="reg-email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => { setEmail(e.target.value); setError(null) }}
          placeholder="you@example.com"
          className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
          required
        />
        {error && (
          <p role="alert" className="mt-1.5 text-xs text-red-600">{error}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={!email.trim()}
        className="w-full px-4 py-3 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Continue
      </button>
    </form>
  )
}

// ---------------------------------------------------------------------------
// Step 2 — Password Creation
// ---------------------------------------------------------------------------

const PASSWORD_RULE_LABELS: { key: string; label: string }[] = [
  { key: 'Password must be at least 8 characters', label: 'At least 8 characters' },
  { key: 'Password must contain at least one uppercase letter', label: 'One uppercase letter' },
  { key: 'Password must contain at least one lowercase letter', label: 'One lowercase letter' },
  { key: 'Password must contain at least one digit', label: 'One number' },
]

function PasswordCreationStep({
  onNext,
}: {
  onNext: (password: string) => void
}) {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [touched, setTouched] = useState(false)

  const { isValid, errors } = validatePassword(password)
  const passwordsMatch = password === confirm
  const canContinue = isValid && passwordsMatch && confirm.length > 0

  function handleContinue(e: React.FormEvent) {
    e.preventDefault()
    setTouched(true)
    if (!canContinue) return
    onNext(password)
  }

  return (
    <form onSubmit={handleContinue} noValidate className="space-y-5">
      <div className="text-center mb-2">
        <h2 className="text-xl font-bold text-gray-900">Create a password</h2>
        <p className="mt-1 text-sm text-gray-500">Choose a strong password for your account</p>
      </div>

      {/* Password field */}
      <div>
        <label htmlFor="reg-password" className="block text-sm font-medium text-gray-700 mb-1.5">
          Password
        </label>
        <div className="relative">
          <input
            id="reg-password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            value={password}
            onChange={(e) => { setPassword(e.target.value); setTouched(false) }}
            placeholder="••••••••"
            className="w-full px-4 py-3 pr-12 rounded-xl border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
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

      {/* Password rules */}
      {password.length > 0 && (
        <ul className="space-y-1.5" aria-label="Password requirements">
          {PASSWORD_RULE_LABELS.map(({ key, label }) => {
            const met = !errors.has(key)
            return (
              <li key={key} className={`flex items-center gap-2 text-xs ${met ? 'text-green-600' : 'text-red-500'}`}>
                {met
                  ? <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
                  : <XCircle className="w-3.5 h-3.5 flex-shrink-0" />
                }
                {label}
              </li>
            )
          })}
        </ul>
      )}

      {/* Confirm password */}
      <div>
        <label htmlFor="reg-confirm" className="block text-sm font-medium text-gray-700 mb-1.5">
          Confirm password
        </label>
        <div className="relative">
          <input
            id="reg-confirm"
            type={showConfirm ? 'text' : 'password'}
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="••••••••"
            className={[
              'w-full px-4 py-3 pr-12 rounded-xl border text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition',
              touched && confirm.length > 0 && !passwordsMatch
                ? 'border-red-300 focus:ring-red-400'
                : 'border-gray-200 focus:ring-blue-500',
            ].join(' ')}
          />
          <button
            type="button"
            onClick={() => setShowConfirm((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label={showConfirm ? 'Hide confirm password' : 'Show confirm password'}
          >
            {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
        {touched && confirm.length > 0 && !passwordsMatch && (
          <p role="alert" className="mt-1.5 text-xs text-red-600">Passwords do not match.</p>
        )}
      </div>

      <button
        type="submit"
        disabled={!canContinue}
        className="w-full px-4 py-3 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Continue
      </button>
    </form>
  )
}

// ---------------------------------------------------------------------------
// Step 3 — Email Verification
// ---------------------------------------------------------------------------

function EmailVerificationStep({
  email,
  onNext,
  onResend,
}: {
  email: string
  onNext: () => Promise<void>
  onResend: () => Promise<void>
}) {
  const [checking, setChecking] = useState(false)
  const [resending, setResending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [resendSuccess, setResendSuccess] = useState(false)

  async function handleCheckVerification() {
    setError(null)
    setChecking(true)
    try {
      await onNext()
    } catch (err: unknown) {
      const msg = (err as Error).message ?? ''
      setError(msg || 'Email not yet verified. Please check your inbox and click the link.')
    } finally {
      setChecking(false)
    }
  }

  async function handleResend() {
    setError(null)
    setResendSuccess(false)
    setResending(true)
    try {
      await onResend()
      setResendSuccess(true)
    } catch {
      setError('Failed to resend verification email. Please try again.')
    } finally {
      setResending(false)
    }
  }

  return (
    <div className="space-y-5 text-center">
      <div className="flex justify-center">
        <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center">
          <Mail className="w-8 h-8 text-blue-600" />
        </div>
      </div>

      <div>
        <h2 className="text-xl font-bold text-gray-900">Check your email</h2>
        <p className="mt-2 text-sm text-gray-500">
          We sent a verification link to{' '}
          <span className="font-medium text-gray-700">{email}</span>
        </p>
        <p className="mt-1 text-sm text-gray-500">
          Click the link in the email, then come back here.
        </p>
      </div>

      {error && (
        <p role="alert" className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2 text-left">
          {error}
        </p>
      )}

      {resendSuccess && (
        <p className="text-sm text-green-600 bg-green-50 border border-green-100 rounded-lg px-3 py-2 text-left">
          Verification email resent successfully.
        </p>
      )}

      <button
        type="button"
        onClick={handleCheckVerification}
        disabled={checking}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {checking && <Loader2 className="w-4 h-4 animate-spin" />}
        I&apos;ve verified my email
      </button>

      <button
        type="button"
        onClick={handleResend}
        disabled={resending}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {resending
          ? <Loader2 className="w-4 h-4 animate-spin" />
          : <RefreshCw className="w-4 h-4" />
        }
        Resend email
      </button>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Step 4 — Personal User Details
// ---------------------------------------------------------------------------

function PersonalUserDetailsStep({
  onSuccess,
}: {
  onSuccess: () => void
}) {
  const [name, setName] = useState('')
  const [username, setUsername] = useState('')
  const [gender, setGender] = useState<'MALE' | 'FEMALE' | 'OTHER' | ''>('')
  const [dateOfBirth, setDateOfBirth] = useState('')
  const [usernameError, setUsernameError] = useState<string | null>(null)
  const [generalError, setGeneralError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  function validateUsername(value: string): string | null {
    if (!value) return 'Username is required.'
    if (!/^[a-zA-Z0-9_]{3,20}$/.test(value)) {
      return 'Username must be 3–20 characters and contain only letters, numbers, or underscores.'
    }
    return null
  }

  function validateForm(): boolean {
    let valid = true
    if (!name.trim()) { setGeneralError('Name is required.'); valid = false }
    const uErr = validateUsername(username)
    if (uErr) { setUsernameError(uErr); valid = false }
    if (!gender) { setGeneralError('Please select your gender.'); valid = false }
    if (!dateOfBirth) { setGeneralError('Date of birth is required.'); valid = false }
    return valid
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setUsernameError(null)
    setGeneralError(null)

    if (!validateForm()) return

    setLoading(true)
    try {
      await api.post('/buyer/profile', {
        name: name.trim(),
        username: username.trim(),
        gender,
        dateOfBirth,
      })
      onSuccess()
    } catch (err: unknown) {
      if (err instanceof ApiError && err.status === 409) {
        setUsernameError('Username already taken. Please choose a different one.')
      } else {
        setGeneralError('Failed to create profile. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  const canSubmit = name.trim() && username.trim() && gender && dateOfBirth

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <div className="text-center mb-2">
        <h2 className="text-xl font-bold text-gray-900">Complete your profile</h2>
        <p className="mt-1 text-sm text-gray-500">Just a few more details to get started</p>
      </div>

      {/* Name */}
      <div>
        <label htmlFor="reg-name" className="block text-sm font-medium text-gray-700 mb-1.5">
          Full name
        </label>
        <input
          id="reg-name"
          type="text"
          autoComplete="name"
          value={name}
          onChange={(e) => { setName(e.target.value); setGeneralError(null) }}
          placeholder="Your full name"
          className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
          required
        />
      </div>

      {/* Username */}
      <div>
        <label htmlFor="reg-username" className="block text-sm font-medium text-gray-700 mb-1.5">
          Username
        </label>
        <input
          id="reg-username"
          type="text"
          autoComplete="username"
          value={username}
          onChange={(e) => { setUsername(e.target.value); setUsernameError(null) }}
          placeholder="e.g. john_doe"
          className={[
            'w-full px-4 py-3 rounded-xl border text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition',
            usernameError
              ? 'border-red-300 focus:ring-red-400'
              : 'border-gray-200 focus:ring-blue-500',
          ].join(' ')}
          required
        />
        {usernameError ? (
          <p role="alert" className="mt-1.5 text-xs text-red-600">{usernameError}</p>
        ) : (
          <p className="mt-1.5 text-xs text-gray-400">3–20 characters, letters, numbers, and underscores only.</p>
        )}
      </div>

      {/* Gender */}
      <div>
        <label htmlFor="reg-gender" className="block text-sm font-medium text-gray-700 mb-1.5">
          Gender
        </label>
        <select
          id="reg-gender"
          value={gender}
          onChange={(e) => { setGender(e.target.value as 'MALE' | 'FEMALE' | 'OTHER'); setGeneralError(null) }}
          className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition appearance-none"
          required
        >
          <option value="" disabled>Select gender</option>
          <option value="MALE">Male</option>
          <option value="FEMALE">Female</option>
          <option value="OTHER">Other</option>
        </select>
      </div>

      {/* Date of birth */}
      <div>
        <label htmlFor="reg-dob" className="block text-sm font-medium text-gray-700 mb-1.5">
          Date of birth
        </label>
        <input
          id="reg-dob"
          type="date"
          value={dateOfBirth}
          onChange={(e) => { setDateOfBirth(e.target.value); setGeneralError(null) }}
          max={new Date().toISOString().split('T')[0]}
          className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
          required
        />
      </div>

      {/* General error */}
      {generalError && (
        <p role="alert" className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
          {generalError}
        </p>
      )}

      <button
        type="submit"
        disabled={loading || !canSubmit}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
        Create Account
      </button>
    </form>
  )
}

// ---------------------------------------------------------------------------
// Main wizard
// ---------------------------------------------------------------------------

export default function RegisterPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>(1)
  const [wizardState, setWizardState] = useState<WizardState>({ email: '', password: '' })

  // Step 1 → 2: store email, advance
  function handleEmailNext(email: string) {
    setWizardState((s) => ({ ...s, email }))
    setStep(2)
  }

  // Step 2 → 3: store password, register with Firebase, send verification email
  async function handlePasswordNext(password: string) {
    setWizardState((s) => ({ ...s, password }))
    // Register the Firebase account now that we have both email + password
    await authManager.registerWithEmail(wizardState.email, password)
    await authManager.sendEmailVerification()
    setStep(3)
  }

  // Step 3: check email verified, advance to step 4
  async function handleVerificationNext() {
    const { getAuth } = await import('firebase/auth')
    const { default: firebaseApp } = await import('@/lib/firebase/firebaseApp')
    const auth = getAuth(firebaseApp)
    const user = auth.currentUser
    if (!user) throw new Error('No Firebase user found.')
    // Reload to get the latest emailVerified status from Firebase
    await user.reload()
    if (!user.emailVerified) {
      throw new Error('Email not yet verified. Please check your inbox and click the link.')
    }
    setStep(4)
  }

  // Step 3: resend verification email
  async function handleResendVerification() {
    await authManager.sendEmailVerification()
  }

  // Step 4: profile created — fetch profile, populate store, set cookie, redirect
  async function handleProfileSuccess() {
    try {
      const profile = await api.get<Personal>('/buyer/profile')
      const { getAuth } = await import('firebase/auth')
      const { default: firebaseApp } = await import('@/lib/firebase/firebaseApp')
      const auth = getAuth(firebaseApp)
      const currentUser = auth.currentUser
      if (currentUser) {
        useAuthStore.getState().setUser(profile, currentUser)
        setAuthCookie()
      }
    } catch {
      // Non-fatal: store may not be populated but redirect still happens
    }
    router.push('/')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">DownXtown</h1>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <StepIndicator current={step} total={4} />

          {step === 1 && (
            <EmailInputStep onNext={handleEmailNext} />
          )}

          {step === 2 && (
            <PasswordCreationStepWrapper onNext={handlePasswordNext} />
          )}

          {step === 3 && (
            <EmailVerificationStep
              email={wizardState.email}
              onNext={handleVerificationNext}
              onResend={handleResendVerification}
            />
          )}

          {step === 4 && (
            <PersonalUserDetailsStep onSuccess={handleProfileSuccess} />
          )}

          {/* Sign in link */}
          <p className="mt-6 text-center text-sm text-gray-500">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-blue-600 hover:text-blue-700 font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Wrapper for step 2 that handles the async Firebase registration
// ---------------------------------------------------------------------------

function PasswordCreationStepWrapper({
  onNext,
}: {
  onNext: (password: string) => Promise<void>
}) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleNext(password: string) {
    setError(null)
    setLoading(true)
    try {
      await onNext(password)
    } catch (err: unknown) {
      const code = (err as { code?: string }).code ?? ''
      if (code === 'auth/email-already-in-use') {
        setError('An account with this email already exists. Please sign in instead.')
      } else {
        setError('Failed to create account. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <PasswordCreationStep onNext={handleNext} />
      {loading && (
        <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
          <Loader2 className="w-4 h-4 animate-spin" />
          Creating your account…
        </div>
      )}
      {error && (
        <p role="alert" className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
          {error}
        </p>
      )}
    </div>
  )
}
