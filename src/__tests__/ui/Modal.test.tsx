import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { Modal } from '@/components/ui/Modal'

/**
 * Unit tests for Modal component
 *
 * Validates: Requirement 8.8
 *
 * Tests:
 * - isOpen={false} → nothing rendered
 * - isOpen={true} → content rendered via portal
 * - Escape key → onClose called
 * - backdrop click → onClose called
 */

describe('Modal', () => {
  beforeEach(() => {
    // Ensure a clean DOM before each test
    document.body.innerHTML = ''
  })

  afterEach(() => {
    // Clean up after each test
    document.body.innerHTML = ''
  })

  it('renders nothing when isOpen={false}', () => {
    const onClose = vi.fn()
    const { container } = render(
      <Modal isOpen={false} onClose={onClose} title="Test Modal">
        <div>Modal content</div>
      </Modal>
    )

    // The modal should not render any content
    expect(screen.queryByText('Modal content')).not.toBeInTheDocument()
    expect(screen.queryByText('Test Modal')).not.toBeInTheDocument()
    expect(container.querySelector('[role="dialog"]')).not.toBeInTheDocument()
  })

  it('renders content via portal when isOpen={true}', () => {
    const onClose = vi.fn()
    render(
      <Modal isOpen={true} onClose={onClose} title="Test Modal">
        <div>Modal content</div>
      </Modal>
    )

    // Content should be rendered
    expect(screen.getByText('Modal content')).toBeInTheDocument()
    expect(screen.getByText('Test Modal')).toBeInTheDocument()

    // Should have a dialog role
    expect(screen.getByRole('dialog')).toBeInTheDocument()

    // Should be rendered in the body (portal)
    expect(document.body.querySelector('[role="dialog"]')).toBeInTheDocument()
  })

  it('calls onClose when Escape key is pressed', async () => {
    const onClose = vi.fn()
    render(
      <Modal isOpen={true} onClose={onClose} title="Test Modal">
        <div>Modal content</div>
      </Modal>
    )

    // Press Escape key
    fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' })

    // onClose should be called
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('calls onClose when backdrop is clicked', async () => {
    const onClose = vi.fn()
    render(
      <Modal isOpen={true} onClose={onClose} title="Test Modal">
        <div>Modal content</div>
      </Modal>
    )

    // Find the backdrop (the semi-transparent overlay)
    const backdrop = document.querySelector('[aria-hidden="true"]')
    expect(backdrop).toBeInTheDocument()

    // Click the backdrop
    fireEvent.click(backdrop!)

    // onClose should be called
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('does not call onClose when modal content is clicked', async () => {
    const onClose = vi.fn()
    render(
      <Modal isOpen={true} onClose={onClose} title="Test Modal">
        <div>Modal content</div>
      </Modal>
    )

    // Click the modal content
    const content = screen.getByText('Modal content')
    fireEvent.click(content)

    // onClose should NOT be called
    expect(onClose).not.toHaveBeenCalled()
  })

  it('renders with bottom-sheet variant on mobile', () => {
    const onClose = vi.fn()
    render(
      <Modal isOpen={true} onClose={onClose} title="Test Modal" variant="bottom-sheet">
        <div>Modal content</div>
      </Modal>
    )

    // Content should be rendered
    expect(screen.getByText('Modal content')).toBeInTheDocument()

    // Dialog should have the bottom-sheet styling
    const dialog = screen.getByRole('dialog')
    expect(dialog).toHaveClass('rounded-t-2xl')
    expect(dialog).toHaveClass('max-h-[85vh]')
  })

  it('renders with dialog variant on desktop', () => {
    const onClose = vi.fn()
    render(
      <Modal isOpen={true} onClose={onClose} title="Test Modal" variant="dialog">
        <div>Modal content</div>
      </Modal>
    )

    // Content should be rendered
    expect(screen.getByText('Modal content')).toBeInTheDocument()

    // Dialog should have the dialog styling
    const dialog = screen.getByRole('dialog')
    expect(dialog).toHaveClass('rounded-2xl')
    expect(dialog).toHaveClass('max-w-[480px]')
  })

  it('renders close button that calls onClose', async () => {
    const onClose = vi.fn()
    render(
      <Modal isOpen={true} onClose={onClose} title="Test Modal">
        <div>Modal content</div>
      </Modal>
    )

    // Find the close button
    const closeButton = screen.getByLabelText('Close modal')
    expect(closeButton).toBeInTheDocument()

    // Click the close button
    fireEvent.click(closeButton)

    // onClose should be called
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('locks body scroll when open', () => {
    const onClose = vi.fn()
    const { rerender } = render(
      <Modal isOpen={false} onClose={onClose} title="Test Modal">
        <div>Modal content</div>
      </Modal>
    )

    // Body scroll should not be locked
    expect(document.body.style.overflow).not.toBe('hidden')

    // Open the modal
    rerender(
      <Modal isOpen={true} onClose={onClose} title="Test Modal">
        <div>Modal content</div>
      </Modal>
    )

    // Body scroll should be locked
    expect(document.body.style.overflow).toBe('hidden')

    // Close the modal
    rerender(
      <Modal isOpen={false} onClose={onClose} title="Test Modal">
        <div>Modal content</div>
      </Modal>
    )

    // Body scroll should be unlocked
    expect(document.body.style.overflow).not.toBe('hidden')
  })

  it('renders without title when title prop is not provided', () => {
    const onClose = vi.fn()
    render(
      <Modal isOpen={true} onClose={onClose}>
        <div>Modal content</div>
      </Modal>
    )

    // Content should be rendered
    expect(screen.getByText('Modal content')).toBeInTheDocument()

    // No title should be rendered
    const titleElements = document.querySelectorAll('h2')
    expect(titleElements.length).toBe(0)
  })

  it('renders with aria-modal="true" for accessibility', () => {
    const onClose = vi.fn()
    render(
      <Modal isOpen={true} onClose={onClose} title="Test Modal">
        <div>Modal content</div>
      </Modal>
    )

    const dialog = screen.getByRole('dialog')
    expect(dialog).toHaveAttribute('aria-modal', 'true')
  })

  it('associates title with aria-labelledby when title is provided', () => {
    const onClose = vi.fn()
    render(
      <Modal isOpen={true} onClose={onClose} title="Test Modal">
        <div>Modal content</div>
      </Modal>
    )

    const dialog = screen.getByRole('dialog')
    // Should have aria-labelledby pointing to the title
    expect(dialog).toHaveAttribute('aria-labelledby')
  })

  it('handles multiple Escape key presses correctly', () => {
    const onClose = vi.fn()
    render(
      <Modal isOpen={true} onClose={onClose} title="Test Modal">
        <div>Modal content</div>
      </Modal>
    )

    // Press Escape key multiple times
    fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' })
    fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' })

    // onClose should be called twice
    expect(onClose).toHaveBeenCalledTimes(2)
  })

  it('renders backdrop with correct styling', () => {
    const onClose = vi.fn()
    render(
      <Modal isOpen={true} onClose={onClose} title="Test Modal">
        <div>Modal content</div>
      </Modal>
    )

    const backdrop = document.querySelector('[aria-hidden="true"]')
    expect(backdrop).toBeInTheDocument()
    expect(backdrop).toHaveClass('bg-black/50')
    expect(backdrop).toHaveClass('fixed')
    expect(backdrop).toHaveClass('inset-0')
  })

  it('renders portal content in document.body', () => {
    const onClose = vi.fn()
    render(
      <Modal isOpen={true} onClose={onClose} title="Test Modal">
        <div data-testid="modal-content">Modal content</div>
      </Modal>
    )

    // The modal content should be in the body
    const modalContent = document.querySelector('[data-testid="modal-content"]')
    expect(modalContent).toBeInTheDocument()
    expect(document.body.contains(modalContent)).toBe(true)
  })

  it('transitions from closed to open state', () => {
    const onClose = vi.fn()
    const { rerender } = render(
      <Modal isOpen={false} onClose={onClose} title="Test Modal">
        <div>Modal content</div>
      </Modal>
    )

    // Initially closed
    expect(screen.queryByText('Modal content')).not.toBeInTheDocument()

    // Open the modal
    rerender(
      <Modal isOpen={true} onClose={onClose} title="Test Modal">
        <div>Modal content</div>
      </Modal>
    )

    // Now open
    expect(screen.getByText('Modal content')).toBeInTheDocument()
  })

  it('transitions from open to closed state', () => {
    const onClose = vi.fn()
    const { rerender } = render(
      <Modal isOpen={true} onClose={onClose} title="Test Modal">
        <div>Modal content</div>
      </Modal>
    )

    // Initially open
    expect(screen.getByText('Modal content')).toBeInTheDocument()

    // Close the modal
    rerender(
      <Modal isOpen={false} onClose={onClose} title="Test Modal">
        <div>Modal content</div>
      </Modal>
    )

    // Now closed
    expect(screen.queryByText('Modal content')).not.toBeInTheDocument()
  })
})
