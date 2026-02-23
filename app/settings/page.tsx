'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Settings, Eye, EyeOff, CheckCircle, AlertCircle, Loader2, BookOpen, FileText, BarChart3, Users, User, LogOut } from 'lucide-react'
import TopNav from '../components/TopNav'
import BottomNav from '../components/BottomNav'

const providers = [
  { id: 'openai', name: 'OpenAI', defaultBase: 'https://api.openai.com/v1', models: ['gpt-4o', 'gpt-4o-mini', 'gpt-4.1-mini', 'gpt-4.1-nano'] },
  { id: 'anthropic', name: 'Anthropic', defaultBase: '', models: ['claude-sonnet-4-20250514', 'claude-3-5-sonnet-20241022', 'claude-3-haiku-20240307'] },
  { id: 'custom', name: '自定义（兼容OpenAI接口）', defaultBase: '', models: [] },
]

const subjectOptions = ['数学', '语文', '英语', '科学', '道德与法治', '音乐', '美术', '体育', '信息技术', '其他']

const aiScenes = [
  { icon: BookOpen, name: '课程识别', desc: '上传教材目录/课程表，AI 自动提取课程结构', color: 'from-amber-300 to-orange-400' },
  { icon: FileText, name: '作业批改', desc: '拍照上传作业，AI 识别题目、判断对错、分析薄弱点', color: 'from-emerald-300 to-teal-400' },
  { icon: BarChart3, name: '学情分析', desc: '根据历史数据，生成学生学习画像和建议', color: 'from-violet-300 to-purple-400' },
  { icon: Users, name: '班级分析', desc: '汇总班级学情，找出共性薄弱点', color: 'from-sky-300 to-blue-400' },
]

