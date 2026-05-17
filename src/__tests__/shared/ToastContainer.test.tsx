/**
 * Unit tests for ToastContainer
 * Requirements: 3.2, 3.4, 3.5, 3.8
 *
 * Tests:
 * - Empty queue → nothing rendered
 * - One toast → one element rendered
 * - After 4000ms (fake timers) → removeToast called
 * - Three toasts → three elements rendered in order
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { ToastContainer } from '@/components/shared/ToastContainer'
import { useUiStore } from '@/store/uiStore'

describe('ToastContainer', () => {
  beforeEach(() => {
    // Reset the store before each test
    useUiStore.setState({
      toastQueue: [],
    })
    // Use fake timers for auto-dismiss testing
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders nothing when toast queue is empty', () => {
    const { container } = render(<ToastContainer />)
    // The container should be empty or have no alert elements
    const alerts = container.querySelectorAll('[role="alert"]')
    expect(alerts).toHaveLength(0)
  })

  it('renders one toast element when one toast is in the queue', () => {
    useUiStore.setState({
      toastQueue: [
        {
          id: 'toast-1',
          message: 'Test message',
          type: 'success',
        },
      ],
    })

    render(<ToastContainer />)

    const alerts = screen.getAllByRole('alert')
    expect(alerts).toHaveLength(1)
    expect(screen.getByText('Test message')).toBeInTheDocument()
  })

  it('renders three toasts in FIFO order', () => {
    useUiStore.setState({
      toastQueue: [
        {
          id: 'toast-1',
          message: 'First message',
          type: 'success',
        },
        {
          id: 'toast-2',
          message: 'Second message',
          type: 'error',
        },
        {
          id: 'toast-3',
          message: 'Third message',
          type: 'info',
        },
      ],
    })

    render(<ToastContainer />)

    const alerts = screen.getAllByRole('alert')
    expect(alerts).toHaveLength(3)

    // Verify order: first toast should be first in DOM
    expect(alerts[0]).toHaveTextContent('First message')
    expect(alerts[1]).toHaveTextContent('Second message')
    expect(alerts[2]).toHaveTextContent('Third message')
  })

  it('calls removeToast after 4000ms auto-dismiss timer', async () => {
    const removeToastSpy = vi.spyOn(useUiStore.getState(), 'removeToast')

    useUiStore.setState({
      toastQueue: [
        {
          id: 'toast-1',
          message: 'Auto-dismiss test',
          type: 'success',
        },
      ],
    })

    render(<ToastContainer />)

    // Verify toast is rendered
    expect(screen.getByText('Auto-dismiss test')).toBeInTheDocument()

    // Fast-forward time by 4000ms
    vi.advanceTimersByTime(4000)

    // Wait for the removal to be processed (includes 300ms exit animation)
    await waitFor(() => {
      expect(removeToastSpy).toHaveBeenCalledWith('toast-1')
    })

    removeToastSpy.mockRestore()
  })

  it('renders multiple toasts and removes them individually after 4000ms', async () => {
    const removeToastSpy = vi.spyOn(useUiStore.getState(), 'removeToast')

    useUiStore.setState({
      toastQueue: [
        {
          id: 'toast-1',
          message: 'First toast',
          type: 'success',
        },
        {
          id: 'toast-2',
          message: 'Second toast',
          type: 'error',
        },
      ],
    })

    render(<ToastContainer />)

    // Both toasts should be visible
    expect(screen.getByText('First toast')).toBeInTheDocument()
    expect(screen.getByText('Second toast')).toBeInTheDocument()

    // Fast-forward 4000ms for first toast to auto-dismiss
    vi.advanceTimersByTime(4000)

    await waitFor(() => {
      expect(removeToastSpy).toHaveBeenCalledWith('toast-1')
    })

    removeToastSpy.mockRestore()
  })

  it('renders success variant with correct styling', () => {
    useUiStore.setState({
      toastQueue: [
        {
          id: 'toast-success',
          message: 'Success message',
          type: 'success',
        },
      ],
    })

    render(<ToastContainer />)

    const alert = screen.getByRole('alert')
    // Check for success variant classes
    expect(alert).toHaveClass('bg-success/10')
    expect(alert).toHaveClass('text-success')
  })

  it('renders error variant with correct styling', () => {
    useUiStore.setState({
      toastQueue: [
        {
          id: 'toast-error',
          message: 'Error message',
          type: 'error',
        },
      ],
    })

    render(<ToastContainer />)

    const alert = screen.getByRole('alert')
    // Check for error variant classes
    expect(alert).toHaveClass('bg-app-error/10')
    expect(alert).toHaveClass('text-app-error')
  })

  it('renders info variant with correct styling', () => {
    useUiStore.setState({
      toastQueue: [
        {
          id: 'toast-info',
          message: 'Info message',
          type: 'info',
        },
      ],
    })

    render(<ToastContainer />)

    const alert = screen.getByRole('alert')
    // Check for info variant classes
    expect(alert).toHaveClass('bg-brand/10')
    expect(alert).toHaveClass('text-brand')
  })

  it('has dismiss button that removes toast immediately', async () => {
    const removeToastSpy = vi.spyOn(useUiStore.getState(), 'removeToast')

    useUiStore.setState({
      toastQueue: [
        {
          id: 'toast-1',
          message: 'Dismissible toast',
          type: 'success',
        },
      ],
    })

    const { container } = render(<ToastContainer />)

    // Find and click the dismiss button
    const dismissButton = container.querySelector('button[aria-label="Dismiss notification"]')
    expect(dismissButton).toBeInTheDocument()

    // Click the dismiss button
    dismissButton?.click()

    // Wait for removal (includes 300ms exit animation)
    await waitFor(() => {
      expect(removeToastSpy).toHaveBeenCalledWith('toast-1')
    })

    removeToastSpy.mockRestore()
  })

  it('has correct accessibility attributes', () => {
    useUiStore.setState({
      toastQueue: [
        {
          id: 'toast-1',
          message: 'Accessible toast',
          type: 'success',
        },
      ],
    })

    const { container } = render(<ToastContainer />)

    const alert = screen.getByRole('alert')
    expect(alert).toHaveAttribute('aria-live', 'polite')
    expect(alert).toHaveAttribute('aria-atomic', 'true')

    // Container should have aria-label
    const toastContainer = container.querySelector('[aria-label="Notifications"]')
    expect(toastContainer).toBeInTheDocument()
  })
})
