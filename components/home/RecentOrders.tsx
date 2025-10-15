'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useAuthStore } from '@/lib/store/auth'
import type { Order } from '@/lib/types'

const STATUS_LABELS: Record<string, string> = {
  pending: '대기 중',
  waiting: '접수 대기',
  confirmed: '접수 완료',
  preparing: '준비 중',
  ready: '픽업 대기',
  completed: '완료',
  cancelled: '취소됨',
}

export function RecentOrders() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const { customer, isAuthenticated } = useAuthStore()
  const supabase = createClient()

  useEffect(() => {
    async function fetchOrders() {
      if (!isAuthenticated || !customer) {
        setLoading(false)
        return
      }

      try {
        const { data, error } = await supabase
          .from('orders')
          .select('*, store:stores(name)')
          .eq('customer_id', customer.id)
          .order('created_at', { ascending: false })
          .limit(2)

        if (error) throw error
        setOrders(data || [])
      } catch (error) {
        console.error('Error fetching recent orders:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, [customer, isAuthenticated, supabase])

  if (!isAuthenticated || loading) {
    return null
  }

  if (orders.length === 0) {
    return null
  }

  return (
    <div className="space-y-3">
      {orders.map((order) => (
        <Link
          key={order.id}
          href={`/orders/${order.id}`}
          className="block bg-white rounded-lg p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
        >
          <div className="flex justify-between items-start mb-2">
            <div>
              <h4 className="font-semibold">{order.store?.name || '매장'}</h4>
              <p className="text-xs text-gray-500 mt-1">
                {new Date(order.created_at).toLocaleDateString('ko-KR', {
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
            <span
              className={`px-3 py-1 rounded-full text-xs font-medium ${
                order.status === 'completed'
                  ? 'bg-gray-100 text-gray-700'
                  : order.status === 'cancelled'
                  ? 'bg-red-100 text-red-700'
                  : 'bg-blue-100 text-blue-700'
              }`}
            >
              {STATUS_LABELS[order.status] || order.status}
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
  )
}
