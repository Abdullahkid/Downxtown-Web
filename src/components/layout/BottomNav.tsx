'use client'

/**
 * BottomNav — mobile-only bottom navigation bar (< 768px).
 * Requirements: 1.1, 1.3, 1.5, 23.4, 23.5, 23.8, 24.1, 24.2
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

export function BottomNav() {
  const pathname = usePathname()
  const unreadChatCount = useUiStore((s) => s.unreadChatCount)

  return (
    <nav
      role="navigation"
      aria-label="Main navigation"
      className="fixed bottom-0 left-0 right-0 z-50 flex h-16 items-stretch border-t border-gray-200 bg-white md:hidden"
    >
      {TABS.map(({ href, label, icon: Icon }) => {
        const isActive =
          href === '/' ? pathname === '/' : pathname.startsWith(href)
        const isChat = href === '/chat'

        return (
          <Link
            key={href}
            href={href}
            aria-current={isActive ? 'page' : undefined}
            aria-label={isChat && unreadChatCount > 0
              ? `${label}, ${unreadChatCount > 9 ? '9+' : unreadChatCount} unread`
              : label}
            className={[
              'relative flex flex-1 flex-col items-center justify-center gap-0.5',
              'min-h-[44px] min-w-[44px]',
              'text-xs font-medium transition-colors',
              isActive
                ? 'text-[var(--brand-color,#6366f1)]'
                : 'text-gray-500 hover:text-gray-800',
            ].join(' ')}
          >
            {/* Icon with optional unread badge */}
            <span className="relative">
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

            {/* Label */}
            <span>{label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
