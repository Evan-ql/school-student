'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Users, FileText, BarChart3, BookOpen, Settings } from 'lucide-react'

const navItems = [
  { href: '/classes', label: '班级', icon: Users },
  { href: '/assignments', label: '批改', icon: FileText },
  { href: '/nodes', label: '课程', icon: BookOpen },
  { href: '/analytics', label: '分析', icon: BarChart3 },
  { href: '/settings', label: '设置', icon: Settings },
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 glass-nav-bottom z-50 md:hidden safe-area-bottom">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center flex-1 py-1 transition-all duration-200 ${
                isActive
                  ? 'text-sky-500'
                  : 'text-slate-400 active:text-sky-400'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-[1.5]'}`} />
                {isActive && (
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-sky-500" />
                )}
              </div>
              <span className={`text-[10px] mt-1.5 ${isActive ? 'font-semibold' : 'font-normal'}`}>
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
