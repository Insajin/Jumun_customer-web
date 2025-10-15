'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Promotion {
  id: string
  name: string
  description: string | null
  type: string
  discount_value: number | null
}

export function PromotionBanner() {
  const [promotions, setPromotions] = useState<Promotion[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function fetchPromotions() {
      try {
        const { data, error } = await supabase
          .from('promotions')
          .select('id, name, description, type, discount_value')
          .eq('active', true)
          .gte('valid_to', new Date().toISOString())
          .lte('valid_from', new Date().toISOString())
          .limit(5)

        if (error) throw error
        setPromotions(data || [])
      } catch (error) {
        console.error('Error fetching promotions:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchPromotions()
  }, [supabase])

  if (loading) {
    return (
      <div className="w-full h-40 bg-gray-100 rounded-2xl animate-pulse"></div>
    )
  }

  if (promotions.length === 0) {
    return null
  }

  return (
    <div className="overflow-x-auto hide-scrollbar">
      <div className="flex gap-4 pb-2">
        {promotions.map((promo) => (
          <div
            key={promo.id}
            className="flex-shrink-0 w-80 h-40 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 p-6 text-white shadow-lg"
          >
            <div className="flex flex-col justify-between h-full">
              <div>
                <h3 className="text-xl font-bold mb-2">{promo.name}</h3>
                {promo.description && (
                  <p className="text-sm text-blue-100">{promo.description}</p>
                )}
              </div>
              {promo.discount_value && (
                <div className="text-3xl font-bold">
                  {promo.type === 'percentage_discount' ? `${promo.discount_value}%` : `₩${promo.discount_value.toLocaleString()}`} OFF
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
