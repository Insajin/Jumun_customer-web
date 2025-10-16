'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useBrand } from '@/lib/context/BrandContext'
import type { Store } from '@/lib/types'

interface StoresPageProps {
  params: { brandSlug: string }
}

export default function StoresPage({ params }: StoresPageProps) {
  const [stores, setStores] = useState<Store[]>([])
  const [loading, setLoading] = useState(true)
  const { brand } = useBrand()
  const supabase = createClient()

  useEffect(() => {
    async function fetchStores() {
      try {
        const { data, error } = await supabase
          .from('stores')
          .select('*')
          .eq('brand_id', brand.id)
          .eq('status', 'active')
          .order('name')

        if (error) throw error
        setStores(data || [])
      } catch (error) {
        console.error('Error fetching stores:', error)
      } finally {
        setLoading(false)
      }
    }

    if (brand.id) {
      fetchStores()
    }
  }, [supabase, brand.id])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">매장 정보를 불러오는 중...</p>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-2" data-testid="page-title">매장 찾기</h1>
        <p className="text-gray-600 mb-8">주문할 매장을 선택하세요</p>

        {stores.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">운영 중인 매장이 없습니다.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {stores.map((store) => (
              <Link
                key={store.id}
                href={`/${params.brandSlug}/stores/${store.id}/menu`}
                data-testid={`store-card-${store.id}`}
                className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6 border border-gray-200"
              >
                <h2 className="text-xl font-semibold mb-2">{store.name}</h2>
                <p className="text-gray-600 text-sm mb-4">{store.address}</p>
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    영업중
                  </span>
                  <span className="text-blue-600 text-sm font-medium">메뉴 보기 →</span>
                </div>
              </Link>
            ))}
          </div>
        )}

        <div className="mt-8 text-center">
          <Link href={`/${params.brandSlug}`} className="text-blue-600 hover:underline">
            ← 홈으로 돌아가기
          </Link>
        </div>
      </div>
    </main>
  )
}
