'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  HomeIcon,
  ClipboardDocumentListIcon,
  TicketIcon,
  StarIcon,
  UserIcon
} from '@heroicons/react/24/outline'
import {
  HomeIcon as HomeIconSolid,
  ClipboardDocumentListIcon as ClipboardIconSolid,
  TicketIcon as TicketIconSolid,
  StarIcon as StarIconSolid,
  UserIcon as UserIconSolid,
} from '@heroicons/react/24/solid'

interface Tab {
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  iconActive: React.ComponentType<{ className?: string }>
}

const tabs: Tab[] = [
  {
    name: '홈',
    href: '/',
    icon: HomeIcon,
    iconActive: HomeIconSolid,
  },
  {
    name: '주문내역',
    href: '/orders',
    icon: ClipboardDocumentListIcon,
    iconActive: ClipboardIconSolid,
  },
  {
    name: '쿠폰',
    href: '/coupons',
    icon: TicketIcon,
    iconActive: TicketIconSolid,
  },
  {
    name: '포인트',
    href: '/loyalty',
    icon: StarIcon,
    iconActive: StarIconSolid,
  },
  {
    name: '마이',
    href: '/profile',
    icon: UserIcon,
    iconActive: UserIconSolid,
  },
]

export function BottomTabBar() {
  const pathname = usePathname()

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/'
    }
    if (href === '/stores') {
      return pathname === '/stores' || pathname.startsWith('/stores/')
    }
    return pathname.startsWith(href)
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 safe-area-bottom z-50">
      <div className="max-w-2xl mx-auto px-4">
        <div className="flex justify-around items-center h-16">
          {tabs.map((tab) => {
            const active = isActive(tab.href)
            const Icon = active ? tab.iconActive : tab.icon

            return (
              <Link
                key={tab.name}
                href={tab.href}
                className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
                  active ? 'text-blue-600' : 'text-gray-500'
                }`}
              >
                <Icon className="w-6 h-6 mb-1" />
                <span className="text-xs font-medium">{tab.name}</span>
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
