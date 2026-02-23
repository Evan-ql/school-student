import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

// GET: 获取当前教师信息
export async function GET() {
  try {
    const payload = await getCurrentUser()
    if (!payload) {
      return NextResponse.json({ configured: false })
    }

    const teacher = await prisma.teacher.findUnique({
      where: { id: payload.userId },
      select: { id: true, name: true, email: true, subject: true, school: true },
    })

    if (!teacher) {
      return NextResponse.json({ configured: false })
    }

    return NextResponse.json({
      configured: true,
      name: teacher.name,
      subject: teacher.subject,
      school: teacher.school || '',
    })
  } catch (error) {
    console.error('Get teacher error:', error)
    return NextResponse.json({ configured: false })
  }
}

// POST: 更新教师信息
export async function POST(request: NextRequest) {
  try {
    const payload = await getCurrentUser()
    if (!payload) {
      return NextResponse.json({ error: '未登录' }, { status: 401 })
    }

    const body = await request.json()
    const { name, subject, school } = body

    if (!name || !subject) {
      return NextResponse.json({ error: '姓名和学科为必填项' }, { status: 400 })
    }

    await prisma.teacher.update({
      where: { id: payload.userId },
      data: { name, subject, school: school || null },
    })

    return NextResponse.json({ success: true, message: '教师信息已保存' })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : '未知错误'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
