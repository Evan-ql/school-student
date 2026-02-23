import Link from 'next/link'
import { BookOpen, Users, BarChart3, FileText } from 'lucide-react'
import TopNav from './components/TopNav'
import BottomNav from './components/BottomNav'

export default function Home() {
  return (
    <div className="min-h-screen glass-bg-gradient">
      <TopNav />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-12 pb-safe-nav">
        <div className="text-center mb-6 sm:mb-10">
          <h1 className="text-2xl sm:text-4xl font-bold text-slate-800 mb-2 sm:mb-3 tracking-tight">
            AI驱动的智能教学助手
          </h1>
          <p className="text-sm sm:text-lg text-slate-400 font-light">
            让批改作业从2小时变成10分钟
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <Link href="/classes" className="glass-card p-4 sm:p-6 hover:shadow-lg active:scale-[0.97] transition-all duration-200 group">
            <div className="flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-sky-300 to-blue-500 mb-3 sm:mb-4 shadow-sm group-hover:shadow-md transition-shadow">
              <Users className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
            </div>
            <h3 className="text-sm sm:text-base font-semibold text-slate-700 mb-1">班级管理</h3>
            <p className="text-slate-400 text-xs font-light">管理班级和学生信息</p>
          </Link>

          <Link href="/assignments" className="glass-card p-4 sm:p-6 hover:shadow-lg active:scale-[0.97] transition-all duration-200 group">
            <div className="flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-emerald-300 to-teal-500 mb-3 sm:mb-4 shadow-sm group-hover:shadow-md transition-shadow">
              <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
            </div>
            <h3 className="text-sm sm:text-base font-semibold text-slate-700 mb-1">作业批改</h3>
            <p className="text-slate-400 text-xs font-light">拍照上传，AI自动批改</p>
          </Link>

          <Link href="/analytics" className="glass-card p-4 sm:p-6 hover:shadow-lg active:scale-[0.97] transition-all duration-200 group">
            <div className="flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-violet-300 to-purple-500 mb-3 sm:mb-4 shadow-sm group-hover:shadow-md transition-shadow">
              <BarChart3 className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
            </div>
            <h3 className="text-sm sm:text-base font-semibold text-slate-700 mb-1">数据分析</h3>
            <p className="text-slate-400 text-xs font-light">多维度学情分析</p>
          </Link>

          <Link href="/nodes" className="glass-card p-4 sm:p-6 hover:shadow-lg active:scale-[0.97] transition-all duration-200 group">
            <div className="flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-amber-300 to-orange-500 mb-3 sm:mb-4 shadow-sm group-hover:shadow-md transition-shadow">
              <BookOpen className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
            </div>
            <h3 className="text-sm sm:text-base font-semibold text-slate-700 mb-1">课程管理</h3>
            <p className="text-slate-400 text-xs font-light">管理课程内容和进度</p>
          </Link>
        </div>

        <div className="mt-6 sm:mt-8 glass-card-heavy p-5 sm:p-7">
          <h2 className="text-lg sm:text-xl font-bold text-slate-700 mb-4 sm:mb-5 tracking-tight">核心功能</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            <div className="flex sm:block items-start space-x-3 sm:space-x-0 glass-card-light p-4">
              <div className="text-2xl sm:mb-3 flex-shrink-0">📸</div>
              <div>
                <h3 className="text-sm sm:text-base font-semibold text-slate-700 mb-1">零负担录入</h3>
                <p className="text-slate-400 text-xs sm:text-sm font-light">老师只需拍照，AI自动识别、批改、分析</p>
              </div>
            </div>
            <div className="flex sm:block items-start space-x-3 sm:space-x-0 glass-card-light p-4">
              <div className="text-2xl sm:mb-3 flex-shrink-0">🎯</div>
              <div>
                <h3 className="text-sm sm:text-base font-semibold text-slate-700 mb-1">精准画像</h3>
                <p className="text-slate-400 text-xs sm:text-sm font-light">为每个学生生成知识点掌握情况画像</p>
              </div>
            </div>
            <div className="flex sm:block items-start space-x-3 sm:space-x-0 glass-card-light p-4">
              <div className="text-2xl sm:mb-3 flex-shrink-0">📊</div>
              <div>
                <h3 className="text-sm sm:text-base font-semibold text-slate-700 mb-1">数据驱动</h3>
                <p className="text-slate-400 text-xs sm:text-sm font-light">班级/个人/节点多维度数据分析</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  )
}
