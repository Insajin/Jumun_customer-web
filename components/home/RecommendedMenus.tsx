'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import type { MenuItem } from '@/lib/types'

export function RecommendedMenus() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function fetchMenuItems() {
      try {
        const { data, error } = await supabase
          .from('menu_items')
          .select('*')
          .eq('available', true)
          .limit(6)

        if (error) throw error
        setMenuItems(data || [])
      } catch (error) {
        console.error('Error fetching menu items:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchMenuItems()
  }, [supabase])

  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-48 bg-gray-100 rounded-xl animate-pulse"></div>
        ))}
      </div>
    )
  }

  if (menuItems.length === 0) {
    return null
  }

  return (
    <div className="grid grid-cols-2 gap-4">
      {menuItems.map((item) => (
        <div
          key={item.id}
          className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 hover:shadow-md transition-shadow"
        >
          {item.image_url && (
            <div className="aspect-square w-full bg-gray-100">
              <img
                src={item.image_url}
                alt={item.name}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <div className="p-3">
            <h4 className="font-semibold text-sm mb-1 truncate">{item.name}</h4>
            <p className="text-blue-600 font-bold text-lg">
              ₩{item.price.toLocaleString()}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}
