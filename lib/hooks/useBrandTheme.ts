import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '../supabase/client'
import type { BrandConfig } from '../types'

// Default theme for development
const DEFAULT_THEME: BrandConfig = {
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

export function useBrandTheme() {
  const searchParams = useSearchParams()
  const [theme, setTheme] = useState<BrandConfig>(DEFAULT_THEME)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function loadBrandTheme() {
      try {
        // Try to get brand_id from URL parameters or localStorage
        const brandIdFromUrl = searchParams.get('brand')
        const brandIdFromStorage = typeof window !== 'undefined'
          ? localStorage.getItem('jumun_brand_id')
          : null

        const brandId = brandIdFromUrl || brandIdFromStorage

        if (!brandId) {
          // No brand specified, use default
          setTheme(DEFAULT_THEME)
          setLoading(false)
          return
        }

        // Fetch brand config from Supabase
        const { data, error } = await supabase
          .from('app_configs')
          .select('*')
          .eq('brand_id', brandId)
          .single()

        if (error || !data) {
          console.warn('Brand config not found, using default theme')
          setTheme(DEFAULT_THEME)
        } else {
          // Store brand_id for future visits
          if (typeof window !== 'undefined') {
            localStorage.setItem('jumun_brand_id', brandId)
          }

          setTheme({
            id: data.brand_id,
            name: data.app_name || DEFAULT_THEME.name,
            slug: data.app_name?.toLowerCase().replace(/\s+/g, '-') || DEFAULT_THEME.slug,
            logo_url: data.logo_url,
            primary_color: data.primary_color || DEFAULT_THEME.primary_color,
            secondary_color: data.secondary_color || DEFAULT_THEME.secondary_color,
            features: {
              loyalty_enabled: data.features?.loyalty_enabled ?? false,
              scheduled_pickup: data.features?.scheduled_pickup ?? true,
              multi_payment: data.features?.multi_payment ?? true,
              guest_checkout: data.features?.guest_checkout ?? true,
            },
            created_at: data.created_at,
            updated_at: data.updated_at,
          })
        }
      } catch (error) {
        console.error('Error loading brand theme:', error)
        setTheme(DEFAULT_THEME)
      } finally {
        setLoading(false)
      }
    }

    loadBrandTheme()
  }, [searchParams, supabase])

  return { theme, loading }
}
