'use client'

import React, { useEffect, useRef, useCallback } from 'react'
import ReactDOM from 'react-dom'
import { X } from 'lucide-react'

export type ModalVariant = 'dialog' | 'bottom-sheet'

export interface ModalProps {
  /** Controls whether the modal is visible */
  isOpen: boolean
  /** Called when the modal should close (Escape key, backdrop click, close button) */
  onClose: () => void
  /** Optional title rendered in the modal header */
  title?: string
  /** Modal body content */
  children: React.ReactNode
  /**
   * Visual variant.
   * - `bottom-sheet` — slides up from the bottom of the viewport (mobile-first)
   * - `dialog`       — centered overlay (desktop-first)
   *
   * When omitted the component renders BOTH variants simultaneously and uses
   * responsive CSS classes to show the correct one:
   *   • `bottom-sheet` is visible on `< lg` (hidden on `lg:`)
   *   • `dialog`       is visible on `≥ lg` (hidden below `lg:`)
   *
   * This avoids a JS media-query check and prevents hydration mismatches.
   */
  variant?: ModalVariant
}

/** All element types that can receive keyboard focus */
const FOCUSABLE_SELECTORS = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ')

function getFocusableElements(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTORS))
}

// ---------------------------------------------------------------------------
// Sub-components for each variant
// ---------------------------------------------------------------------------

interface BottomSheetPanelProps {
  title?: string
  onClose: () => void
  children: React.ReactNode
  panelRef: React.RefObject<HTMLDivElement | null>
}

