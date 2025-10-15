'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { StarIcon } from '@heroicons/react/24/solid'
import { useAuthStore } from '@/lib/store/auth'
import { LoginModal } from '@/components/LoginModal'

interface LoyaltyTransaction {
  id: string
  points_earned: number
  points_spent: number
  balance: number
  created_at: string
  order_id: string | null
}

interface StampCard {
  id: string
  stamps_earned: number
  stamps_used: number
  current_stamps: number
}

export default function LoyaltyPage() {
  const [transactions, setTransactions] = useState<LoyaltyTransaction[]>([])
  const [stampCard, setStampCard] = useState<StampCard | null>(null)
  const [loading, setLoading] = useState(true)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const { customer, isAuthenticated } = useAuthStore()
  const supabase = createClient()

  useEffect(() => {
    async function fetchLoyalty() {
      if (!customer) {
        setLoading(false)
        return
      }

      try {
        // Fetch loyalty transactions
        const { data: transData, error: transError } = await supabase
          .from('loyalty_transactions')
          .select('*')
          .eq('customer_id', customer.id)
          .order('created_at', { ascending: false })
          .limit(50)

        if (transError) throw transError
        setTransactions(transData || [])

        // Fetch stamp card (assuming we're showing stamps for the first brand they interact with)
        // In a real app, you might want to show stamps per brand
        const { data: stampData, error: stampError } = await supabase
          .from('stamp_cards')
          .select('*')
          .eq('customer_id', customer.id)
          .limit(1)
          .maybeSingle()

        if (stampError && stampError.code !== 'PGRST116') throw stampError
        setStampCard(stampData)
      } catch (error) {
        console.error('Error fetching loyalty data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchLoyalty()
  }, [customer, supabase])

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
            <StarIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">로그인이 필요합니다</h2>
            <p className="text-gray-600 mb-6">
              포인트와 스탬프를 확인하려면 로그인해주세요
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

  const totalPoints = customer?.loyalty_points || 0
  const stampsForReward = 10 // TODO: Get from brand config

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Points Balance Card */}
        <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-6 text-white mb-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium opacity-90">내 포인트</h2>
            <StarIcon className="w-8 h-8 opacity-80" />
          </div>
          <div className="text-4xl font-bold mb-2">{totalPoints.toLocaleString()}</div>
          <p className="text-sm opacity-80">포인트</p>
        </div>

        {/* Stamp Card */}
        <div className="bg-white rounded-lg p-6 mb-6 shadow">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">스탬프 카드</h3>
            {stampCard && (
              <span className="text-sm text-blue-600 font-medium">
                {stampCard.current_stamps}/{stampsForReward}
              </span>
            )}
          </div>
          <div className="grid grid-cols-5 gap-3">
            {Array.from({ length: stampsForReward }).map((_, i) => {
              const isEarned = stampCard && i < stampCard.current_stamps
              return (
                <div
                  key={i}
                  className={`aspect-square rounded-lg border-2 flex items-center justify-center transition-all ${
                    isEarned
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-dashed border-gray-300'
                  }`}
                >
                  <StarIcon
                    className={`w-6 h-6 ${
                      isEarned ? 'text-blue-600' : 'text-gray-300'
                    }`}
                  />
                </div>
              )
            })}
          </div>
          <p className="text-xs text-gray-500 text-center mt-3">
            {stampsForReward}개 모으면 무료 쿠폰을 받을 수 있어요!
          </p>
        </div>

        {/* Transaction History */}
        <h2 className="text-xl font-bold mb-4">포인트 내역</h2>

        {transactions.length === 0 ? (
          <div className="bg-white rounded-lg p-12 text-center">
            <p className="text-gray-500">포인트 내역이 없습니다</p>
          </div>
        ) : (
          <div className="space-y-3">
            {transactions.map((transaction) => (
              <div
                key={transaction.id}
                className="bg-white rounded-lg p-4 shadow-sm"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">
                      {transaction.points_earned > 0
                        ? '포인트 적립'
                        : '포인트 사용'}
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(transaction.created_at).toLocaleDateString(
                        'ko-KR',
                        {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        }
                      )}
                    </p>
                  </div>
                  <div className="text-right">
                    <p
                      className={`text-lg font-bold ${
                        transaction.points_earned > 0
                          ? 'text-blue-600'
                          : 'text-red-600'
                      }`}
                    >
                      {transaction.points_earned > 0 ? '+' : '-'}
                      {(
                        transaction.points_earned || transaction.points_spent
                      ).toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500">
                      잔액: {transaction.balance.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
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
