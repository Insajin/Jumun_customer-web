'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuthStore } from '@/lib/store/auth'
import { LoginModal } from '@/components/LoginModal'
import { TicketIcon } from '@heroicons/react/24/outline'

interface Coupon {
  id: string
  code: string
  type: 'percentage' | 'fixed_amount' | 'free_item'
  value: number
  min_order_value: number | null
  expires_at: string
  used_at: string | null
}

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [loading, setLoading] = useState(true)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const { customer, isAuthenticated } = useAuthStore()
  const supabase = createClient()

  useEffect(() => {
    async function fetchCoupons() {
      if (!customer) {
        setLoading(false)
        return
      }

      try {
        const { data, error } = await supabase
          .from('coupons')
          .select('*')
          .eq('customer_id', customer.id)
          .order('created_at', { ascending: false })

        if (error) throw error
        setCoupons(data || [])
      } catch (error) {
        console.error('Error fetching coupons:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchCoupons()
  }, [customer, supabase])

  const isExpired = (expiresAt: string) => new Date(expiresAt) < new Date()
  const isUsed = (usedAt: string | null) => usedAt !== null

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-2xl mx-auto px-4 py-6">
          <div className="bg-white rounded-lg p-12 text-center">
            <TicketIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">로그인이 필요합니다</h2>
            <p className="text-gray-600 mb-6">
              쿠폰을 확인하려면 로그인해주세요
            </p>
            <button
              onClick={() => setShowLoginModal(true)}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              전화번호로 로그인
            </button>
          </div>
        </div>
        <LoginModal
          isOpen={showLoginModal}
          onClose={() => setShowLoginModal(false)}
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-6">내 쿠폰함</h1>

        {coupons.length === 0 ? (
          <div className="bg-white rounded-lg p-12 text-center">
            <p className="text-gray-500">사용 가능한 쿠폰이 없습니다</p>
          </div>
        ) : (
          <div className="space-y-4">
            {coupons.map((coupon) => {
              const expired = isExpired(coupon.expires_at)
              const used = isUsed(coupon.used_at)
              const disabled = expired || used

              return (
                <div
                  key={coupon.id}
                  className={`bg-white rounded-lg p-4 shadow ${
                    disabled ? 'opacity-50' : ''
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-1">
                        {coupon.type === 'percentage' && `${coupon.value}% 할인`}
                        {coupon.type === 'fixed_amount' &&
                          `₩${coupon.value.toLocaleString()} 할인`}
                        {coupon.type === 'free_item' && '무료 메뉴'}
                      </h3>
                      <p className="text-sm text-gray-500 mb-2">
                        {coupon.min_order_value
                          ? `₩${coupon.min_order_value.toLocaleString()} 이상 구매 시`
                          : '최소 주문 금액 없음'}
                      </p>
                      <p className="text-xs text-gray-400">
                        {used
                          ? `사용 완료: ${new Date(
                              coupon.used_at!
                            ).toLocaleDateString()}`
                          : expired
                          ? `만료됨: ${new Date(
                              coupon.expires_at
                            ).toLocaleDateString()}`
                          : `${new Date(
                              coupon.expires_at
                            ).toLocaleDateString()} 까지`}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded">
                        {coupon.code}
                      </span>
                      {!disabled && (
                        <div className="mt-2">
                          <span className="text-xs text-blue-600 font-medium">
                            사용 가능
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />
    </div>
  )
}
