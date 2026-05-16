'use client'

/**
 * SideRail — vertical navigation rail for tablet (768–1279px) and desktop (≥ 1280px).
 * - Tablet (md → xl): icons only, labels are sr-only
 * - Desktop (xl+): icons + visible labels
 * Requirements: 1.1, 1.3, 1.5, 23.4, 23.5, 23.8, 24.3, 24.4
 */

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Search, MessageCircle, ShoppingBag, User } from 'lucide-react'
import { useUiStore } from '@/store/uiStore'

interface NavTab {
  href: string
  label: string
  icon: React.ElementType
}

const TABS: NavTab[] = [
  { href: '/',        label: 'Home',    icon: Home },
  { href: '/search',  label: 'Search',  icon: Search },
  { href: '/chat',    label: 'Chat',    icon: MessageCircle },
  { href: '/orders',  label: 'Orders',  icon: ShoppingBag },
  { href: '/profile', label: 'Profile', icon: User },
]

export function SideRail() {
  const pathname = usePathname()
  const unreadChatCount = useUiStore((s) => s.unreadChatCount)

  return (
    <nav
      role="navigation"
      aria-label="Main navigation"
      className={[
        // Hidden on mobile, flex column on md+
        'hidden md:flex',
        'fixed left-0 top-0 z-40 h-full flex-col',
        // Tablet: narrow icon-only rail; Desktop: wider with labels
        'w-16 xl:w-56',
        'border-r border-gray-200 bg-white',
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
                  'min-h-[44px] transition-colors',
                  isActive
                    ? 'bg-[color-mix(in_srgb,var(--brand-color,#6366f1)_12%,transparent)] text-[var(--brand-color,#6366f1)]'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
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
                        'rounded-full bg-red-500 text-white',
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
    </nav>
  )
}
