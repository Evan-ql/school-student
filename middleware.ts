import { NextRequest, NextResponse } from 'next/server'

// 不需要登录的路径
const publicPaths = ['/login', '/register', '/api/auth/login', '/api/auth/register']

// 管理员专属路径
const adminPaths = ['/admin', '/api/admin']

// 简单解析 JWT payload（不验证签名，签名在 API 层验证）
function parseJwtPayload(token: string): { role?: string; status?: string } | null {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null
    const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString())
    return payload
  } catch {
    return null
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get('auth_token')?.value

  // 公开路径直接放行
  if (publicPaths.some(p => pathname.startsWith(p))) {
    // 已登录用户访问登录/注册页面，重定向到首页
    if (token && (pathname === '/login' || pathname === '/register')) {
      const payload = parseJwtPayload(token)
      if (payload?.role === 'admin') {
        return NextResponse.redirect(new URL('/admin', request.url))
      }
      return NextResponse.redirect(new URL('/', request.url))
    }
    return NextResponse.next()
  }

  // 未登录处理
  if (!token) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: '未登录' }, { status: 401 })
    }
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // 解析 token 获取角色和状态
  const payload = parseJwtPayload(token)

  // 管理员路径保护
  if (adminPaths.some(p => pathname.startsWith(p))) {
    if (!payload || payload.role !== 'admin') {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json({ error: '无权限' }, { status: 403 })
      }
      return NextResponse.redirect(new URL('/', request.url))
    }
    return NextResponse.next()
  }

  // 普通用户：检查审核状态（管理员不受限制）
  if (payload && payload.role !== 'admin' && payload.status !== 'approved') {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: '账户未通过审核' }, { status: 403 })
    }
    // 允许访问 pending 页面和设置页面（用于登出）
    if (pathname !== '/pending' && pathname !== '/settings') {
      return NextResponse.redirect(new URL('/pending', request.url))
    }
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
