import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/client'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const brandId = searchParams.get('brand')

  // Default manifest
  const defaultManifest = {
    name: 'Jumun',
    short_name: 'Jumun',
    description: 'QR 코드로 간편하게 주문하세요',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#2563eb',
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  }

  // If no brand specified, return default
  if (!brandId) {
    return NextResponse.json(defaultManifest)
  }

  try {
    const supabase = createClient()

    // Fetch brand configuration
    const { data: config, error } = await supabase
      .from('app_configs')
      .select('*')
      .eq('brand_id', brandId)
      .single()

    if (error || !config) {
      return NextResponse.json(defaultManifest)
    }

    // Generate brand-specific manifest
    const brandManifest = {
      name: config.app_name || defaultManifest.name,
      short_name: config.app_name?.substring(0, 12) || defaultManifest.short_name,
      description: config.description || defaultManifest.description,
      start_url: `/?brand=${brandId}`,
      display: 'standalone',
      background_color: '#ffffff',
      theme_color: config.primary_color || defaultManifest.theme_color,
      icons: config.logo_url
        ? [
            {
              src: config.logo_url,
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any maskable',
            },
            {
              src: config.logo_url,
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any maskable',
            },
          ]
        : defaultManifest.icons,
      categories: ['food', 'shopping'],
      orientation: 'portrait',
      scope: '/',
      lang: 'ko',
    }

    return NextResponse.json(brandManifest, {
      headers: {
        'Content-Type': 'application/manifest+json',
        'Cache-Control': 'public, max-age=3600',
      },
    })
  } catch (error) {
    console.error('Error generating manifest:', error)
    return NextResponse.json(defaultManifest)
  }
}
