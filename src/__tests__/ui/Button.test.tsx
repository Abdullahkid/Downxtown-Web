import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { Button } from '@/components/ui/Button'

/**
 * Unit tests for Button component
 *
 * Validates: Requirements 8.2, 8.3, 8.4, 8.5
 *
 * Tests:
 * - variant="primary" → has bg-brand class
 * - variant="destructive" → has bg-app-error class
 * - disabled={true} → onClick not called
 * - loading={true} → spinner present and aria-busy="true"
 */

describe('Button', () => {
  it('renders with primary variant and has bg-brand class', () => {
    render(<Button variant="primary">Click me</Button>)

    const button = screen.getByRole('button', { name: /click me/i })
    expect(button).toBeInTheDocument()
    expect(button).toHaveClass('bg-brand')
  })

  it('renders with destructive variant and has bg-app-error class', () => {
    render(<Button variant="destructive">Delete</Button>)

    const button = screen.getByRole('button', { name: /delete/i })
    expect(button).toBeInTheDocument()
    expect(button).toHaveClass('bg-app-error')
  })

  it('renders with secondary variant', () => {
    render(<Button variant="secondary">Secondary</Button>)

    const button = screen.getByRole('button', { name: /secondary/i })
    expect(button).toBeInTheDocument()
    expect(button).toHaveClass('border-brand')
    expect(button).toHaveClass('text-brand')
  })

  it('renders with ghost variant', () => {
    render(<Button variant="ghost">Ghost</Button>)

    const button = screen.getByRole('button', { name: /ghost/i })
    expect(button).toBeInTheDocument()
    expect(button).toHaveClass('text-brand')
  })

  it('does not call onClick when disabled={true}', () => {
    const onClick = vi.fn()
    render(
      <Button disabled={true} onClick={onClick}>
        Disabled Button
      </Button>
    )

    const button = screen.getByRole('button', { name: /disabled button/i })
    fireEvent.click(button)

    expect(onClick).not.toHaveBeenCalled()
  })

  it('does not call onClick when loading={true}', () => {
    const onClick = vi.fn()
    render(
      <Button loading={true} onClick={onClick}>
        Loading Button
      </Button>
    )

    const button = screen.getByRole('button', { name: /loading button/i })
    fireEvent.click(button)

    expect(onClick).not.toHaveBeenCalled()
  })

  it('calls onClick when enabled and not loading', () => {
    const onClick = vi.fn()
    render(
      <Button onClick={onClick}>
        Enabled Button
      </Button>
    )

    const button = screen.getByRole('button', { name: /enabled button/i })
    fireEvent.click(button)

    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('renders spinner when loading={true}', () => {
    render(<Button loading={true}>Loading</Button>)

    // The Loader2 icon should be rendered
    const spinner = document.querySelector('svg')
    expect(spinner).toBeInTheDocument()
    expect(spinner).toHaveClass('animate-spin')
  })

  it('sets aria-busy="true" when loading={true}', () => {
    render(<Button loading={true}>Loading</Button>)

    const button = screen.getByRole('button', { name: /loading/i })
    expect(button).toHaveAttribute('aria-busy', 'true')
  })

  it('does not set aria-busy when loading={false}', () => {
    render(<Button loading={false}>Not Loading</Button>)

    const button = screen.getByRole('button', { name: /not loading/i })
    expect(button).not.toHaveAttribute('aria-busy')
  })

  it('applies opacity-50 when disabled', () => {
    render(<Button disabled={true}>Disabled</Button>)

    const button = screen.getByRole('button', { name: /disabled/i })
    expect(button).toHaveClass('opacity-50')
    expect(button).toHaveClass('pointer-events-none')
  })

  it('applies opacity-50 when loading', () => {
    render(<Button loading={true}>Loading</Button>)

    const button = screen.getByRole('button', { name: /loading/i })
    expect(button).toHaveClass('opacity-50')
    expect(button).toHaveClass('pointer-events-none')
  })

  it('renders with sm size', () => {
    render(<Button size="sm">Small</Button>)

    const button = screen.getByRole('button', { name: /small/i })
    expect(button).toBeInTheDocument()
    expect(button).toHaveClass('text-sm')
    expect(button).toHaveClass('px-3')
    expect(button).toHaveClass('py-1.5')
  })

  it('renders with md size', () => {
    render(<Button size="md">Medium</Button>)

    const button = screen.getByRole('button', { name: /medium/i })
    expect(button).toBeInTheDocument()
    expect(button).toHaveClass('text-base')
    expect(button).toHaveClass('px-4')
    expect(button).toHaveClass('py-2')
  })

  it('renders with lg size', () => {
    render(<Button size="lg">Large</Button>)

    const button = screen.getByRole('button', { name: /large/i })
    expect(button).toBeInTheDocument()
    expect(button).toHaveClass('text-lg')
    expect(button).toHaveClass('px-6')
    expect(button).toHaveClass('py-3')
  })

  it('enforces min-h-[44px] for touch target compliance', () => {
    render(<Button>Touch Target</Button>)

    const button = screen.getByRole('button', { name: /touch target/i })
    expect(button).toHaveClass('min-h-[44px]')
    expect(button).toHaveClass('min-w-[44px]')
  })

  it('renders with custom className', () => {
    render(<Button className="custom-class">Custom</Button>)

    const button = screen.getByRole('button', { name: /custom/i })
    expect(button).toHaveClass('custom-class')
  })

  it('renders children correctly', () => {
    render(
      <Button>
        <span>Icon</span>
        <span>Label</span>
      </Button>
    )

    expect(screen.getByText('Icon')).toBeInTheDocument()
    expect(screen.getByText('Label')).toBeInTheDocument()
  })

  it('renders with default variant when not specified', () => {
    render(<Button>Default</Button>)

    const button = screen.getByRole('button', { name: /default/i })
    expect(button).toHaveClass('bg-brand')
  })

  it('renders with default size when not specified', () => {
    render(<Button>Default Size</Button>)

    const button = screen.getByRole('button', { name: /default size/i })
    expect(button).toHaveClass('text-base')
    expect(button).toHaveClass('px-4')
    expect(button).toHaveClass('py-2')
  })

  it('has focus ring styling', () => {
    render(<Button>Focus Ring</Button>)

    const button = screen.getByRole('button', { name: /focus ring/i })
    expect(button).toHaveClass('focus:ring-2')
    expect(button).toHaveClass('focus:ring-offset-2')
  })

  it('has transition classes', () => {
    render(<Button>Transition</Button>)

    const button = screen.getByRole('button', { name: /transition/i })
    expect(button).toHaveClass('transition-colors')
  })

  it('renders as button element', () => {
    render(<Button>Button Element</Button>)

    const button = screen.getByRole('button', { name: /button element/i })
    expect(button.tagName).toBe('BUTTON')
  })

  it('accepts additional HTML button attributes', () => {
    render(
      <Button data-testid="custom-button" aria-label="Custom Label">
        Custom
      </Button>
    )

    const button = screen.getByTestId('custom-button')
    expect(button).toHaveAttribute('aria-label', 'Custom Label')
  })

  it('primary variant has correct hover and active states', () => {
    render(<Button variant="primary">Primary</Button>)

    const button = screen.getByRole('button', { name: /primary/i })
    expect(button).toHaveClass('hover:bg-brand-dark')
    expect(button).toHaveClass('active:bg-brand-dark')
  })

  it('destructive variant has correct hover and active states', () => {
    render(<Button variant="destructive">Destructive</Button>)

    const button = screen.getByRole('button', { name: /destructive/i })
    expect(button).toHaveClass('hover:bg-red-700')
    expect(button).toHaveClass('active:bg-red-800')
  })

  it('secondary variant has correct hover and active states', () => {
    render(<Button variant="secondary">Secondary</Button>)

    const button = screen.getByRole('button', { name: /secondary/i })
    expect(button).toHaveClass('hover:bg-brand/10')
    expect(button).toHaveClass('active:bg-brand/20')
  })

  it('ghost variant has correct hover and active states', () => {
    render(<Button variant="ghost">Ghost</Button>)

    const button = screen.getByRole('button', { name: /ghost/i })
    expect(button).toHaveClass('hover:bg-brand/10')
    expect(button).toHaveClass('active:bg-brand/20')
  })

  it('primary variant has white text', () => {
    render(<Button variant="primary">Primary</Button>)

    const button = screen.getByRole('button', { name: /primary/i })
    expect(button).toHaveClass('text-white')
  })

  it('destructive variant has white text', () => {
    render(<Button variant="destructive">Destructive</Button>)

    const button = screen.getByRole('button', { name: /destructive/i })
    expect(button).toHaveClass('text-white')
  })

  it('secondary variant has brand text color', () => {
    render(<Button variant="secondary">Secondary</Button>)

    const button = screen.getByRole('button', { name: /secondary/i })
    expect(button).toHaveClass('text-brand')
  })

  it('ghost variant has brand text color', () => {
    render(<Button variant="ghost">Ghost</Button>)

    const button = screen.getByRole('button', { name: /ghost/i })
    expect(button).toHaveClass('text-brand')
  })

  it('secondary variant has border', () => {
    render(<Button variant="secondary">Secondary</Button>)

    const button = screen.getByRole('button', { name: /secondary/i })
    expect(button).toHaveClass('border')
    expect(button).toHaveClass('border-brand')
  })

  it('ghost variant does not have border', () => {
    render(<Button variant="ghost">Ghost</Button>)

    const button = screen.getByRole('button', { name: /ghost/i })
    expect(button).not.toHaveClass('border')
  })

  it('loading spinner has aria-hidden attribute', () => {
    render(<Button loading={true}>Loading</Button>)

    const spinner = document.querySelector('svg')
    expect(spinner).toHaveAttribute('aria-hidden', 'true')
  })

  it('disabled button has disabled attribute', () => {
    render(<Button disabled={true}>Disabled</Button>)

    const button = screen.getByRole('button', { name: /disabled/i })
    expect(button).toBeDisabled()
  })

  it('loading button has disabled attribute', () => {
    render(<Button loading={true}>Loading</Button>)

    const button = screen.getByRole('button', { name: /loading/i })
    expect(button).toBeDisabled()
  })

  it('enabled button does not have disabled attribute', () => {
    render(<Button>Enabled</Button>)

    const button = screen.getByRole('button', { name: /enabled/i })
    expect(button).not.toBeDisabled()
  })

  it('renders with gap-2 for spacing between icon and text', () => {
    render(<Button>Button</Button>)

    const button = screen.getByRole('button', { name: /button/i })
    expect(button).toHaveClass('gap-2')
  })

  it('renders with inline-flex display', () => {
    render(<Button>Button</Button>)

    const button = screen.getByRole('button', { name: /button/i })
    expect(button).toHaveClass('inline-flex')
  })

  it('renders with items-center alignment', () => {
    render(<Button>Button</Button>)

    const button = screen.getByRole('button', { name: /button/i })
    expect(button).toHaveClass('items-center')
  })

  it('renders with justify-center alignment', () => {
    render(<Button>Button</Button>)

    const button = screen.getByRole('button', { name: /button/i })
    expect(button).toHaveClass('justify-center')
  })

  it('renders with font-medium weight', () => {
    render(<Button>Button</Button>)

    const button = screen.getByRole('button', { name: /button/i })
    expect(button).toHaveClass('font-medium')
  })

  it('renders with rounded-lg border radius', () => {
    render(<Button>Button</Button>)

    const button = screen.getByRole('button', { name: /button/i })
    expect(button).toHaveClass('rounded-lg')
  })

  it('renders with focus:outline-none', () => {
    render(<Button>Button</Button>)

    const button = screen.getByRole('button', { name: /button/i })
    expect(button).toHaveClass('focus:outline-none')
  })

  it('renders with focus:ring-brand for primary variant', () => {
    render(<Button variant="primary">Primary</Button>)

    const button = screen.getByRole('button', { name: /primary/i })
    expect(button).toHaveClass('focus:ring-brand')
  })

  it('renders with focus:ring-app-error for destructive variant', () => {
    render(<Button variant="destructive">Destructive</Button>)

    const button = screen.getByRole('button', { name: /destructive/i })
    expect(button).toHaveClass('focus:ring-app-error')
  })
})