function BottomSheetPanel({ title, onClose, children, panelRef }: BottomSheetPanelProps) {
  return (
    <div
      ref={panelRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title-bs' : undefined}
      className="fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl max-h-[85vh] overflow-y-auto z-50 p-4 shadow-modal"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        {title ? (
          <h2 id="modal-title-bs" className="text-base font-semibold text-gray-900">
            {title}
          </h2>
        ) : (
          <span />
        )}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close modal"
          className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 active:bg-gray-200 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
        >
          <X size={20} aria-hidden="true" />
        </button>
      </div>

      {children}
    </div>
  )
}

interface DialogPanelProps {
  title?: string
  onClose: () => void
  children: React.ReactNode
  panelRef: React.RefObject<HTMLDivElement | null>
}

function DialogPanel({ title, onClose, children, panelRef }: DialogPanelProps) {
  return (
    /* Outer wrapper: full-screen flex container — pointer-events-none so clicks
       on the transparent area fall through to the backdrop below */
    <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'modal-title-dlg' : undefined}
        className="bg-white rounded-2xl max-w-[480px] w-full mx-4 p-6 pointer-events-auto shadow-modal"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          {title ? (
            <h2 id="modal-title-dlg" className="text-base font-semibold text-gray-900">
              {title}
            </h2>
          ) : (
            <span />
          )}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 active:bg-gray-200 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <X size={20} aria-hidden="true" />
          </button>
        </div>

        {children}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main Modal component
// ---------------------------------------------------------------------------

/**
 * Modal UI primitive.
 *
 * Features:
 * - Renders via `ReactDOM.createPortal` into `document.body`
 * - Focus trap: Tab/Shift+Tab cycle within the modal; Escape calls `onClose`
 * - Body scroll lock: `overflow-hidden` added to `document.body` while open
 * - Backdrop: semi-transparent overlay; click calls `onClose`
 * - `bottom-sheet` variant: slides up from bottom, `rounded-t-2xl`, max-height 85vh
 * - `dialog` variant: centered, `max-w-[480px]`, `rounded-2xl`
 * - Default (no `variant` prop): CSS-driven responsive — bottom-sheet on `< lg`,
 *   dialog on `≥ lg` (both rendered, toggled via `lg:hidden` / `hidden lg:block`)
 */
export function Modal({ isOpen, onClose, title, children, variant }: ModalProps) {
  const bsRef = useRef<HTMLDivElement>(null)
  const dlgRef = useRef<HTMLDivElement>(null)

  // -------------------------------------------------------------------------
  // Body scroll lock
  // -------------------------------------------------------------------------
  useEffect(() => {
    if (!isOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [isOpen])

  // -------------------------------------------------------------------------
  // Focus trap + Escape key handler
  // -------------------------------------------------------------------------
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
        return
      }

      if (e.key !== 'Tab') return

      // Determine which panel is currently visible/active.
      // When `variant` is explicit we use that panel's ref; when it's
      // CSS-driven we prefer the dialog panel on lg+ and bottom-sheet below.
      const activePanel =
        variant === 'dialog'
          ? dlgRef.current
          : variant === 'bottom-sheet'
            ? bsRef.current
            : // CSS-driven: check which panel is rendered in the DOM
              dlgRef.current ?? bsRef.current

      if (!activePanel) return

      const focusable = getFocusableElements(activePanel)
      if (focusable.length === 0) return

      const first = focusable[0]
      const last = focusable[focusable.length - 1]

      if (e.shiftKey) {
        // Shift+Tab: if focus is on first element, wrap to last
        if (document.activeElement === first) {
          e.preventDefault()
          last.focus()
        }
      } else {
        // Tab: if focus is on last element, wrap to first
        if (document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    },
    [onClose, variant],
  )

  // -------------------------------------------------------------------------
  // Focus first focusable element on open; restore on close
  // -------------------------------------------------------------------------
  useEffect(() => {
    if (!isOpen) return

    const previouslyFocused = document.activeElement as HTMLElement | null

    // Small delay to allow the portal to paint before we query focusable elements
    const raf = requestAnimationFrame(() => {
      const panel =
        variant === 'dialog'
          ? dlgRef.current
          : variant === 'bottom-sheet'
            ? bsRef.current
            : dlgRef.current ?? bsRef.current

      if (panel) {
        const focusable = getFocusableElements(panel)
        if (focusable.length > 0) {
          focusable[0].focus()
        } else {
          panel.focus()
        }
      }
    })

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      cancelAnimationFrame(raf)
      document.removeEventListener('keydown', handleKeyDown)
      // Restore focus to the element that was focused before the modal opened
      if (previouslyFocused && typeof previouslyFocused.focus === 'function') {
        previouslyFocused.focus()
      }
    }
  }, [isOpen, handleKeyDown, variant])

  // -------------------------------------------------------------------------
  // Render nothing when closed
  // -------------------------------------------------------------------------
  if (!isOpen) return null

  // -------------------------------------------------------------------------
  // Backdrop — shared by all variants
  // -------------------------------------------------------------------------
  const backdrop = (
    <div
      className="fixed inset-0 bg-black/50 z-40"
      aria-hidden="true"
      onClick={onClose}
    />
  )

  // -------------------------------------------------------------------------
  // Explicit variant rendering
  // -------------------------------------------------------------------------
  if (variant === 'bottom-sheet') {
    return ReactDOM.createPortal(
      <>
        {backdrop}
        <BottomSheetPanel title={title} onClose={onClose} panelRef={bsRef}>
          {children}
        </BottomSheetPanel>
      </>,
      document.body,
    )
  }

  if (variant === 'dialog') {
    return ReactDOM.createPortal(
      <>
        {backdrop}
        <DialogPanel title={title} onClose={onClose} panelRef={dlgRef}>
          {children}
        </DialogPanel>
      </>,
      document.body,
    )
  }

  // -------------------------------------------------------------------------
  // Default: CSS-driven responsive variant
  //
  // Both panels are rendered into the DOM simultaneously.
  // Tailwind responsive classes control visibility:
  //   • bottom-sheet wrapper: visible by default, hidden at lg+  (`lg:hidden`)
  //   • dialog wrapper:       hidden by default, visible at lg+  (`hidden lg:block`)
  //
  // This avoids any JS media-query check and prevents SSR/hydration mismatches.
  // -------------------------------------------------------------------------
  return ReactDOM.createPortal(
    <>
      {backdrop}

      {/* Bottom-sheet: mobile only (< lg) */}
      <div className="lg:hidden">
        <BottomSheetPanel title={title} onClose={onClose} panelRef={bsRef}>
          {children}
        </BottomSheetPanel>
      </div>

      {/* Dialog: desktop only (≥ lg) */}
      <div className="hidden lg:block">
        <DialogPanel title={title} onClose={onClose} panelRef={dlgRef}>
          {children}
        </DialogPanel>
      </div>
    </>,
    document.body,
  )
}

export default Modal
