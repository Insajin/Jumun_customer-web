'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import type { Order } from '@/lib/types'

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function fetchOrders() {
      try {
        // TODO: Filter by customer_id once auth is implemented
        const { data, error } = await supabase
          .from('orders')
          .select('*, store:stores(name, address)')
          .order('created_at', { ascending: false })
          .limit(20)

        if (error) throw error
        setOrders(data || [])
      } catch (error) {
        console.error('Error fetching orders:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, [supabase])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-6">주문내역</h1>

        {orders.length === 0 ? (
          <div className="bg-white rounded-lg p-12 text-center">
            <p className="text-gray-500 mb-4">주문 내역이 없습니다</p>
            <Link
              href="/stores"
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              메뉴 보러 가기
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <Link
                key={order.id}
                href={`/orders/${order.id}`}
                className="block bg-white rounded-lg p-4 shadow hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-semibold">{order.store?.name}</h3>
                    <p className="text-sm text-gray-500">
                      {new Date(order.created_at).toLocaleDateString('ko-KR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      order.status === 'completed'
                        ? 'bg-gray-100 text-gray-800'
                        : order.status === 'cancelled'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {order.status === 'pending' && '대기 중'}
                    {order.status === 'waiting' && '접수 대기'}
                    {order.status === 'confirmed' && '접수 완료'}
                    {order.status === 'preparing' && '준비 중'}
                    {order.status === 'ready' && '픽업 대기'}
                    {order.status === 'completed' && '완료'}
                    {order.status === 'cancelled' && '취소됨'}
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-blue-600">
                    ₩{order.total.toLocaleString()}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
