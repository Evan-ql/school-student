import { NextResponse } from 'next/server'
import { getCurrentUser, COOKIE_NAME } from '@/lib/auth'
import prisma from '@/lib/prisma'

// 获取当前登录用户信息
export async function GET() {
  try {
    const payload = await getCurrentUser()
    if (!payload) {
      return NextResponse.json({ error: '未登录' }, { status: 401 })
    }

    const teacher = await prisma.teacher.findUnique({
      where: { id: payload.userId },
      select: { id: true, email: true, name: true, subject: true, avatar: true, createdAt: true },
    })

    if (!teacher) {
      return NextResponse.json({ error: '用户不存在' }, { status: 404 })
    }

    return NextResponse.json({ user: teacher })
  } catch (error) {
    console.error('Get me error:', error)
    return NextResponse.json({ error: '获取用户信息失败' }, { status: 500 })
  }
}

// 登出
export async function DELETE() {
  const response = NextResponse.json({ success: true })
  response.cookies.set(COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  })
  return response
}
