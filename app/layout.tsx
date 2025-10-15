import type { Metadata } from 'next'
import { Suspense } from 'react'
import { ThemeProvider } from '@/lib/context/ThemeContext'
import { InstallPrompt } from '@/components/InstallPrompt'
import './globals.css'

export const metadata: Metadata = {
  title: 'Jumun - QR 주문',
  description: 'QR 코드로 간편하게 주문하세요',
  manifest: '/api/manifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Jumun',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <head>
        <meta name="theme-color" content="#2563eb" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
      </head>
      <body>
        <Suspense fallback={
          <div className="min-h-screen flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        }>
          <ThemeProvider>
            {children}
            <InstallPrompt />
          </ThemeProvider>
        </Suspense>
      </body>
    </html>
  )
}
