'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { HomeIcon, MapPinIcon, ClockIcon, UserIcon } from '@heroicons/react/24/outline'
import {
  HomeIcon as HomeIconSolid,
  MapPinIcon as MapPinIconSolid,
  ClockIcon as ClockIconSolid,
  UserIcon as UserIconSolid,
} from '@heroicons/react/24/solid'

interface BottomNavProps {
  brandSlug: string
}

export function BottomNav({ brandSlug }: BottomNavProps) {
  const pathname = usePathname()

  const navItems = [
    {
      label: '홈',
      href: `/${brandSlug}`,
      icon: HomeIcon,
      activeIcon: HomeIconSolid,
      isActive: pathname === `/${brandSlug}`,
    },
    {
      label: '매장',
      href: `/${brandSlug}/stores`,
      icon: MapPinIcon,
      activeIcon: MapPinIconSolid,
      isActive: pathname?.includes('/stores'),
    },
    {
      label: '주문내역',
      href: `/${brandSlug}/orders`,
      icon: ClockIcon,
      activeIcon: ClockIconSolid,
      isActive: pathname?.includes('/orders'),
    },
    {
      label: '마이페이지',
      href: `/${brandSlug}/profile`,
      icon: UserIcon,
      activeIcon: UserIconSolid,
      isActive: pathname?.includes('/profile'),
    },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
      <div className="max-w-2xl mx-auto px-2">
        <div className="grid grid-cols-4 gap-1">
          {navItems.map((item) => {
            const Icon = item.isActive ? item.activeIcon : item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center py-3 px-2 transition-colors ${
                  item.isActive
                    ? 'text-blue-600'
                    : 'text-gray-600 hover:text-blue-600'
                }`}
              >
                <Icon className="w-6 h-6 mb-1" />
                <span className="text-xs font-medium">{item.label}</span>
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
