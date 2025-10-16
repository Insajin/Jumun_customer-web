'use client'

import { BellIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import { useBrand } from '@/lib/context/BrandContext'
import { useAuthStore } from '@/lib/store/auth'
import { PromotionBanner } from '@/components/home/PromotionBanner'
import { QuickMenuGrid } from '@/components/home/QuickMenuGrid'
import { RecommendedMenus } from '@/components/home/RecommendedMenus'
import { RecentOrders } from '@/components/home/RecentOrders'

interface HomePageProps {
  params: { brandSlug: string }
}

export default function HomePage({ params }: HomePageProps) {
  const { brand } = useBrand()
  const { isAuthenticated } = useAuthStore()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold">{brand.name}</h1>
              <p className="text-xs text-gray-500">간편한 모바일 주문</p>
            </div>
            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <BellIcon className="w-6 h-6 text-gray-700" />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-8">
        {/* Promotion Banner */}
        <section>
          <PromotionBanner />
        </section>

        {/* Quick Menu Grid */}
        <section>
          <QuickMenuGrid brandSlug={params.brandSlug} />
        </section>

        {/* Recent Orders (if logged in) */}
        {isAuthenticated && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">최근 주문</h2>
              <Link
                href={`/${params.brandSlug}/orders`}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                전체 보기 →
              </Link>
            </div>
            <RecentOrders />
          </section>
        )}

        {/* Recommended Menus */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold">추천 메뉴</h2>
            <Link
              href={`/${params.brandSlug}/stores`}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              더보기 →
            </Link>
          </div>
          <RecommendedMenus />
        </section>

        {/* Welcome Message for Non-logged in Users */}
        {!isAuthenticated && (
          <section className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 text-center">
            <h3 className="text-lg font-bold mb-2">로그인하고 더 많은 혜택을!</h3>
            <p className="text-sm text-gray-600 mb-4">
              포인트 적립, 쿠폰, 주문 내역 확인 등
            </p>
            <Link
              href={`/${params.brandSlug}/profile`}
              className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              로그인하기
            </Link>
          </section>
        )}
      </div>
    </div>
  )
}
