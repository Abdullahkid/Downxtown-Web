/**
 * PremiumComponentErrorBoundary
 * Error boundary for premium components with fallback UI
 */

import React, { Component, ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  componentName?: string
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
}

interface State {
  hasError: boolean
  error: Error | null
}

export class PremiumComponentErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
    }
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    const { componentName, onError } = this.props

    // Log error to console
    console.error(
      `[PremiumComponentErrorBoundary] ${componentName || 'Component'} error:`,
      error,
      errorInfo
    )

    // Send to analytics if available
    if (typeof window !== 'undefined' && (window as any).gtag) {
      ;(window as any).gtag('event', 'exception', {
        description: `${componentName || 'Premium Component'}: ${error.message}`,
        fatal: false,
      })
    }

    // Call custom error handler if provided
    if (onError) {
      onError(error, errorInfo)
    }
  }

  render() {
    if (this.state.hasError) {
      // Render custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback
      }

      // Default fallback UI
      return (
        <div className="flex items-center justify-center w-full h-full min-h-[200px] p-8">
          <div className="text-center">
            <div className="text-white/50 text-sm">
              {this.props.componentName || 'Component'} temporarily unavailable
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

/**
 * Fallback components for specific premium components
 */

export function GlobeFallback() {
  return (
    <div className="flex items-center justify-center w-full h-full min-h-[400px]">
      <div className="relative w-[300px] h-[300px] md:w-[400px] md:h-[400px] lg:w-[500px] lg:h-[500px]">
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-brand-cyan/20 to-brand-teal/20 border border-brand-cyan/30" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-brand-cyan text-lg font-semibold mb-2">🌍</div>
            <div className="text-white/70 text-sm">Global Presence</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function WaveFallback() {
  return (
    <div className="absolute inset-0 bg-gradient-to-b from-black via-brand-dark-gray to-black">
      <div className="absolute inset-0 bg-gradient-to-br from-brand-cyan/5 to-brand-teal/5" />
    </div>
  )
}

export function SlidingCardsFallback({ cards }: { cards?: any[] }) {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
      {cards?.slice(0, 6).map((card, index) => (
        <div
          key={index}
          className="bg-white/[0.02] border border-white/10 rounded-2xl p-8 hover:bg-white/[0.04] hover:border-brand-cyan/30 transition-all duration-300"
        >
          <div className="w-14 h-14 rounded-full bg-brand-cyan/10 flex items-center justify-center mb-6">
            {card.icon}
          </div>
          <h3 className="text-xl font-semibold text-white mb-3">{card.title}</h3>
          <p className="text-white/70 leading-relaxed mb-4">{card.description}</p>
          <div className="text-sm font-medium text-brand-cyan flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-brand-cyan rounded-full" />
            {card.metric}
          </div>
        </div>
      ))}
    </div>
  )
}

export function HamburgerMenuFallback() {
  return (
    <div className="fixed inset-0 bg-black/95 backdrop-blur-xl z-50 flex items-center justify-center">
      <div className="text-white/50 text-sm">Menu temporarily unavailable</div>
    </div>
  )
}

