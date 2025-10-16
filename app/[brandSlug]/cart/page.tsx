'use client'

import Link from 'next/link'
import { useCartStore } from '@/lib/store/cart'
import { useRouter, useParams } from 'next/navigation'

export default function CartPage() {
  const router = useRouter()
  const params = useParams()
  const brandSlug = params.brandSlug as string
  const { items, updateQuantity, removeItem, clearCart, getSubtotal, getTax, getTotal } = useCartStore()

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-6xl mb-4">🛒</div>
          <h1 className="text-2xl font-bold mb-2">장바구니가 비어있습니다</h1>
          <p className="text-gray-600 mb-6">메뉴를 추가해주세요</p>
          <Link
            href={`/${brandSlug}/stores`}
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            매장 찾기
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold" data-testid="cart-title">
            장바구니
          </h1>
          <button
            onClick={() => clearCart()}
            className="text-red-600 text-sm hover:underline"
            data-testid="clear-cart-button"
          >
            전체 삭제
          </button>
        </div>

        {/* Cart Items */}
        <div className="space-y-4 mb-6">
          {items.map((item, index) => {
            const modifiersText = item.modifiers
              .map((m) => m.selectedOptions.map((o) => o.name).join(', '))
              .filter((t) => t)
              .join(' / ')

            const itemTotal =
              (item.menuItem.price +
                item.modifiers.reduce(
                  (sum, m) => sum + m.selectedOptions.reduce((s, o) => s + o.price, 0),
                  0
                )) *
              item.quantity

            return (
              <div
                key={`${item.menuItem.id}-${index}`}
                className="bg-white rounded-lg p-4 shadow"
                data-testid={`cart-item-${item.menuItem.id}`}
              >
                <div className="flex gap-4">
                  {item.menuItem.image_url && (
                    <img
                      src={item.menuItem.image_url}
                      alt={item.menuItem.name}
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                  )}
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1">{item.menuItem.name}</h3>
                    {modifiersText && (
                      <p className="text-sm text-gray-600 mb-2">{modifiersText}</p>
                    )}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => updateQuantity(item.menuItem.id, '', item.quantity - 1)}
                          className="w-8 h-8 flex items-center justify-center border rounded-full hover:bg-gray-100"
                          data-testid={`decrease-qty-${item.menuItem.id}`}
                        >
                          -
                        </button>
                        <span className="font-semibold" data-testid={`qty-${item.menuItem.id}`}>
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.menuItem.id, '', item.quantity + 1)}
                          className="w-8 h-8 flex items-center justify-center border rounded-full hover:bg-gray-100"
                          data-testid={`increase-qty-${item.menuItem.id}`}
                        >
                          +
                        </button>
                      </div>
                      <span className="font-bold text-blue-600">
                        ₩{itemTotal.toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => removeItem(item.menuItem.id)}
                    className="text-gray-400 hover:text-red-600"
                    data-testid={`remove-item-${item.menuItem.id}`}
                  >
                    ✕
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        {/* Price Summary */}
        <div className="bg-white rounded-lg p-6 shadow mb-6">
          <h2 className="font-semibold mb-4">주문 요약</h2>
          <div className="space-y-2 mb-4">
            <div className="flex justify-between text-gray-600">
              <span>소계</span>
              <span data-testid="subtotal">₩{getSubtotal().toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>세금 (10%)</span>
              <span data-testid="tax">₩{getTax().toLocaleString()}</span>
            </div>
            <div className="border-t pt-2 flex justify-between font-bold text-lg">
              <span>합계</span>
              <span className="text-blue-600" data-testid="total">
                ₩{getTotal().toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 shadow-lg">
          <div className="max-w-4xl mx-auto flex gap-4">
            <button
              onClick={() => router.back()}
              className="flex-1 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              data-testid="back-button"
            >
              계속 쇼핑
            </button>
            <button
              onClick={() => router.push(`/${brandSlug}/checkout`)}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              data-testid="checkout-button"
            >
              주문하기
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
