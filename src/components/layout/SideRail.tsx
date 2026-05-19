﻿'use client'

/**
 * SideRail — vertical navigation rail for desktop (≥ 1024px).
 * - lg (1024–1279px): icons only, labels are sr-only
 * - xl+ (≥ 1280px): icons + visible labels
 * Requirements: 2.3, 2.4, 2.9, 2.10, 2.11
 */

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, MessageCircle, ShoppingBag, Info } from 'lucide-react'
import { useUiStore } from '@/store/uiStore'

interface NavTab {
  href: string
  label: string
  icon: React.ElementType
}

const TABS: NavTab[] = [
  { href: '/',        label: 'Home',    icon: Home },
  { href: '/chat',    label: 'Chat',    icon: MessageCircle },
  { href: '/orders',  label: 'Orders',  icon: ShoppingBag },
]

export function SideRail() {
  const pathname = usePathname()
  const unreadChatCount = useUiStore((s) => s.unreadChatCount)

  return (
    <nav
      role="navigation"
      aria-label="Main navigation"
      className={[
        // Hidden on mobile, flex column on lg+
        'hidden lg:flex',
        'fixed left-0 top-0 z-40 h-full flex-col',
        // Tablet: narrow icon-only rail; Desktop: wider with labels
        'w-16 xl:w-56',
        'border-r border-border bg-bg-2',
        // Push content below the AppBar (56px mobile / 64px desktop)
        'pt-14 md:pt-16',
      ].join(' ')}
    >
      <ul className="flex flex-col gap-1 px-2 py-3" role="list">
        {TABS.map(({ href, label, icon: Icon }) => {
          const isActive =
            href === '/' ? pathname === '/' : pathname.startsWith(href)
          const isChat = href === '/chat'

          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={isActive ? 'page' : undefined}
                aria-label={isChat && unreadChatCount > 0
                  ? `${label}, ${unreadChatCount > 9 ? '9+' : unreadChatCount} unread`
                  : label}
                className={[
                  'group relative flex items-center gap-3 rounded-xl px-3 py-2.5',
                  'min-h-[44px] border-l-2 border-transparent transition-colors',
                  isActive
                    ? 'bg-brand-accent/5 text-brand-accent border-l-brand-accent'
                    : 'text-text-2 hover:bg-white/5 hover:text-text-1',
                ].join(' ')}
              >
                {/* Icon + badge */}
                <span className="relative shrink-0">
                  <Icon
                    size={22}
                    strokeWidth={isActive ? 2.5 : 1.75}
                    aria-hidden="true"
                  />
                  {isChat && unreadChatCount > 0 && (
                    <span
                      aria-hidden="true"
                      className={[
                        'absolute -right-1.5 -top-1.5 flex items-center justify-center',
                        'rounded-full bg-brand-accent text-black',
                        unreadChatCount > 9
                          ? 'h-4 min-w-[1rem] px-0.5 text-[9px]'
                          : 'h-3.5 w-3.5 text-[9px]',
                      ].join(' ')}
                    >
                      {unreadChatCount > 9 ? '9+' : unreadChatCount}
                    </span>
                  )}
                </span>

                {/* Label: sr-only on tablet, visible on desktop */}
                <span
                  className={[
                    'text-sm font-medium',
                    'sr-only xl:not-sr-only xl:block',
                  ].join(' ')}
                >
                  {label}
                </span>
              </Link>
            </li>
          )
        })}
      </ul>

      {/* ── Bottom: About Downxtown ── */}
      <div className="mt-auto px-2 py-3 border-t border-border">
        <Link
          href="/welcome"
          aria-label="About Downxtown"
          className={[
            'group flex items-center gap-3 rounded-xl px-3 py-2.5',
            'min-h-[44px] border-l-2 border-transparent transition-colors',
            pathname === '/welcome'
              ? 'bg-brand-accent/5 text-brand-accent border-l-brand-accent'
              : 'text-text-2 hover:bg-white/5 hover:text-text-1',
          ].join(' ')}
        >
          <Info
            size={22}
            strokeWidth={pathname === '/welcome' ? 2.5 : 1.75}
            aria-hidden="true"
            className="shrink-0"
          />
          <span className="text-sm font-medium sr-only xl:not-sr-only xl:block">
            About Downxtown
          </span>
        </Link>
      </div>
    </nav>
  )
}
