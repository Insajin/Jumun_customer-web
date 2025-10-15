import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CartItem, MenuItem, MenuModifier, ModifierOption } from '../types'

interface CartState {
  items: CartItem[]
  storeId: string | null

  // Actions
  addItem: (item: MenuItem, modifiers: CartItem['modifiers']) => void
  removeItem: (itemId: string) => void
  updateQuantity: (itemId: string, modifiersKey: string, quantity: number) => void
  clearCart: () => void
  setStoreId: (storeId: string) => void

  // Computed
  getTotalItems: () => number
  getSubtotal: () => number
  getTax: () => number
  getTotal: () => number
}

// Generate unique key for cart item (item + modifiers combination)
function generateCartItemKey(
  itemId: string,
  modifiers: CartItem['modifiers']
): string {
  const modifierKeys = modifiers
    .map((m) => `${m.modifier.id}:${m.selectedOptions.map((o) => o.id).join(',')}`)
    .join('|')
  return `${itemId}__${modifierKeys}`
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      storeId: null,

      addItem: (item, modifiers) => {
        const state = get()

        // Check if adding item from different store
        if (state.storeId && state.storeId !== item.store_id) {
          throw new Error('Cannot add items from different stores')
        }

        const key = generateCartItemKey(item.id, modifiers)
        const existingItemIndex = state.items.findIndex(
          (cartItem) => generateCartItemKey(cartItem.menuItem.id, cartItem.modifiers) === key
        )

        if (existingItemIndex >= 0) {
          // Item with same modifiers exists, increase quantity
          const updatedItems = [...state.items]
          updatedItems[existingItemIndex] = {
            ...updatedItems[existingItemIndex],
            quantity: updatedItems[existingItemIndex].quantity + 1,
          }
          set({ items: updatedItems })
        } else {
          // New item
          set({
            items: [...state.items, { menuItem: item, quantity: 1, modifiers }],
            storeId: item.store_id,
          })
        }
      },

      removeItem: (itemId) => {
        set((state) => ({
          items: state.items.filter((item) => item.menuItem.id !== itemId),
          storeId: state.items.length === 1 ? null : state.storeId,
        }))
      },

      updateQuantity: (itemId, modifiersKey, quantity) => {
        if (quantity <= 0) {
          get().removeItem(itemId)
          return
        }

        set((state) => ({
          items: state.items.map((item) => {
            const key = generateCartItemKey(item.menuItem.id, item.modifiers)
            if (key === `${itemId}__${modifiersKey}`) {
              return { ...item, quantity }
            }
            return item
          }),
        }))
      },

      clearCart: () => {
        set({ items: [], storeId: null })
      },

      setStoreId: (storeId) => {
        set({ storeId })
      },

      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0)
      },

      getSubtotal: () => {
        const { items } = get()
        return items.reduce((total, item) => {
          const basePrice = item.menuItem.price
          const modifiersPrice = item.modifiers.reduce((modTotal, mod) => {
            return (
              modTotal +
              mod.selectedOptions.reduce((optTotal, opt) => optTotal + opt.price, 0)
            )
          }, 0)
          return total + (basePrice + modifiersPrice) * item.quantity
        }, 0)
      },

      getTax: () => {
        const subtotal = get().getSubtotal()
        return Math.round(subtotal * 0.1) // 10% tax
      },

      getTotal: () => {
        return get().getSubtotal() + get().getTax()
      },
    }),
    {
      name: 'jumun-cart-storage',
    }
  )
)
