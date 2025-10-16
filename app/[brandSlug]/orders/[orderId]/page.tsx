'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import type { Order } from '@/lib/types'

const STATUS_LABELS: Record<string, string> = {
  pending: '대기 중',
  waiting: '접수 대기',
  confirmed: '접수 완료',
  preparing: '준비 중',
  ready: '픽업 대기',
  completed: '완료',
  cancelled: '취소됨',
  payment_issue: '결제 문제',
}

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  waiting: 'bg-orange-100 text-orange-800',
  confirmed: 'bg-blue-100 text-blue-800',
  preparing: 'bg-purple-100 text-purple-800',
  ready: 'bg-green-100 text-green-800',
  completed: 'bg-gray-100 text-gray-800',
  cancelled: 'bg-red-100 text-red-800',
  payment_issue: 'bg-red-200 text-red-900',
}

export default function OrderTrackingPage() {
  const params = useParams()
  const orderId = params.orderId as string
  const brandSlug = params.brandSlug as string
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function fetchOrder() {
      try {
        const { data, error } = await supabase
          .from('orders')
          .select('*, store:stores(*)')
          .eq('id', orderId)
          .single()

        if (error) throw error

        // Fetch menu item details for each item in the order
        if (data && data.items && data.items.length > 0) {
          const menuItemIds = data.items.map((item: any) => item.menu_item_id)
          const { data: menuItems, error: menuError } = await supabase
            .from('menu_items')
            .select('id, name')
            .in('id', menuItemIds)

          if (!menuError && menuItems) {
            // Merge menu item names into order items
            const menuItemMap = new Map(menuItems.map((mi) => [mi.id, mi]))
            data.items = data.items.map((item: any) => ({
              ...item,
              menu_item: menuItemMap.get(item.menu_item_id),
            }))
          }
        }

        setOrder(data)
      } catch (error) {
        console.error('Error fetching order:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchOrder()

    // Subscribe to realtime updates
    const channel = supabase
      .channel(`order-${orderId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `id=eq.${orderId}`,
        },
        (payload) => {
          setOrder((prev) => (prev ? { ...prev, ...payload.new } : null))
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [orderId, supabase])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">주문 정보를 불러오는 중...</p>
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">주문을 찾을 수 없습니다</h1>
          <Link href={`/${brandSlug}/stores`} className="text-blue-600 hover:underline">
            매장 목록으로 돌아가기
          </Link>
        </div>
      </div>
    )
  }

  const statusSteps = ['pending', 'confirmed', 'preparing', 'ready', 'completed']
  const currentStepIndex = statusSteps.indexOf(order.status)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="bg-white rounded-lg p-6 shadow mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold" data-testid="order-tracking-title">
              주문 #{order.id.slice(0, 8)}
            </h1>
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${STATUS_COLORS[order.status]}`}
              data-testid="order-status"
            >
              {STATUS_LABELS[order.status]}
            </span>
          </div>

          {order.store && (
            <div className="text-sm text-gray-600">
              <p className="font-medium">{order.store.name}</p>
              <p>{order.store.address}</p>
            </div>
          )}
        </div>

        {/* Status Timeline */}
        <div className="bg-white rounded-lg p-6 shadow mb-6">
          <h2 className="font-semibold mb-6">주문 진행 상황</h2>
          <div className="relative">
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>
            <div className="space-y-8">
              {statusSteps.slice(0, -1).map((status, index) => {
                const isActive = index <= currentStepIndex
                const isCurrent = index === currentStepIndex
                return (
                  <div key={status} className="relative flex items-start">
                    <div
                      className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center ${
                        isActive ? 'bg-blue-600' : 'bg-gray-300'
                      }`}
                    >
                      {isActive && (
                        <svg
                          className="w-5 h-5 text-white"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </div>
                    <div className="ml-4">
                      <p
                        className={`font-medium ${isCurrent ? 'text-blue-600' : isActive ? 'text-gray-900' : 'text-gray-400'}`}
                      >
                        {STATUS_LABELS[status]}
                      </p>
                      {isCurrent && (
                        <p className="text-sm text-gray-600 mt-1">진행 중입니다...</p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Order Items */}
        <div className="bg-white rounded-lg p-6 shadow mb-6">
          <h2 className="font-semibold mb-4">주문 내역</h2>
          <div className="space-y-3">
            {order.items.map((item: any, index: number) => (
              <div key={index} className="flex justify-between text-sm">
                <span className="text-gray-600">
                  {item.menu_item?.name || '메뉴'} x {item.quantity}
                </span>
                <span>₩{(item.unit_price * item.quantity).toLocaleString()}</span>
              </div>
            ))}
            <div className="border-t pt-3 flex justify-between font-bold">
              <span>총 금액</span>
              <span className="text-blue-600" data-testid="order-total">
                ₩{order.total.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Customer Info */}
        <div className="bg-white rounded-lg p-6 shadow mb-6">
          <h2 className="font-semibold mb-4">고객 정보</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">이름</span>
              <span>{order.customer_name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">전화번호</span>
              <span>{order.customer_phone}</span>
            </div>
            {order.pickup_time && (
              <div className="flex justify-between">
                <span className="text-gray-600">픽업 예정 시간</span>
                <span>{new Date(order.pickup_time).toLocaleTimeString('ko-KR')}</span>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <Link
            href={`/${brandSlug}/stores`}
            className="flex-1 px-6 py-3 text-center border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            매장 목록
          </Link>
          <Link
            href={`/${brandSlug}`}
            className="flex-1 px-6 py-3 text-center bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            홈으로
          </Link>
        </div>
      </div>
    </div>
  )
}
