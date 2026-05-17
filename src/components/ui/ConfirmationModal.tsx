'use client'

import React, { useEffect, useRef } from 'react'
import { Modal } from './Modal'
import { Button } from './Button'

export interface ConfirmationModalProps {
  /** Controls whether the modal is visible */
  isOpen: boolean
  /** Called when the modal should close */
  onClose: () => void
  /** Modal heading */
  title: string
  /** Descriptive message shown in the modal body */
  message: string
  /** Label for the confirm button (default: 'Confirm') */
  confirmLabel?: string
  /** Label for the cancel button (default: 'Cancel') */
  cancelLabel?: string
  /** Visual variant for the confirm button (default: 'primary') */
  confirmVariant?: 'destructive' | 'primary'
  /** Called when the user clicks the confirm button */
  onConfirm: () => void
  /** Called when the user clicks the cancel button */
  onCancel: () => void
  /** When true, delegates to Button's loading prop and disables the cancel button */
  isLoading?: boolean
}

/**
 * ConfirmationModal
 *
 * A thin wrapper around `Modal` that renders a message and two action buttons:
 * - Cancel  → `Button variant="secondary"`
 * - Confirm → `Button variant={confirmVariant}` (destructive | primary)
 *
 * Focus restoration: captures `document.activeElement` before the modal opens
 * and restores focus to that element (or `document.body` as fallback) when the
 * modal closes. The `Modal` component handles the focus trap while open.
 */
export function ConfirmationModal({
  isOpen,
  onClose,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  confirmVariant = 'primary',
  onConfirm,
  onCancel,
  isLoading = false,
}: ConfirmationModalProps) {
  // Capture the element that had focus before the modal opened so we can
  // restore it when the modal closes.
  const triggerRef = useRef<Element | null>(null)

  useEffect(() => {
    if (isOpen) {
      // Store the currently focused element when the modal opens
      triggerRef.current = document.activeElement
    } else {
      // Restore focus when the modal closes
      const target = triggerRef.current
      if (target && typeof (target as HTMLElement).focus === 'function') {
        ;(target as HTMLElement).focus()
      } else {
        document.body.focus()
      }
      triggerRef.current = null
    }
  }, [isOpen])

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} variant="dialog">
      {/* Message */}
      <p className="text-gray-600 mb-6">{message}</p>

      {/* Action row */}
      <div className="flex gap-3 justify-end">
        <Button
          variant="secondary"
          onClick={onCancel}
          disabled={isLoading}
        >
          {cancelLabel}
        </Button>

        <Button
          variant={confirmVariant}
          loading={isLoading}
          onClick={onConfirm}
        >
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  )
}

export default ConfirmationModal
