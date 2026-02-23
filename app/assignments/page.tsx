'use client'

import { useState } from 'react'
import { Upload, CheckCircle, AlertCircle, Camera, Image, Sparkles } from 'lucide-react'
import TopNav from '../components/TopNav'
import BottomNav from '../components/BottomNav'

export default function AssignmentsPage() {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0]
      setFile(selectedFile)
      setError(null)
      setResult(null)
      const reader = new FileReader()
      reader.onload = (ev) => { setPreview(ev.target?.result as string) }
      reader.readAsDataURL(selectedFile)
    }
  }

  const handleUpload = async () => {
    if (!file) { setError('请选择文件'); return }
    setUploading(true); setError(null)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('assignmentId', 'demo-assignment-1')
      formData.append('studentId', 'demo-student-1')
      const response = await fetch('/api/assignments/upload', { method: 'POST', body: formData })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || '上传失败')
      setResult(data)
    } catch (err: any) { setError(err.message) } finally { setUploading(false) }
  }

  const clearFile = () => { setFile(null); setPreview(null); setResult(null); setError(null) }

  return (
    <div className="min-h-screen glass-bg-gradient">
      <TopNav />

      <div className="max-w-3xl mx-auto px-4 py-4 sm:py-8 pb-safe-nav">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-800 mb-4 sm:mb-6">作业批改</h1>

        <div className="glass-card-heavy p-4 sm:p-6">
          <div className="mb-4 sm:mb-5">
            <label className="block text-xs font-medium text-slate-500 mb-2">上传作业照片</label>

            {!preview ? (
              <div className="space-y-3">
                {/* 移动端拍照按钮 */}
                <label className="flex sm:hidden items-center justify-center w-full h-12 btn-primary rounded-xl text-sm font-medium cursor-pointer">
                  <Camera className="w-4.5 h-4.5 mr-2" />
                  拍照上传
                  <input type="file" className="hidden" accept="image/*" capture="environment" onChange={handleFileChange} />
                </label>

                {/* 通用上传区域 */}
                <label className="flex flex-col items-center justify-center w-full h-36 sm:h-52 border-2 border-dashed border-slate-200 rounded-2xl cursor-pointer bg-white/30 hover:bg-white/50 active:bg-white/50 transition-all">
                  <div className="flex flex-col items-center justify-center py-4">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-sky-50 to-blue-100 flex items-center justify-center mb-3">
                      <Image className="w-6 h-6 sm:w-7 sm:h-7 text-sky-400" />
                    </div>
                    <p className="text-sm text-slate-500 font-medium">点击选择照片</p>
                    <p className="text-[10px] text-slate-400 mt-1">支持 PNG, JPG, JPEG</p>
                  </div>
                  <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                </label>
              </div>
            ) : (
              <div className="relative">
                <img src={preview} alt="作业预览"
                  className="w-full max-h-56 sm:max-h-80 object-contain rounded-2xl bg-slate-50/50" />
                <button onClick={clearFile}
                  className="absolute top-2 right-2 bg-black/30 backdrop-blur-sm text-white rounded-full p-1.5 hover:bg-black/50 active:bg-black/60">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                <p className="mt-2 text-xs text-slate-400 text-center truncate">{file?.name}</p>
              </div>
            )}
          </div>

          <button onClick={handleUpload} disabled={!file || uploading}
            className="w-full btn-primary py-3 rounded-xl text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center">
            {uploading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                AI分析中...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                开始批改
              </>
            )}
          </button>

          {error && (
            <div className="mt-4 p-3 bg-rose-50/60 border border-rose-100 rounded-xl flex items-start backdrop-blur-sm">
              <AlertCircle className="w-4 h-4 text-rose-500 mr-2 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-xs font-medium text-rose-700">上传失败</h3>
                <p className="text-xs text-rose-600/80 mt-0.5">{error}</p>
              </div>
            </div>
          )}

          {result && (
            <div className="mt-4 p-3 bg-emerald-50/60 border border-emerald-100 rounded-xl backdrop-blur-sm">
              <div className="flex items-start">
                <CheckCircle className="w-4 h-4 text-emerald-500 mr-2 flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <h3 className="text-xs font-medium text-emerald-700 mb-1.5">批改完成</h3>
                  <div className="text-xs text-emerald-600">
                    <p>得分: {result.data?.score || 0} 分</p>
                    {result.data?.ai_analysis && (
                      <pre className="mt-2 p-2 bg-white/60 rounded-lg text-[10px] overflow-auto max-h-40 backdrop-blur-sm">
                        {JSON.stringify(result.data.ai_analysis, null, 2)}
                      </pre>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="mt-4 glass-card p-4 sm:p-5">
          <h2 className="text-sm font-semibold text-slate-600 mb-2.5 flex items-center">
            <Sparkles className="w-4 h-4 mr-1.5 text-sky-400" />使用说明
          </h2>
          <ul className="space-y-1.5 text-xs text-slate-400">
            <li className="flex items-start"><span className="w-1 h-1 rounded-full bg-sky-300 mt-1.5 mr-2 flex-shrink-0" />拍摄作业照片，确保字迹清晰</li>
            <li className="flex items-start"><span className="w-1 h-1 rounded-full bg-sky-300 mt-1.5 mr-2 flex-shrink-0" />上传后AI会自动识别题目和答案</li>
            <li className="flex items-start"><span className="w-1 h-1 rounded-full bg-sky-300 mt-1.5 mr-2 flex-shrink-0" />系统会自动批改并生成分析报告</li>
            <li className="flex items-start"><span className="w-1 h-1 rounded-full bg-sky-300 mt-1.5 mr-2 flex-shrink-0" />支持批量上传多份作业</li>
          </ul>
        </div>
      </div>

      <BottomNav />
    </div>
  )
}
