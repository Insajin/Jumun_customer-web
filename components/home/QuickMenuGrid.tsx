'use client'

import Link from 'next/link'
import {
  MagnifyingGlassIcon,
  ClipboardDocumentListIcon,
  TicketIcon,
  StarIcon,
} from '@heroicons/react/24/outline'

interface QuickMenu {
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  color: string
}

const quickMenus: QuickMenu[] = [
  {
    name: '주문하기',
    href: '/stores',
    icon: MagnifyingGlassIcon,
    color: 'bg-blue-50 text-blue-600',
  },
  {
    name: '주문내역',
    href: '/orders',
    icon: ClipboardDocumentListIcon,
    color: 'bg-green-50 text-green-600',
  },
  {
    name: '쿠폰',
    href: '/coupons',
    icon: TicketIcon,
    color: 'bg-orange-50 text-orange-600',
  },
  {
    name: '포인트',
    href: '/loyalty',
    icon: StarIcon,
    color: 'bg-purple-50 text-purple-600',
  },
]

export function QuickMenuGrid() {
  return (
    <div className="grid grid-cols-4 gap-4">
      {quickMenus.map((menu) => {
        const Icon = menu.icon
        return (
          <Link
            key={menu.name}
            href={menu.href}
            className="flex flex-col items-center gap-2"
          >
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${menu.color} transition-transform hover:scale-105`}>
              <Icon className="w-7 h-7" />
            </div>
            <span className="text-xs font-medium text-gray-700">{menu.name}</span>
          </Link>
        )
      })}
    </div>
  )
}