export default function SettingsPage() {
  const router = useRouter()
  const [teacherName, setTeacherName] = useState('')
  const [teacherSubject, setTeacherSubject] = useState('数学')
  const [teacherSchool, setTeacherSchool] = useState('')
  const [teacherConfigured, setTeacherConfigured] = useState(false)
  const [savingTeacher, setSavingTeacher] = useState(false)
  const [teacherMsg, setTeacherMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const [provider, setProvider] = useState('openai')
  const [apiKey, setApiKey] = useState('')
  const [baseUrl, setBaseUrl] = useState('https://api.openai.com/v1')
  const [model, setModel] = useState('gpt-4o')
  const [customModel, setCustomModel] = useState('')
  const [showKey, setShowKey] = useState(false)
  const [saving, setSaving] = useState(false)
  const [testing, setTesting] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [currentConfig, setCurrentConfig] = useState<Record<string, unknown> | null>(null)
  const [loggingOut, setLoggingOut] = useState(false)

  useEffect(() => { fetchTeacher(); fetchConfig() }, [])

  const fetchTeacher = async () => {
    try {
      const res = await fetch('/api/teacher')
      const data = await res.json()
      if (data.configured) { setTeacherName(data.name); setTeacherSubject(data.subject); setTeacherSchool(data.school || ''); setTeacherConfigured(true) }
    } catch (e) { console.error('Failed to fetch teacher:', e) }
  }

  const handleSaveTeacher = async () => {
    if (!teacherName || !teacherSubject) { setTeacherMsg({ type: 'error', text: '请填写姓名和学科' }); return }
    setSavingTeacher(true); setTeacherMsg(null)
    try {
      const res = await fetch('/api/teacher', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: teacherName, subject: teacherSubject, school: teacherSchool }) })
      const data = await res.json()
      if (res.ok) { setTeacherMsg({ type: 'success', text: data.message }); setTeacherConfigured(true) }
      else { setTeacherMsg({ type: 'error', text: data.error }) }
    } catch (e: unknown) { setTeacherMsg({ type: 'error', text: e instanceof Error ? e.message : '未知错误' }) }
    finally { setSavingTeacher(false) }
  }

  const fetchConfig = async () => {
    try {
      const res = await fetch('/api/ai-config')
      const data = await res.json()
      setCurrentConfig(data)
      if (data.configured) { setProvider(data.provider); setBaseUrl(data.baseUrl || ''); setModel(data.model || '') }
    } catch (e) { console.error('Failed to fetch config:', e) }
  }

  const currentProvider = providers.find(p => p.id === provider)

  const handleSave = async () => {
    if (!apiKey) { setMessage({ type: 'error', text: '请输入 API Key' }); return }
    setSaving(true); setMessage(null)
    try {
      const finalModel = model === '__custom__' ? customModel : model
      const res = await fetch('/api/ai-config', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ provider, apiKey, baseUrl: baseUrl || currentProvider?.defaultBase || '', model: finalModel }) })
      const data = await res.json()
      if (res.ok) { setMessage({ type: 'success', text: data.message }); setApiKey(''); fetchConfig() }
      else { setMessage({ type: 'error', text: data.error }) }
    } catch (e: unknown) { setMessage({ type: 'error', text: e instanceof Error ? e.message : '未知错误' }) }
    finally { setSaving(false) }
  }

  const handleTest = async () => {
    setTesting(true); setMessage(null)
    try {
      const res = await fetch('/api/ai-config', { method: 'PUT' })
      const data = await res.json()
      setMessage({ type: data.success ? 'success' : 'error', text: data.message })
    } catch (e: unknown) { setMessage({ type: 'error', text: e instanceof Error ? e.message : '未知错误' }) }
    finally { setTesting(false) }
  }

  const handleLogout = async () => {
    setLoggingOut(true)
    try {
      await fetch('/api/auth/me', { method: 'DELETE' })
      router.push('/login')
      router.refresh()
    } catch (e) {
      console.error('Logout failed:', e)
    } finally {
      setLoggingOut(false)
    }
  }

  return (
    <div className="min-h-screen glass-bg-gradient">
      <TopNav />
      <div className="max-w-2xl mx-auto px-4 py-4 sm:py-12 pb-safe-nav">
        <div className="flex items-center mb-5 sm:mb-8">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center mr-3">
            <Settings className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">设置</h1>
        </div>

        {/* 教师信息 */}
        <div className="glass-card p-5 sm:p-6 mb-4 sm:mb-5 animate-glass-in">
          <div className="flex items-center mb-4">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-400 to-indigo-600 flex items-center justify-center mr-2.5">
              <User className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">教师信息</h2>
            {teacherConfigured && (
              <span className="ml-auto text-xs text-green-600 bg-green-50/80 px-2.5 py-0.5 rounded-full font-medium backdrop-blur-sm">已设置</span>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1.5">姓名</label>
              <input type="text" value={teacherName} onChange={e => setTeacherName(e.target.value)}
                className="w-full px-3.5 py-2.5 glass-input rounded-xl text-base"
                placeholder="请输入您的姓名" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">所教学科</label>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {subjectOptions.map(s => (
                  <button key={s} onClick={() => setTeacherSubject(s)}
                    className={`py-2 px-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                      teacherSubject === s
                        ? 'bg-indigo-500 text-white shadow-sm'
                        : 'glass-btn text-gray-600'
                    }`}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1.5">学校 <span className="text-gray-400 font-normal">(可选)</span></label>
              <input type="text" value={teacherSchool} onChange={e => setTeacherSchool(e.target.value)}
                className="w-full px-3.5 py-2.5 glass-input rounded-xl text-base"
                placeholder="请输入学校名称" />
            </div>

            {teacherMsg && (
              <div className={`p-3 rounded-xl flex items-start text-sm backdrop-blur-sm ${teacherMsg.type === 'success' ? 'bg-green-50/80 text-green-800' : 'bg-red-50/80 text-red-800'}`}>
                {teacherMsg.type === 'success' ? <CheckCircle className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />}
                <span>{teacherMsg.text}</span>
              </div>
            )}

            <button onClick={handleSaveTeacher} disabled={savingTeacher || !teacherName || !teacherSubject}
              className="w-full bg-gradient-to-r from-indigo-500 to-indigo-600 text-white py-2.5 px-4 rounded-xl hover:from-indigo-600 hover:to-indigo-700 active:scale-[0.98] disabled:from-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed transition-all font-medium flex items-center justify-center shadow-sm">
              {savingTeacher && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              {savingTeacher ? '保存中...' : teacherConfigured ? '更新信息' : '保存信息'}
            </button>
          </div>
        </div>

        {/* AI API 配置 */}
        <div className="glass-card p-5 sm:p-6 mb-4 sm:mb-5 animate-glass-in" style={{ animationDelay: '0.05s' }}>
          <div className="flex items-center mb-1">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center mr-2.5">
              <Settings className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">AI 配置</h2>
          </div>
          <p className="text-xs text-gray-400 mb-4 ml-[42px]">配置后系统将自动使用 AI 进行课程识别、作业批改和学情分析</p>

          {/* 当前状态 */}
          <div className={`mb-5 p-3.5 rounded-xl backdrop-blur-sm ${currentConfig?.configured ? 'bg-green-50/60 border border-green-200/50' : 'bg-amber-50/60 border border-amber-200/50'}`}>
            <div className="flex items-center text-sm">
              {currentConfig?.configured ? (
                <>
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                  <span className="text-green-800">
                    <span className="font-medium">已配置</span>
                    <span className="ml-1 text-green-600">
                      {currentConfig.provider === 'openai' ? 'OpenAI' : currentConfig.provider === 'anthropic' ? 'Anthropic' : '自定义'}
                      {currentConfig.model ? ` · ${String(currentConfig.model)}` : ''}
                    </span>
                  </span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-4 h-4 text-amber-500 mr-2 flex-shrink-0" />
                  <span className="font-medium text-amber-800">尚未配置</span>
                </>
              )}
            </div>
          </div>

          {/* 服务商 */}
          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-600 mb-2">AI 服务商</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {providers.map((p) => (
                <button key={p.id} onClick={() => { setProvider(p.id); setBaseUrl(p.defaultBase); setModel(p.models[0] || '') }}
                  className={`p-3 rounded-xl text-sm font-medium transition-all duration-200 text-left ${provider === p.id ? 'bg-indigo-500 text-white shadow-sm' : 'glass-btn text-gray-700'}`}>
                  {p.name}
                </button>
              ))}
            </div>
          </div>

          {/* API Key */}
          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-600 mb-2">API Key</label>
            <div className="relative">
              <input type={showKey ? 'text' : 'password'} value={apiKey} onChange={(e) => setApiKey(e.target.value)}
                className="w-full px-3.5 py-2.5 pr-10 glass-input rounded-xl text-base"
                placeholder={provider === 'openai' ? 'sk-...' : provider === 'anthropic' ? 'sk-ant-...' : '输入 API Key'} />
              <button type="button" onClick={() => setShowKey(!showKey)} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600">
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Base URL */}
          {(provider === 'openai' || provider === 'custom') && (
            <div className="mb-5">
              <label className="block text-sm font-medium text-gray-600 mb-2">API 地址 <span className="text-gray-400 font-normal">(可选)</span></label>
              <input type="text" value={baseUrl} onChange={(e) => setBaseUrl(e.target.value)}
                className="w-full px-3.5 py-2.5 glass-input rounded-xl text-base"
                placeholder={currentProvider?.defaultBase || 'https://your-api-endpoint.com/v1'} />
            </div>
          )}

          {/* 模型 */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-600 mb-2">模型</label>
            {currentProvider && currentProvider.models.length > 0 ? (
              <>
                <select value={model} onChange={(e) => setModel(e.target.value)}
                  className="w-full px-3.5 py-2.5 glass-input rounded-xl text-base appearance-none">
                  {currentProvider.models.map((m) => (<option key={m} value={m}>{m}</option>))}
                  <option value="__custom__">自定义模型...</option>
                </select>
                {model === '__custom__' && (
                  <input type="text" value={customModel} onChange={(e) => setCustomModel(e.target.value)}
                    className="w-full mt-2 px-3.5 py-2.5 glass-input rounded-xl text-base"
                    placeholder="输入模型名称" />
                )}
              </>
            ) : (
              <input type="text" value={model} onChange={(e) => setModel(e.target.value)}
                className="w-full px-3.5 py-2.5 glass-input rounded-xl text-base"
                placeholder="输入模型名称，如 gpt-4o" />
            )}
          </div>

          {message && (
            <div className={`mb-4 p-3 rounded-xl flex items-start text-sm backdrop-blur-sm ${message.type === 'success' ? 'bg-green-50/80 text-green-800' : 'bg-red-50/80 text-red-800'}`}>
              {message.type === 'success' ? <CheckCircle className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />}
              <span>{message.text}</span>
            </div>
          )}

          <div className="flex space-x-3">
            <button onClick={handleSave} disabled={saving || !apiKey}
              className="flex-1 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white py-2.5 px-4 rounded-xl hover:from-indigo-600 hover:to-indigo-700 active:scale-[0.98] disabled:from-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed transition-all font-medium flex items-center justify-center shadow-sm">
              {saving && <Loader2 className="w-4 h-4 animate-spin mr-2" />}{saving ? '保存中...' : '保存配置'}
            </button>
            <button onClick={handleTest} disabled={testing || !currentConfig?.configured}
              className="flex-1 glass-btn text-indigo-600 py-2.5 px-4 rounded-xl border-indigo-200 hover:bg-indigo-50/50 active:scale-[0.98] disabled:text-gray-400 disabled:cursor-not-allowed transition-all font-medium flex items-center justify-center">
              {testing && <Loader2 className="w-4 h-4 animate-spin mr-2" />}{testing ? '测试中...' : '测试连接'}
            </button>
          </div>
        </div>

        {/* AI 功能一览 */}
        <div className="glass-card p-5 sm:p-6 mb-4 sm:mb-5 animate-glass-in" style={{ animationDelay: '0.1s' }}>
          <h2 className="text-lg font-semibold text-slate-700 mb-4">AI 内置功能</h2>
          <p className="text-sm text-gray-400 mb-4">配置 API 后，以下功能自动启用，每个功能都内置了专业的 AI 指令。</p>
          <div className="space-y-2.5">
            {aiScenes.map((scene, i) => {
              const Icon = scene.icon
              return (
                <div key={i} className="flex items-start p-3.5 glass-card-light">
                  <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${scene.color} flex items-center justify-center flex-shrink-0 shadow-sm`}>
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                  <div className="ml-3">
                    <div className="text-sm font-semibold text-slate-700">{scene.name}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{scene.desc}</div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* 退出登录 */}
        <div className="glass-card p-5 sm:p-6 animate-glass-in" style={{ animationDelay: '0.15s' }}>
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="w-full py-2.5 px-4 rounded-xl text-red-500 font-medium text-sm glass-btn border-red-200/50 hover:bg-red-50/50 active:scale-[0.98] transition-all flex items-center justify-center">
            {loggingOut ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <LogOut className="w-4 h-4 mr-2" />
            )}
            {loggingOut ? '退出中...' : '退出登录'}
          </button>
        </div>
      </div>
      <BottomNav />
    </div>
  )
}
