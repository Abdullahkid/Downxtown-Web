'use client'

import React, { forwardRef, useCallback } from 'react'
import Link, { type LinkProps } from 'next/link'
import { useRouter } from 'next/navigation'
import { useNavigationFeedback } from '@/components/providers/NavigationFeedbackProvider'

type AnchorProps = Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, keyof LinkProps>

export interface InstantLinkProps extends LinkProps, AnchorProps {
  instantFeedback?: boolean
}

function hrefToString(href: LinkProps['href']): string | null {
  if (typeof href === 'string') return href
  if ('pathname' in href && typeof href.pathname === 'string') {
    const params = new URLSearchParams()
    if (href.query) {
      Object.entries(href.query).forEach(([key, value]) => {
        if (value === undefined) return
        if (Array.isArray(value)) {
          value.forEach((item) => params.append(key, String(item)))
          return
        }
        params.append(key, String(value))
      })
    }
    const search = params.size > 0 ? `?${params.toString()}` : ''
    return `${href.pathname}${search}`
  }
  return null
}

export const InstantLink = forwardRef<HTMLAnchorElement, InstantLinkProps>(
  function InstantLink(
    {
      href,
      onClick,
      onMouseEnter,
      onTouchStart,
      onFocus,
      instantFeedback = true,
      prefetch = true,
      ...props
    },
    ref,
  ) {
    const router = useRouter()
    const { beginNavigation } = useNavigationFeedback()
    const hrefString = hrefToString(href)

    const prefetchTarget = useCallback(() => {
      if (!hrefString) return
      void router.prefetch(hrefString)
    }, [hrefString, router])

    const handleClick = useCallback(
      (event: React.MouseEvent<HTMLAnchorElement>) => {
        onClick?.(event)
        if (event.defaultPrevented) return
        if (event.button !== 0) return
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
        if (!instantFeedback || !hrefString?.startsWith('/')) return
        beginNavigation(hrefString)
      },
      [beginNavigation, hrefString, instantFeedback, onClick],
    )

    const handleMouseEnter = useCallback(
      (event: React.MouseEvent<HTMLAnchorElement>) => {
        onMouseEnter?.(event)
        prefetchTarget()
      },
      [onMouseEnter, prefetchTarget],
    )

    const handleTouchStart = useCallback(
      (event: React.TouchEvent<HTMLAnchorElement>) => {
        onTouchStart?.(event)
        prefetchTarget()
      },
      [onTouchStart, prefetchTarget],
    )

    const handleFocus = useCallback(
      (event: React.FocusEvent<HTMLAnchorElement>) => {
        onFocus?.(event)
        prefetchTarget()
      },
      [onFocus, prefetchTarget],
    )

    return (
      <Link
        ref={ref}
        href={href}
        prefetch={prefetch}
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onTouchStart={handleTouchStart}
        onFocus={handleFocus}
        {...props}
      />
    )
  },
)
