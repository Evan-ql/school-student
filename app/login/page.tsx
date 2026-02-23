'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { BookOpen, Mail, Lock, Eye, EyeOff, ArrowRight, Loader2 } from 'lucide-react'
import Link from 'next/link'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || '登录失败')
        return
      }

      router.push('/')
      router.refresh()
    } catch {
      setError('网络错误，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{
      background: 'linear-gradient(135deg, #e0f2fe 0%, #f0fdf4 30%, #faf5ff 60%, #fef3c7 100%)'
    }}>
      {/* 装饰光斑 */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-sky-200/40 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-teal-200/30 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-violet-200/20 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-sky-400 to-blue-500 shadow-lg shadow-sky-200/50 mb-4">
            <BookOpen className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">智能教学助手</h1>
          <p className="text-sm text-slate-500 mt-1">AI 驱动的教学管理平台</p>
        </div>

        {/* 登录卡片 */}
        <div className="backdrop-blur-xl bg-white/70 rounded-3xl shadow-lg shadow-black/5 border border-white/60 p-8">
          <h2 className="text-xl font-bold text-slate-800 mb-6">欢迎回来</h2>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-50/80 border border-red-200/50 text-sm text-red-600">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1.5">邮箱</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="请输入邮箱"
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/60 border border-slate-200/60 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-300/50 focus:border-sky-300 transition-all text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1.5">密码</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="请输入密码"
                  required
                  className="w-full pl-10 pr-11 py-3 rounded-xl bg-white/60 border border-slate-200/60 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-300/50 focus:border-sky-300 transition-all text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-sky-400 to-blue-500 text-white rounded-xl font-medium text-sm shadow-lg shadow-sky-200/50 hover:shadow-xl hover:shadow-sky-200/60 active:scale-[0.98] transition-all flex items-center justify-center disabled:opacity-60">
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>登录 <ArrowRight className="w-4 h-4 ml-1.5" /></>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <span className="text-sm text-slate-500">还没有账号？</span>
            <Link href="/register" className="text-sm text-sky-600 font-medium ml-1 hover:text-sky-700">
              立即注册
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
