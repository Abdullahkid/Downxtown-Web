import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { ConfirmationModal } from '@/components/ui/ConfirmationModal'

/**
 * Unit tests for ConfirmationModal component
 *
 * Validates: Requirement 5.5
 *
 * Tests:
 * - Confirm button click calls onConfirm
 * - Cancel button click calls onCancel
 * - Backdrop click closes modal (calls onClose)
 * - isLoading disables confirm button
 */

describe('ConfirmationModal', () => {
  it('should call onConfirm when confirm button is clicked', async () => {
    const onConfirm = vi.fn()
    const onCancel = vi.fn()
    const onClose = vi.fn()

    render(
      <ConfirmationModal
        isOpen={true}
        onClose={onClose}
        title="Test Modal"
        message="Are you sure?"
        confirmLabel="Confirm"
        cancelLabel="Cancel"
        onConfirm={onConfirm}
        onCancel={onCancel}
      />
    )

    const confirmButton = screen.getByRole('button', { name: /confirm/i })
    await userEvent.click(confirmButton)

    expect(onConfirm).toHaveBeenCalledOnce()
    expect(onCancel).not.toHaveBeenCalled()
  })

  it('should call onCancel when cancel button is clicked', async () => {
    const onConfirm = vi.fn()
    const onCancel = vi.fn()
    const onClose = vi.fn()

    render(
      <ConfirmationModal
        isOpen={true}
        onClose={onClose}
        title="Test Modal"
        message="Are you sure?"
        confirmLabel="Confirm"
        cancelLabel="Cancel"
        onConfirm={onConfirm}
        onCancel={onCancel}
      />
    )

    const cancelButton = screen.getByRole('button', { name: /cancel/i })
    await userEvent.click(cancelButton)

    expect(onCancel).toHaveBeenCalledOnce()
    expect(onConfirm).not.toHaveBeenCalled()
  })

  it('should call onClose when backdrop is clicked', async () => {
    const onConfirm = vi.fn()
    const onCancel = vi.fn()
    const onClose = vi.fn()

    render(
      <ConfirmationModal
        isOpen={true}
        onClose={onClose}
        title="Test Modal"
        message="Are you sure?"
        confirmLabel="Confirm"
        cancelLabel="Cancel"
        onConfirm={onConfirm}
        onCancel={onCancel}
      />
    )

    // Find the backdrop (the semi-transparent overlay)
    const backdrop = document.querySelector('.bg-black\\/50')
    expect(backdrop).toBeInTheDocument()

    // Click the backdrop
    fireEvent.click(backdrop!)

    expect(onClose).toHaveBeenCalledOnce()
  })

  it('should disable confirm button when isLoading is true', async () => {
    const onConfirm = vi.fn()
    const onCancel = vi.fn()
    const onClose = vi.fn()

    render(
      <ConfirmationModal
        isOpen={true}
        onClose={onClose}
        title="Test Modal"
        message="Are you sure?"
        confirmLabel="Confirm"
        cancelLabel="Cancel"
        onConfirm={onConfirm}
        onCancel={onCancel}
        isLoading={true}
      />
    )

    const confirmButton = screen.getByRole('button', { name: /confirm/i })

    // Button should be disabled
    expect(confirmButton).toBeDisabled()

    // Clicking should not call onConfirm
    await userEvent.click(confirmButton)
    expect(onConfirm).not.toHaveBeenCalled()
  })

  it('should disable cancel button when isLoading is true', async () => {
    const onConfirm = vi.fn()
    const onCancel = vi.fn()
    const onClose = vi.fn()

    render(
      <ConfirmationModal
        isOpen={true}
        onClose={onClose}
        title="Test Modal"
        message="Are you sure?"
        confirmLabel="Confirm"
        cancelLabel="Cancel"
        onConfirm={onConfirm}
        onCancel={onCancel}
        isLoading={true}
      />
    )

    const cancelButton = screen.getByRole('button', { name: /cancel/i })

    // Button should be disabled
    expect(cancelButton).toBeDisabled()

    // Clicking should not call onCancel
    await userEvent.click(cancelButton)
    expect(onCancel).not.toHaveBeenCalled()
  })

  it('should render with default labels when not provided', () => {
    const onConfirm = vi.fn()
    const onCancel = vi.fn()
    const onClose = vi.fn()

    render(
      <ConfirmationModal
        isOpen={true}
        onClose={onClose}
        title="Test Modal"
        message="Are you sure?"
        onConfirm={onConfirm}
        onCancel={onCancel}
      />
    )

    expect(screen.getByRole('button', { name: /confirm/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument()
  })

  it('should render with custom labels when provided', () => {
    const onConfirm = vi.fn()
    const onCancel = vi.fn()
    const onClose = vi.fn()

    render(
      <ConfirmationModal
        isOpen={true}
        onClose={onClose}
        title="Delete Account"
        message="This action cannot be undone."
        confirmLabel="Delete Forever"
        cancelLabel="Keep Account"
        onConfirm={onConfirm}
        onCancel={onCancel}
      />
    )

    expect(screen.getByRole('button', { name: /delete forever/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /keep account/i })).toBeInTheDocument()
  })

  it('should render title and message', () => {
    const onConfirm = vi.fn()
    const onCancel = vi.fn()
    const onClose = vi.fn()

    render(
      <ConfirmationModal
        isOpen={true}
        onClose={onClose}
        title="Confirm Action"
        message="Are you absolutely sure?"
        onConfirm={onConfirm}
        onCancel={onCancel}
      />
    )

    expect(screen.getByText('Confirm Action')).toBeInTheDocument()
    expect(screen.getByText('Are you absolutely sure?')).toBeInTheDocument()
  })

  it('should not render when isOpen is false', () => {
    const onConfirm = vi.fn()
    const onCancel = vi.fn()
    const onClose = vi.fn()

    const { container } = render(
      <ConfirmationModal
        isOpen={false}
        onClose={onClose}
        title="Test Modal"
        message="Are you sure?"
        onConfirm={onConfirm}
        onCancel={onCancel}
      />
    )

    // Modal should not be in the document
    expect(screen.queryByText('Test Modal')).not.toBeInTheDocument()
    expect(screen.queryByText('Are you sure?')).not.toBeInTheDocument()
  })

  it('should use destructive variant for confirm button when confirmVariant is destructive', () => {
    const onConfirm = vi.fn()
    const onCancel = vi.fn()
    const onClose = vi.fn()

    render(
      <ConfirmationModal
        isOpen={true}
        onClose={onClose}
        title="Delete"
        message="Delete this item?"
        confirmLabel="Delete"
        cancelLabel="Cancel"
        confirmVariant="destructive"
        onConfirm={onConfirm}
        onCancel={onCancel}
      />
    )

    const confirmButton = screen.getByRole('button', { name: /delete/i })
    // Destructive variant should have app-error color class
    expect(confirmButton).toHaveClass('bg-app-error')
  })

  it('should use primary variant for confirm button when confirmVariant is primary', () => {
    const onConfirm = vi.fn()
    const onCancel = vi.fn()
    const onClose = vi.fn()

    render(
      <ConfirmationModal
        isOpen={true}
        onClose={onClose}
        title="Confirm"
        message="Proceed with this action?"
        confirmLabel="Proceed"
        cancelLabel="Cancel"
        confirmVariant="primary"
        onConfirm={onConfirm}
        onCancel={onCancel}
      />
    )

    const confirmButton = screen.getByRole('button', { name: /proceed/i })
    // Primary variant should have brand color class
    expect(confirmButton).toHaveClass('bg-brand')
  })

  it('should show loading spinner on confirm button when isLoading is true', () => {
    const onConfirm = vi.fn()
    const onCancel = vi.fn()
    const onClose = vi.fn()

    render(
      <ConfirmationModal
        isOpen={true}
        onClose={onClose}
        title="Test Modal"
        message="Are you sure?"
        confirmLabel="Confirm"
        cancelLabel="Cancel"
        onConfirm={onConfirm}
        onCancel={onCancel}
        isLoading={true}
      />
    )

    // The spinner should be present (Loader2 icon with animate-spin class)
    const spinner = document.querySelector('.animate-spin')
    expect(spinner).toBeInTheDocument()
  })
})
