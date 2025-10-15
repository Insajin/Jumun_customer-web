'use client'

import { useState, useEffect } from 'react'
import { usePWA } from '@/lib/hooks/usePWA'

export function InstallPrompt() {
  const { isInstalled, isIOS, canInstall, promptInstall } = usePWA()
  const [showPrompt, setShowPrompt] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    // Check if user previously dismissed
    const wasDismissed = localStorage.getItem('pwa-install-dismissed')
    if (wasDismissed) {
      setDismissed(true)
      return
    }

    // Show prompt after 3 seconds if installable and not installed
    const timer = setTimeout(() => {
      if ((canInstall || isIOS) && !isInstalled) {
        setShowPrompt(true)
      }
    }, 3000)

    return () => clearTimeout(timer)
  }, [canInstall, isIOS, isInstalled])

  const handleInstall = async () => {
    const installed = await promptInstall()
    if (installed) {
      setShowPrompt(false)
    }
  }

  const handleDismiss = () => {
    setShowPrompt(false)
    setDismissed(true)
    localStorage.setItem('pwa-install-dismissed', 'true')
  }

  if (!showPrompt || dismissed || isInstalled) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg p-4 z-50 animate-slide-up">
      <div className="max-w-4xl mx-auto flex items-center gap-4">
        <div className="flex-shrink-0 text-3xl">📱</div>
        <div className="flex-1">
          <h3 className="font-semibold text-sm">앱으로 설치하기</h3>
          <p className="text-xs text-gray-600">
            {isIOS
              ? '공유 버튼을 눌러 "홈 화면에 추가"를 선택하세요'
              : '홈 화면에 추가하여 더 빠르게 주문하세요'}
          </p>
        </div>
        {!isIOS && (
          <button
            onClick={handleInstall}
            className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
            data-testid="install-button"
          >
            설치
          </button>
        )}
        <button
          onClick={handleDismiss}
          className="text-gray-400 hover:text-gray-600"
          data-testid="dismiss-install"
        >
          ✕
        </button>
      </div>
    </div>
  )
}
