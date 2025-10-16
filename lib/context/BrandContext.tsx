'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { createClient } from '../supabase/client'
import type { BrandConfig } from '../types'

// Default theme for development
const DEFAULT_BRAND: BrandConfig = {
  id: 'default',
  name: 'Jumun',
  slug: 'jumun',
  logo_url: null,
  primary_color: '#2563eb', // blue-600
  secondary_color: '#1e40af', // blue-700
  features: {
    loyalty_enabled: false,
    scheduled_pickup: true,
    multi_payment: true,
    guest_checkout: true,
  },
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
}

interface BrandContextValue {
  brand: BrandConfig
  loading: boolean
  error: string | null
}

const BrandContext = createContext<BrandContextValue | undefined>(undefined)

interface BrandProviderProps {
  children: ReactNode
  brandSlug: string
}

export function BrandProvider({ children, brandSlug }: BrandProviderProps) {
  const [brand, setBrand] = useState<BrandConfig>(DEFAULT_BRAND)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    async function loadBrandConfig() {
      try {
        setLoading(true)
        setError(null)

        // Fetch brand config from app_configs table using slug
        const { data, error: queryError } = await supabase
          .from('app_configs')
          .select(`
            *,
            brands!app_configs_brand_id_fkey(
              id,
              name,
              slug
            )
          `)
          .eq('brands.slug', brandSlug)
          .single()

        if (queryError || !data) {
          console.warn(`Brand config not found for slug: ${brandSlug}`)
          setError(`Brand not found: ${brandSlug}`)
          setBrand(DEFAULT_BRAND)
          setLoading(false)
          return
        }

        const brandData = data.brands as any

        // Build BrandConfig from app_configs + brands data
        const brandConfig: BrandConfig = {
          id: data.brand_id,
          name: data.app_name || brandData?.name || DEFAULT_BRAND.name,
          slug: brandData?.slug || brandSlug,
          logo_url: data.logo_url,
          primary_color: data.primary_color || DEFAULT_BRAND.primary_color,
          secondary_color: data.secondary_color || DEFAULT_BRAND.secondary_color,
          features: {
            loyalty_enabled: data.features?.loyalty_enabled ?? false,
            scheduled_pickup: data.features?.scheduled_pickup ?? true,
            multi_payment: data.features?.multi_payment ?? true,
            guest_checkout: data.features?.guest_checkout ?? true,
          },
          created_at: data.created_at,
          updated_at: data.updated_at,
        }

        setBrand(brandConfig)

        // Apply CSS variables for theming
        if (typeof window !== 'undefined') {
          const root = document.documentElement
          root.style.setProperty('--color-primary', brandConfig.primary_color)
          root.style.setProperty('--color-secondary', brandConfig.secondary_color)

          // Update meta theme-color for mobile browsers
          const metaThemeColor = document.querySelector('meta[name="theme-color"]')
          if (metaThemeColor) {
            metaThemeColor.setAttribute('content', brandConfig.primary_color)
          }
        }
      } catch (err) {
        console.error('Error loading brand config:', err)
        setError('Failed to load brand configuration')
        setBrand(DEFAULT_BRAND)
      } finally {
        setLoading(false)
      }
    }

    loadBrandConfig()
  }, [brandSlug, supabase])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">브랜드를 찾을 수 없습니다</h1>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <BrandContext.Provider value={{ brand, loading, error }}>
      {children}
    </BrandContext.Provider>
  )
}

export function useBrand() {
  const context = useContext(BrandContext)
  if (context === undefined) {
    throw new Error('useBrand must be used within a BrandProvider')
  }
  return context
}
