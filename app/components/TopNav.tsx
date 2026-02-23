'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BookOpen, Settings } from 'lucide-react'

const navLinks = [
  { href: '/classes', label: '班级管理' },
  { href: '/assignments', label: '作业批改' },
  { href: '/analytics', label: '数据分析' },
  { href: '/nodes', label: '课程管理' },
]

export default function TopNav() {
  const pathname = usePathname()

  return (
    <nav className="glass-nav sticky top-0 z-40">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="flex justify-between h-12 sm:h-14 items-center">
          <Link href="/" className="flex items-center">
            <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-sky-400 to-blue-500 flex items-center justify-center shadow-sm">
              <BookOpen className="h-4.5 w-4.5 text-white" />
            </div>
            <span className="ml-2 text-base sm:text-lg font-semibold text-slate-700 hidden sm:inline tracking-tight">
              智能教学助手
            </span>
          </Link>
          {/* 桌面端导航链接 */}
          <div className="hidden md:flex items-center gap-1">
            <div className="glass-tab flex items-center p-0.5">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                    pathname === link.href
                      ? 'glass-tab-active text-sky-600'
                      : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
            <Link
              href="/settings"
              className={`ml-2 p-2 rounded-xl transition-all duration-200 ${
                pathname === '/settings'
                  ? 'text-sky-600 bg-sky-50/60'
                  : 'text-slate-400 hover:text-slate-600 hover:bg-white/40'
              }`}
              title="设置"
            >
              <Settings className="w-4.5 h-4.5" />
            </Link>
          </div>
          {/* 移动端：显示当前页面标题 */}
          <div className="md:hidden flex items-center">
            <span className="text-sm font-medium text-slate-500">
              {navLinks.find(l => l.href === pathname)?.label || (pathname === '/settings' ? '设置' : '首页')}
            </span>
          </div>
        </div>
      </div>
    </nav>
  )
}
