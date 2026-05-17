/**
 * useIntersectionObserver Hook
 * Detects when an element enters the viewport for lazy loading
 */

import { useEffect, useRef, useState } from 'react'

interface UseIntersectionObserverOptions {
  threshold?: number | number[]
  root?: Element | null
  rootMargin?: string
  freezeOnceVisible?: boolean
}

export function useIntersectionObserver<T extends Element = HTMLDivElement>(
  options: UseIntersectionObserverOptions = {}
): [React.RefObject<T | null>, boolean] {
  const {
    threshold = 0.1,
    root = null,
    rootMargin = '0px',
    freezeOnceVisible = false,
  } = options

  const elementRef = useRef<T>(null)
  const [isIntersecting, setIsIntersecting] = useState(false)

  useEffect(() => {
    const element = elementRef.current
    
    // Don't observe if element doesn't exist or if already visible and frozen
    if (!element || (freezeOnceVisible && isIntersecting)) {
      return
    }

    // Create intersection observer
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting)
        
        // If freezeOnceVisible is true and element is visible, disconnect
        if (freezeOnceVisible && entry.isIntersecting) {
          observer.disconnect()
        }
      },
      {
        threshold,
        root,
        rootMargin,
      }
    )

    // Start observing
    observer.observe(element)

    // Cleanup
    return () => {
      observer.disconnect()
    }
  }, [threshold, root, rootMargin, freezeOnceVisible, isIntersecting])

  return [elementRef, isIntersecting]
}
