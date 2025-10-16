'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useCartStore } from '@/lib/store/cart'
import { useAuthStore } from '@/lib/store/auth'
import { createClient } from '@/lib/supabase/client'
import { StarIcon } from '@heroicons/react/24/solid'

export default function CheckoutPage() {
  const router = useRouter()
  const params = useParams()
  const brandSlug = params.brandSlug as string
  const { items, storeId, getTotal, clearCart } = useCartStore()
  const { customer, isAuthenticated, refreshCustomer } = useAuthStore()
  const supabase = createClient()

  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [pickupTime, setPickupTime] = useState('20')
  const [loading, setLoading] = useState(false)
  const [pointsToUse, setPointsToUse] = useState(0)
  const [pointsConfig, setPointsConfig] = useState<{
    enabled: boolean
    pointsToCurrencyRatio: number
  } | null>(null)

  // Fetch loyalty config
  useEffect(() => {
    async function fetchConfig() {
      if (!storeId) return

      const { data: store } = await supabase
        .from('stores')
        .select('brand_id')
        .eq('id', storeId)
        .single()

      if (!store) return

      const { data: config } = await supabase
        .from('app_configs')
        .select('feature_toggles')
        .eq('brand_id', store.brand_id)
        .single()

      if (config?.feature_toggles?.loyalty) {
        setPointsConfig({
          enabled: config.feature_toggles.loyalty.enabled,
          pointsToCurrencyRatio: config.feature_toggles.loyalty.points_to_currency_ratio || 100,
        })
      }
    }

    fetchConfig()
  }, [storeId, supabase])

  if (items.length === 0) {
    router.push(`/${brandSlug}/cart`)
    return null
  }

  const availablePoints = customer?.loyalty_points || 0
  const maxPointsToUse = pointsConfig
    ? Math.floor((getTotal() * pointsConfig.pointsToCurrencyRatio) / 100)
    : 0
  const pointsDiscount = pointsConfig
    ? Math.floor((pointsToUse * 100) / pointsConfig.pointsToCurrencyRatio)
    : 0
  const finalTotal = Math.max(0, getTotal() - pointsDiscount)

  const handleUseAllPoints = () => {
    const maxUsable = Math.min(availablePoints, maxPointsToUse)
    setPointsToUse(maxUsable)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Fetch store to get brand_id
      const { data: store } = await supabase
        .from('stores')
        .select('brand_id')
        .eq('id', storeId)
        .single()

      if (!store) {
        throw new Error('Store not found')
      }

      // Calculate totals
      const subtotal = items.reduce((total, item) => {
        const basePrice = item.menuItem.price
        const modifiersPrice = item.modifiers.reduce(
          (sum, m) => sum + m.selectedOptions.reduce((s, o) => s + o.price, 0),
          0
        )
        return total + (basePrice + modifiersPrice) * item.quantity
      }, 0)

      const tax = Math.round(subtotal * 0.1)
      const totalBeforePoints = subtotal + tax
      const total = Math.max(0, totalBeforePoints - pointsDiscount)

      // Prepare order items
      const orderItems = items.map((item) => ({
        menu_item_id: item.menuItem.id,
        quantity: item.quantity,
        unit_price: item.menuItem.price,
        modifiers: item.modifiers.map((m) => ({
          modifier_id: m.modifier.id,
          selected_options: m.selectedOptions.map((o) => o.id),
        })),
        notes: null,
      }))

      // Create order
      const orderData: any = {
        brand_id: store.brand_id,
        store_id: storeId,
        customer_name: customerName,
        customer_phone: customerPhone,
        items: orderItems,
        subtotal,
        tax,
        total,
        status: 'pending',
        payment_status: 'pending',
        pickup_window_start: new Date(Date.now() + parseInt(pickupTime) * 60000).toISOString(),
        pickup_window_end: new Date(Date.now() + (parseInt(pickupTime) + 10) * 60000).toISOString(),
      }

      // Skip customer_id for guest checkout (will be added when auth is properly implemented)
      // if (customer) {
      //   orderData.customer_id = customer.id
      // }

      const { data: order, error } = await supabase
        .from('orders')
        .insert(orderData)
        .select()
        .single()

      if (error) throw error

      // Deduct points if used
      if (customer && pointsToUse > 0) {
        const currentBalance = customer.loyalty_points

        // Insert points spending transaction
        const { error: loyaltyError } = await supabase
          .from('loyalty_transactions')
          .insert({
            customer_id: customer.id,
            order_id: order.id,
            points_earned: 0,
            points_spent: pointsToUse,
            balance: currentBalance - pointsToUse,
          })

        if (loyaltyError) throw loyaltyError

        // Update customer's loyalty_points
        const { error: updateError } = await supabase
          .from('customers')
          .update({ loyalty_points: currentBalance - pointsToUse })
          .eq('id', customer.id)

        if (updateError) throw updateError

        // Refresh customer data to show updated points
        await refreshCustomer()
      }

      // Clear cart and redirect to order tracking
      clearCart()
      router.push(`/${brandSlug}/orders/${order.id}`)
    } catch (error) {
      console.error('Error creating order:', error)
      alert('주문 생성에 실패했습니다. 다시 시도해주세요.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="max-w-2xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-6" data-testid="checkout-title">
          주문 정보 입력
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Customer Info */}
          <div className="bg-white rounded-lg p-6 shadow">
            <h2 className="font-semibold mb-4">고객 정보</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">이름 *</label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  required
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  placeholder="홍길동"
                  data-testid="customer-name-input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">전화번호 *</label>
                <input
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  required
                  pattern="[0-9]{10,11}"
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  placeholder="01012345678"
                  data-testid="customer-phone-input"
                />
              </div>
            </div>
          </div>

          {/* Pickup Time */}
          <div className="bg-white rounded-lg p-6 shadow">
            <h2 className="font-semibold mb-4">픽업 시간</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {['20', '30', '40', '60'].map((time) => (
                <button
                  key={time}
                  type="button"
                  onClick={() => setPickupTime(time)}
                  className={`px-4 py-3 border rounded-lg transition-colors ${
                    pickupTime === time
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white hover:bg-gray-50'
                  }`}
                  data-testid={`pickup-time-${time}`}
                >
                  {time}분 후
                </button>
              ))}
            </div>
          </div>

          {/* Points Redemption */}
          {isAuthenticated && pointsConfig?.enabled && availablePoints > 0 && (
            <div className="bg-white rounded-lg p-6 shadow">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold flex items-center gap-2">
                  <StarIcon className="w-5 h-5 text-blue-600" />
                  포인트 사용
                </h2>
                <div className="text-sm text-gray-600">
                  보유: <span className="font-semibold text-blue-600">{availablePoints.toLocaleString()}P</span>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    사용할 포인트 (최대: {Math.min(availablePoints, maxPointsToUse).toLocaleString()}P)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={pointsToUse}
                      onChange={(e) => {
                        const value = parseInt(e.target.value) || 0
                        const maxUsable = Math.min(availablePoints, maxPointsToUse)
                        setPointsToUse(Math.min(Math.max(0, value), maxUsable))
                      }}
                      min={0}
                      max={Math.min(availablePoints, maxPointsToUse)}
                      className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                      placeholder="0"
                    />
                    <button
                      type="button"
                      onClick={handleUseAllPoints}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors whitespace-nowrap"
                    >
                      전액 사용
                    </button>
                  </div>
                  {pointsConfig && (
                    <p className="text-xs text-gray-500 mt-2">
                      {pointsConfig.pointsToCurrencyRatio}P = ₩1 (
                      {pointsToUse > 0 ? `${pointsDiscount.toLocaleString()}원 할인` : '할인 없음'})
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Order Summary */}
          <div className="bg-white rounded-lg p-6 shadow">
            <h2 className="font-semibold mb-4">주문 요약</h2>
            <div className="space-y-2 mb-4">
              {items.map((item, index) => (
                <div key={index} className="flex justify-between text-sm">
                  <span className="text-gray-600">
                    {item.menuItem.name} x {item.quantity}
                  </span>
                  <span>
                    ₩
                    {(
                      (item.menuItem.price +
                        item.modifiers.reduce(
                          (sum, m) => sum + m.selectedOptions.reduce((s, o) => s + o.price, 0),
                          0
                        )) *
                      item.quantity
                    ).toLocaleString()}
                  </span>
                </div>
              ))}
              {pointsToUse > 0 && (
                <div className="flex justify-between text-sm text-blue-600">
                  <span>포인트 사용</span>
                  <span>-₩{pointsDiscount.toLocaleString()}</span>
                </div>
              )}
              <div className="border-t pt-2 flex justify-between font-bold text-lg">
                <span>총 결제 금액</span>
                <span className="text-blue-600" data-testid="checkout-total">
                  ₩{finalTotal.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 shadow-lg">
            <div className="max-w-2xl mx-auto flex gap-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="flex-1 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={loading}
              >
                이전
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                data-testid="submit-order-button"
              >
                {loading ? '주문 중...' : `₩${finalTotal.toLocaleString()} 결제하기`}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
