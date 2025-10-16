'use client'

import { useState } from 'react'
import {
  UserCircleIcon,
  PhoneIcon,
  BellIcon,
  QuestionMarkCircleIcon,
  ShieldCheckIcon,
  ArrowRightOnRectangleIcon,
  StarIcon,
} from '@heroicons/react/24/outline'
import { useAuthStore } from '@/lib/store/auth'
import { LoginModal } from '@/components/LoginModal'

export default function ProfilePage() {
  const [showLoginModal, setShowLoginModal] = useState(false)
  const { customer, isAuthenticated, logout } = useAuthStore()

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Profile Header */}
        <div className="bg-white rounded-lg p-6 mb-6 shadow">
          {isAuthenticated && customer ? (
            <>
              <div className="flex items-center mb-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                  <UserCircleIcon className="w-10 h-10 text-blue-600" />
                </div>
                <div className="ml-4 flex-1">
                  <h2 className="text-xl font-bold">고객님</h2>
                  <p className="text-sm text-gray-500">
                    {customer.phone.replace(
                      /^(\d{3})(\d{4})(\d{4})$/,
                      '$1-$2-$3'
                    )}
                  </p>
                </div>
              </div>
              {/* Points Card */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <StarIcon className="w-6 h-6 text-blue-600 mr-2" />
                    <span className="text-sm text-gray-600">보유 포인트</span>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-blue-600">
                      {customer.loyalty_points.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500">포인트</p>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-4">
              <UserCircleIcon className="w-16 h-16 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500 mb-4">
                로그인하고 혜택을 받아보세요
              </p>
              <button
                onClick={() => setShowLoginModal(true)}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                전화번호로 로그인
              </button>
            </div>
          )}
        </div>

        {/* Menu Items */}
        <div className="bg-white rounded-lg shadow divide-y">
          <button className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
            <div className="flex items-center">
              <PhoneIcon className="w-6 h-6 text-gray-600 mr-3" />
              <span className="font-medium">전화번호 변경</span>
            </div>
            <span className="text-gray-400">›</span>
          </button>

          <button className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
            <div className="flex items-center">
              <BellIcon className="w-6 h-6 text-gray-600 mr-3" />
              <span className="font-medium">알림 설정</span>
            </div>
            <span className="text-gray-400">›</span>
          </button>

          <button className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
            <div className="flex items-center">
              <QuestionMarkCircleIcon className="w-6 h-6 text-gray-600 mr-3" />
              <span className="font-medium">고객센터</span>
            </div>
            <span className="text-gray-400">›</span>
          </button>

          <button className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
            <div className="flex items-center">
              <ShieldCheckIcon className="w-6 h-6 text-gray-600 mr-3" />
              <span className="font-medium">이용약관 및 정책</span>
            </div>
            <span className="text-gray-400">›</span>
          </button>
        </div>

        {/* App Info */}
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>버전 1.0.0</p>
        </div>

        {/* Logout Button */}
        {isAuthenticated && (
          <div className="mt-6">
            <button
              onClick={logout}
              className="w-full flex items-center justify-center p-4 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <ArrowRightOnRectangleIcon className="w-5 h-5 mr-2" />
              로그아웃
            </button>
          </div>
        )}
      </div>

      {/* Login Modal */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />
    </div>
  )
}
