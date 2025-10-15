'use client'

import { createContext, useContext, useEffect, ReactNode } from 'react'
import { useBrandTheme } from '../hooks/useBrandTheme'
import type { BrandConfig } from '../types'

interface ThemeContextValue {
  theme: BrandConfig
  loading: boolean
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { theme, loading } = useBrandTheme()

  // Apply CSS variables when theme changes
  useEffect(() => {
    if (typeof window === 'undefined') return

    const root = document.documentElement
    root.style.setProperty('--color-primary', theme.primary_color)
    root.style.setProperty('--color-secondary', theme.secondary_color)

    // Also update meta theme-color for mobile browsers
    const metaThemeColor = document.querySelector('meta[name="theme-color"]')
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', theme.primary_color)
    }
  }, [theme])

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

  return (
    <ThemeContext.Provider value={{ theme, loading }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
