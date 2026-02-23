import { NextRequest, NextResponse } from 'next/server'

// 不需要登录的路径
const publicPaths = ['/login', '/register', '/api/auth/login', '/api/auth/register']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get('auth_token')?.value

  // 公开路径直接放行
  if (publicPaths.some(p => pathname.startsWith(p))) {
    // 已登录用户访问登录/注册页面，重定向到首页
    if (token && (pathname === '/login' || pathname === '/register')) {
      return NextResponse.redirect(new URL('/', request.url))
    }
    return NextResponse.next()
  }

  // API 路由需要认证（排除公开的 auth 路由）
  if (pathname.startsWith('/api/') && !token) {
    return NextResponse.json({ error: '未登录' }, { status: 401 })
  }

  // 页面路由需要认证
  if (!pathname.startsWith('/api/') && !pathname.startsWith('/_next') && !pathname.startsWith('/favicon') && !pathname.includes('.')) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|icon-|manifest.json|sw.js).*)',
  ],
}
