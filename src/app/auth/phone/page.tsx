'use client'

import { Suspense, useState, useEffect, useRef, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Phone, ArrowLeft, ShieldCheck, RefreshCw, Loader2 } from 'lucide-react'
import { authManager } from '@/lib/firebase/authManager'
import { fetchCurrentPersonalProfile } from '@/lib/api/profile'
import { useAuthStore } from '@/store/authStore'
import { setAuthCookie } from '@/lib/firebase/authCookie'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const OTP_LENGTH = 6
const COUNTDOWN_SECONDS = 60
const MAX_ATTEMPTS = 3

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type Step = 'phone' | 'otp'

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

function PhoneOtpPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirect') ?? '/'

  const handlePostAuth = useCallback(async () => {
    const profile = await fetchCurrentPersonalProfile()
    const { getAuth } = await import('firebase/auth')
    const { default: firebaseApp } = await import('@/lib/firebase/firebaseApp')
    const auth = getAuth(firebaseApp)
    const currentUser = auth.currentUser
    if (!currentUser) throw new Error('No Firebase user after phone sign-in')
    useAuthStore.getState().setUser(profile, currentUser)
    setAuthCookie()
  }, [])

  // Step state
  const [step, setStep] = useState<Step>('phone')

  // Phone step
  const [phone, setPhone] = useState('')
  const [phoneSending, setPhoneSending] = useState(false)
  const [phoneError, setPhoneError] = useState('')

  // OTP step
  const [otp, setOtp] = useState('')
  const [otpVerifying, setOtpVerifying] = useState(false)
  const [otpError, setOtpError] = useState('')
  const [attempts, setAttempts] = useState(0)
  const locked = attempts >= MAX_ATTEMPTS

  // Countdown timer
  const [countdown, setCountdown] = useState(COUNTDOWN_SECONDS)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // ---------------------------------------------------------------------------
  // Timer helpers
  // ---------------------------------------------------------------------------

  const startCountdown = useCallback(() => {
    setCountdown(COUNTDOWN_SECONDS)
    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!)
          timerRef.current = null
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }, [])

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [])

  // ---------------------------------------------------------------------------
  // Step 1 — Send OTP
  // ---------------------------------------------------------------------------

  async function handleSendOtp(e: React.FormEvent) {
    e.preventDefault()
    setPhoneError('')

    const trimmed = phone.trim()
    if (!trimmed) {
      setPhoneError('Please enter your phone number.')
      return
    }
    // Basic validation: digits only, 10 chars for Indian numbers
    if (!/^\d{10}$/.test(trimmed)) {
      setPhoneError('Enter a valid 10-digit phone number.')
      return
    }

    setPhoneSending(true)
    try {
      await authManager.sendPhoneOtp(`+91${trimmed}`, 'recaptcha-container')
      setStep('otp')
      startCountdown()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to send OTP. Please try again.'
      setPhoneError(msg)
    } finally {
      setPhoneSending(false)
    }
  }

  // ---------------------------------------------------------------------------
  // Step 2 — Resend OTP
  // ---------------------------------------------------------------------------

  async function handleResend() {
    if (countdown > 0) return
    setOtpError('')
    setOtp('')
    setAttempts(0)

    try {
      await authManager.sendPhoneOtp(`+91${phone.trim()}`, 'recaptcha-container')
      startCountdown()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to resend OTP. Please try again.'
      setOtpError(msg)
    }
  }

  // ---------------------------------------------------------------------------
  // Step 2 — Verify OTP
  // ---------------------------------------------------------------------------

  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault()
    if (locked) return
    setOtpError('')

    if (otp.length !== OTP_LENGTH) {
      setOtpError(`Enter the ${OTP_LENGTH}-digit OTP sent to your phone.`)
      return
    }

    setOtpVerifying(true)
    try {
      await authManager.confirmOtp(otp)
      await handlePostAuth()
      router.replace(redirectTo)
    } catch (err: unknown) {
      const newAttempts = attempts + 1
      setAttempts(newAttempts)
      if (newAttempts >= MAX_ATTEMPTS) {
        setOtpError('Too many attempts. Please try again later.')
      } else {
        const msg = err instanceof Error ? err.message : 'Invalid OTP. Please try again.'
        setOtpError(`${msg} (${MAX_ATTEMPTS - newAttempts} attempt${MAX_ATTEMPTS - newAttempts === 1 ? '' : 's'} remaining)`)
      }
    } finally {
      setOtpVerifying(false)
    }
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4 py-12">
      {/* Invisible reCAPTCHA container — must be in the DOM before sendPhoneOtp */}
      <div id="recaptcha-container" />

      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-orange-50 mb-4">
            {step === 'phone' ? (
              <Phone className="w-7 h-7 text-orange-500" aria-hidden="true" />
            ) : (
              <ShieldCheck className="w-7 h-7 text-orange-500" aria-hidden="true" />
            )}
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            {step === 'phone' ? 'Phone Verification' : 'Enter OTP'}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {step === 'phone'
              ? "We'll send a one-time password to your number."
              : `OTP sent to +91 ${phone.trim()}`}
          </p>
        </div>

        {/* ------------------------------------------------------------------ */}
        {/* Step 1 — Phone input                                                */}
        {/* ------------------------------------------------------------------ */}
        {step === 'phone' && (
          <form onSubmit={handleSendOtp} noValidate>
            <div className="mb-4">
              <label
                htmlFor="phone"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Phone number
              </label>
              <div className="flex rounded-lg border border-gray-300 overflow-hidden focus-within:ring-2 focus-within:ring-orange-500 focus-within:border-orange-500 transition">
                {/* Country code prefix */}
                <span className="flex items-center px-3 bg-gray-50 text-gray-600 text-sm font-medium border-r border-gray-300 select-none">
                  +91
                </span>
                <input
                  id="phone"
                  type="tel"
                  inputMode="numeric"
                  autoComplete="tel-national"
                  maxLength={10}
                  value={phone}
                  onChange={(e) => {
                    // Allow digits only
                    setPhone(e.target.value.replace(/\D/g, ''))
                    setPhoneError('')
                  }}
                  placeholder="10-digit number"
                  className="flex-1 px-3 py-2.5 text-sm text-gray-900 bg-white outline-none placeholder:text-gray-400"
                  aria-describedby={phoneError ? 'phone-error' : undefined}
                  aria-invalid={!!phoneError}
                  disabled={phoneSending}
                />
              </div>
              {phoneError && (
                <p id="phone-error" role="alert" className="mt-1.5 text-xs text-red-600">
                  {phoneError}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={phoneSending}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white text-sm font-semibold transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {phoneSending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                  Sending OTP…
                </>
              ) : (
                'Send OTP'
              )}
            </button>
          </form>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* Step 2 — OTP input                                                  */}
        {/* ------------------------------------------------------------------ */}
        {step === 'otp' && (
          <form onSubmit={handleVerifyOtp} noValidate>
            {/* Back to phone step */}
            <button
              type="button"
              onClick={() => {
                setStep('phone')
                setOtp('')
                setOtpError('')
                setAttempts(0)
                if (timerRef.current) clearInterval(timerRef.current)
              }}
              className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-5 transition"
              aria-label="Change phone number"
            >
              <ArrowLeft className="w-4 h-4" aria-hidden="true" />
              Change number
            </button>

            <div className="mb-4">
              <label
                htmlFor="otp"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                One-time password
              </label>
              <input
                id="otp"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={OTP_LENGTH}
                value={otp}
                onChange={(e) => {
                  setOtp(e.target.value.replace(/\D/g, ''))
                  setOtpError('')
                }}
                placeholder="6-digit OTP"
                className="w-full px-3 py-2.5 text-sm text-gray-900 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition placeholder:text-gray-400 tracking-widest disabled:bg-gray-50 disabled:text-gray-400"
                aria-describedby={otpError ? 'otp-error' : undefined}
                aria-invalid={!!otpError}
                disabled={otpVerifying || locked}
              />
              {otpError && (
                <p id="otp-error" role="alert" className="mt-1.5 text-xs text-red-600">
                  {otpError}
                </p>
              )}
            </div>

            {/* Countdown / Resend */}
            <div className="mb-5 text-center">
              {countdown > 0 ? (
                <p className="text-sm text-gray-500">
                  Resend in{' '}
                  <span className="font-semibold text-gray-700">{countdown}s</span>
                </p>
              ) : (
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={locked}
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-orange-500 hover:text-orange-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />
                  Resend OTP
                </button>
              )}
            </div>

            <button
              type="submit"
              disabled={otpVerifying || locked}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white text-sm font-semibold transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {otpVerifying ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                  Verifying…
                </>
              ) : (
                'Verify OTP'
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

export default function PhoneOtpPage() {
  return (
    <Suspense>
      <PhoneOtpPageContent />
    </Suspense>
  )
}