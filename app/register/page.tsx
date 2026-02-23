'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { BookOpen, Mail, Lock, Eye, EyeOff, User, GraduationCap, ArrowRight, Loader2, Building2, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'

const SUBJECTS = ['语文', '数学', '英语', '科学', '道德与法治', '音乐', '美术', '体育', '信息技术', '其他']

export default function RegisterPage() {
  const router = useRouter()
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '', subject: '', school: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (form.password !== form.confirmPassword) {
      setError('两次输入的密码不一致')
      return
    }

    if (form.password.length < 6) {
      setError('密码至少6位')
      return
    }

    if (!form.subject) {
      setError('请选择所教学科')
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password,
          subject: form.subject,
          school: form.school,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || '注册失败')
        return
      }

      // 注册成功，显示提示
      setSuccess(true)
    } catch {
      setError('网络错误，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  // 注册成功提示页面
  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{
        background: 'linear-gradient(135deg, #e0f2fe 0%, #f0fdf4 30%, #faf5ff 60%, #fef3c7 100%)'
      }}>
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-teal-200/40 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-sky-200/30 rounded-full blur-3xl" />
        </div>
        <div className="w-full max-w-md relative z-10">
          <div className="backdrop-blur-xl bg-white/70 rounded-3xl shadow-lg shadow-black/5 border border-white/60 p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">注册成功！</h2>
            <p className="text-sm text-slate-600 mb-6">
              您的账户已创建成功，请等待管理员审核。<br />
              审核通过后即可登录使用系统。
            </p>
            <Link
              href="/login"
              className="inline-flex items-center justify-center w-full py-3 bg-gradient-to-r from-teal-400 to-emerald-500 text-white rounded-xl font-medium text-sm shadow-lg shadow-teal-200/50 hover:shadow-xl transition-all"
            >
              返回登录页
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{
      background: 'linear-gradient(135deg, #e0f2fe 0%, #f0fdf4 30%, #faf5ff 60%, #fef3c7 100%)'
    }}>
      {/* 装饰光斑 */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-teal-200/40 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-sky-200/30 rounded-full blur-3xl" />
        <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-amber-200/20 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-400 to-emerald-500 shadow-lg shadow-teal-200/50 mb-4">
            <BookOpen className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">智能教学助手</h1>
          <p className="text-sm text-slate-500 mt-1">创建您的教师账号</p>
        </div>

        {/* 注册卡片 */}
        <div className="backdrop-blur-xl bg-white/70 rounded-3xl shadow-lg shadow-black/5 border border-white/60 p-8">
          <h2 className="text-xl font-bold text-slate-800 mb-6">教师注册</h2>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-50/80 border border-red-200/50 text-sm text-red-600">
              {error}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1.5">姓名</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="请输入您的姓名"
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/60 border border-slate-200/60 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-300/50 focus:border-teal-300 transition-all text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1.5">邮箱</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  placeholder="请输入邮箱"
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/60 border border-slate-200/60 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-300/50 focus:border-teal-300 transition-all text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1.5">所教学科</label>
              <div className="relative">
                <GraduationCap className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <select
                  value={form.subject}
                  onChange={e => setForm({ ...form, subject: e.target.value })}
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/60 border border-slate-200/60 text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-300/50 focus:border-teal-300 transition-all text-sm appearance-none">
                  <option value="">请选择学科</option>
                  {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1.5">学校 <span className="text-slate-400 font-normal">(选填)</span></label>
              <div className="relative">
                <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={form.school}
                  onChange={e => setForm({ ...form, school: e.target.value })}
                  placeholder="请输入您所在的学校"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/60 border border-slate-200/60 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-300/50 focus:border-teal-300 transition-all text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1.5">密码</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  placeholder="至少6位密码"
                  required
                  className="w-full pl-10 pr-11 py-3 rounded-xl bg-white/60 border border-slate-200/60 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-300/50 focus:border-teal-300 transition-all text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1.5">确认密码</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={form.confirmPassword}
                  onChange={e => setForm({ ...form, confirmPassword: e.target.value })}
                  placeholder="再次输入密码"
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/60 border border-slate-200/60 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-300/50 focus:border-teal-300 transition-all text-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-teal-400 to-emerald-500 text-white rounded-xl font-medium text-sm shadow-lg shadow-teal-200/50 hover:shadow-xl hover:shadow-teal-200/60 active:scale-[0.98] transition-all flex items-center justify-center disabled:opacity-60">
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>注册 <ArrowRight className="w-4 h-4 ml-1.5" /></>
              )}
            </button>
          </form>

          <p className="mt-4 text-xs text-center text-slate-400">
            注册后需要管理员审核通过才能使用
          </p>

          <div className="mt-4 text-center">
            <span className="text-sm text-slate-500">已有账号？</span>
            <Link href="/login" className="text-sm text-teal-600 font-medium ml-1 hover:text-teal-700">
              立即登录
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
