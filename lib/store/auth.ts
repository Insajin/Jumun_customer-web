import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { createClient } from '../supabase/client'

interface Customer {
  id: string
  phone: string
  loyalty_points: number
  created_at: string
}

interface AuthState {
  customer: Customer | null
  isAuthenticated: boolean

  // Actions
  login: (phone: string) => Promise<void>
  logout: () => void
  refreshCustomer: () => Promise<void>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      customer: null,
      isAuthenticated: false,

      login: async (phone: string) => {
        const supabase = createClient()

        // 전화번호 형식 검증
        const cleanPhone = phone.replace(/[^0-9]/g, '')
        if (cleanPhone.length < 10 || cleanPhone.length > 11) {
          throw new Error('올바른 전화번호를 입력해주세요')
        }

        // 기존 customer 조회
        const { data: existingCustomer, error: selectError } = await supabase
          .from('customers')
          .select('*')
          .eq('phone', cleanPhone)
          .maybeSingle()

        if (selectError) {
          throw new Error('고객 정보 조회 중 오류가 발생했습니다')
        }

        let customer: Customer

        if (existingCustomer) {
          // 기존 고객
          customer = existingCustomer
        } else {
          // 새 고객 생성
          // user_id는 임시로 UUID 생성 (실제로는 auth.users와 연동 필요)
          const { data: newCustomer, error: insertError } = await supabase
            .from('customers')
            .insert({
              phone: cleanPhone,
              loyalty_points: 0,
              preferences: {},
            })
            .select()
            .single()

          if (insertError || !newCustomer) {
            throw new Error('고객 생성 중 오류가 발생했습니다')
          }

          customer = newCustomer
        }

        set({
          customer,
          isAuthenticated: true,
        })
      },

      logout: () => {
        set({
          customer: null,
          isAuthenticated: false,
        })
      },

      refreshCustomer: async () => {
        const state = get()
        if (!state.customer) return

        const supabase = createClient()
        const { data, error } = await supabase
          .from('customers')
          .select('*')
          .eq('id', state.customer.id)
          .single()

        if (error) {
          console.error('Failed to refresh customer:', error)
          return
        }

        set({ customer: data })
      },
    }),
    {
      name: 'jumun-auth-storage',
    }
  )
)
