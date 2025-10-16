import { Suspense } from 'react'
import { BrandProvider } from '@/lib/context/BrandContext'
import { BottomNav } from '@/components/layout/BottomNav'

interface BrandLayoutProps {
  children: React.ReactNode
  params: { brandSlug: string }
}

export default function BrandLayout({ children, params }: BrandLayoutProps) {
  return (
    <BrandProvider brandSlug={params.brandSlug}>
      <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      }>
        <div className="pb-16">
          {children}
        </div>
        <BottomNav brandSlug={params.brandSlug} />
      </Suspense>
    </BrandProvider>
  )
}
