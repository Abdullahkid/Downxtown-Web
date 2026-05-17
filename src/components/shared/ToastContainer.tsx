'use client'

/**
 * ToastContainer — reads `toastQueue` from `useUiStore` and renders
 * stacked toast notifications with auto-dismiss, entrance/exit transitions,
 * and responsive positioning.
 *
 * Mobile  (< lg): fixed bottom-16 left-0 right-0, centered column
 * Desktop (≥ lg): fixed bottom-6 right-6, right-aligned column
 *
 * Requirements: 3.2, 3.3, 3.4, 3.5, 3.6, 3.7
 */

import { useEffect, useRef, useState } from 'react'
import { CheckCircle2, XCircle, Info, X } from 'lucide-react'
import { useUiStore, type Toast } from '@/store/uiStore'

// ---------------------------------------------------------------------------
// Variant configuration
// ---------------------------------------------------------------------------

const VARIANT_CONFIG = {
  success: {
    icon: CheckCircle2,
    containerClass:
      'bg-success/10 text-success border-success/20',
    iconClass: 'text-success',
  },
  error: {
    icon: XCircle,
    containerClass:
      'bg-app-error/10 text-app-error border-app-error/20',
    iconClass: 'text-app-error',
  },
  info: {
    icon: Info,
    containerClass:
      'bg-brand/10 text-brand border-brand/20',
    iconClass: 'text-brand',
  },
} as const

const AUTO_DISMISS_MS = 4000

// ---------------------------------------------------------------------------
// ToastItem — individual toast with auto-dismiss and entrance/exit animation
// ---------------------------------------------------------------------------

interface ToastItemProps {
  toast: Toast
  onDismiss: (id: string) => void
}

function ToastItem({ toast, onDismiss }: ToastItemProps) {
  // `visible` drives the CSS transition: false = exit state, true = enter state
  const [visible, setVisible] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Trigger entrance animation on mount (next tick so transition fires)
  useEffect(() => {
    const raf = requestAnimationFrame(() => setVisible(true))
    return () => cancelAnimationFrame(raf)
  }, [])

  // Auto-dismiss after AUTO_DISMISS_MS
  useEffect(() => {
    timerRef.current = setTimeout(() => {
      handleDismiss()
    }, AUTO_DISMISS_MS)

    return () => {
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toast.id])

  function handleDismiss() {
    // Clear any pending auto-dismiss timer
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
    // Trigger exit animation, then remove from store after transition completes
    setVisible(false)
    setTimeout(() => onDismiss(toast.id), 300)
  }

  const config = VARIANT_CONFIG[toast.type]
  const Icon = config.icon

  return (
    <div
      role="alert"
      aria-live="polite"
      aria-atomic="true"
      className={[
        // Base toast layout
        'flex items-center gap-3 px-4 py-3 rounded-lg border shadow-card max-w-sm w-full',
        // Variant colours
        config.containerClass,
        // Entrance / exit transition
        'transition-all duration-300 ease-out',
        visible
          ? 'translate-y-0 opacity-100 scale-100'
          : 'translate-y-2 opacity-0 scale-95',
      ].join(' ')}
    >
      {/* Variant icon */}
      <Icon
        size={20}
        className={['flex-shrink-0', config.iconClass].join(' ')}
        aria-hidden="true"
      />

      {/* Message */}
      <p className="flex-1 text-sm font-medium leading-snug">{toast.message}</p>

      {/* Manual dismiss button */}
      <button
        type="button"
        onClick={handleDismiss}
        aria-label="Dismiss notification"
        className="flex-shrink-0 p-1 rounded-md opacity-60 hover:opacity-100 transition-opacity focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-current"
      >
        <X size={16} aria-hidden="true" />
      </button>
    </div>
  )
}

// ---------------------------------------------------------------------------
// ToastContainer — reads queue from store and renders all active toasts
// ---------------------------------------------------------------------------

export function ToastContainer() {
  const toastQueue = useUiStore((state) => state.toastQueue)
  const removeToast = useUiStore((state) => state.removeToast)

  if (toastQueue.length === 0) return null

  return (
    <div
      aria-label="Notifications"
      className={[
        // Mobile: bottom-center, above BottomNav (bottom-16 = 64px)
        'fixed bottom-16 left-0 right-0 flex flex-col items-center gap-2 px-4 z-50',
        // Desktop: bottom-right corner
        'sm:bottom-6 sm:right-6 sm:left-auto sm:items-end sm:px-0',
      ].join(' ')}
    >
      {toastQueue.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={removeToast} />
      ))}
    </div>
  )
}
