/**
 * useAnalytics Hook
 * Provides analytics tracking for premium components
 */

import { useCallback, useRef } from 'react'
import type { PremiumComponentEvent } from '@/types/premium-components'

/**
 * Debounce function to limit high-frequency events
 */
function debounce<T extends (...args: any[]) => void>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null
      func(...args)
    }

    if (timeout) {
      clearTimeout(timeout)
    }
    timeout = setTimeout(later, wait)
  }
}

interface UseAnalyticsOptions {
  componentName: string
  debounceMs?: number
}

export function useAnalytics({ componentName, debounceMs = 300 }: UseAnalyticsOptions) {
  const eventCache = useRef<Set<string>>(new Set())

  /**
   * Track an analytics event
   */
  const trackEvent = useCallback(
    (
      action: PremiumComponentEvent['action'],
      metadata?: Record<string, any>
    ) => {
      // Create event object
      const event: PremiumComponentEvent = {
        component: componentName as PremiumComponentEvent['component'],
        action,
        label: metadata?.label,
        value: metadata?.value,
        metadata,
      }

      // Send to Google Analytics if available
      if (typeof window !== 'undefined' && (window as any).gtag) {
        ;(window as any).gtag('event', action, {
          event_category: 'premium_components',
          event_label: componentName,
          ...metadata,
        })
      }

      // Log to console in development
      if (process.env.NODE_ENV === 'development') {
        console.log('[Analytics]', event)
      }

      // You can also send to other analytics services here
      // Example: Mixpanel, Amplitude, etc.
    },
    [componentName]
  )

  /**
   * Track event with debouncing for high-frequency events
   */
  const trackEventDebounced = useCallback(
    debounce(
      (action: PremiumComponentEvent['action'], metadata?: Record<string, any>) => {
        trackEvent(action, metadata)
      },
      debounceMs
    ),
    [trackEvent, debounceMs]
  )

  /**
   * Track event only once (useful for view events)
   */
  const trackEventOnce = useCallback(
    (action: PremiumComponentEvent['action'], metadata?: Record<string, any>) => {
      const eventKey = `${componentName}-${action}-${metadata?.label || ''}`
      
      if (!eventCache.current.has(eventKey)) {
        eventCache.current.add(eventKey)
        trackEvent(action, metadata)
      }
    },
    [componentName, trackEvent]
  )

  /**
   * Track component view (enters viewport)
   */
  const trackView = useCallback(() => {
    trackEventOnce('view', { timestamp: Date.now() })
  }, [trackEventOnce])

  /**
   * Track component interaction
   */
  const trackInteraction = useCallback(
    (interactionType: string, metadata?: Record<string, any>) => {
      trackEvent('interact', {
        interaction_type: interactionType,
        ...metadata,
      })
    },
    [trackEvent]
  )

  /**
   * Track component error
   */
  const trackError = useCallback(
    (error: Error | string, metadata?: Record<string, any>) => {
      const errorMessage = typeof error === 'string' ? error : error.message
      
      trackEvent('error', {
        error_message: errorMessage,
        ...metadata,
      })

      // Also log to console
      console.error(`[${componentName}] Error:`, error)
    },
    [componentName, trackEvent]
  )

  /**
   * Track performance metric
   */
  const trackPerformance = useCallback(
    (metricName: string, value: number, metadata?: Record<string, any>) => {
      if (typeof window !== 'undefined' && (window as any).gtag) {
        ;(window as any).gtag('event', 'timing_complete', {
          name: metricName,
          value: Math.round(value),
          event_category: 'premium_components',
          event_label: componentName,
          ...metadata,
        })
      }

      if (process.env.NODE_ENV === 'development') {
        console.log(`[Performance] ${componentName} - ${metricName}:`, value, 'ms')
      }
    },
    [componentName]
  )

  return {
    trackEvent,
    trackEventDebounced,
    trackEventOnce,
    trackView,
    trackInteraction,
    trackError,
    trackPerformance,
  }
}
