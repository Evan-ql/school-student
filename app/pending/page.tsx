'use client'

import { useRouter } from 'next/navigation'
import { Clock, LogOut, RefreshCw } from 'lucide-react'

export default function PendingPage() {
  const router = useRouter()

  const handleLogout = async () => {
    await fetch('/api/auth/me', { method: 'DELETE' })
    router.push('/login')
  }

  const handleRefresh = () => {
    window.location.reload()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 text-center">
        <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Clock className="w-10 h-10 text-amber-600" />
        </div>

        <h1 className="text-2xl font-bold text-gray-800 mb-3">等待审核中</h1>

        <p className="text-gray-600 mb-2">
          您的注册申请已提交成功！
        </p>
        <p className="text-gray-500 text-sm mb-8">
          管理员正在审核您的账户，审核通过后即可正常使用系统。请耐心等待。
        </p>

        <div className="space-y-3">
          <button
            onClick={handleRefresh}
            className="w-full flex items-center justify-center gap-2 py-3 bg-amber-600 text-white rounded-xl font-medium hover:bg-amber-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            刷新状态
          </button>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-3 border border-gray-300 text-gray-600 rounded-xl font-medium hover:bg-gray-50 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            退出登录
          </button>
        </div>
      </div>
    </div>
  )
}
