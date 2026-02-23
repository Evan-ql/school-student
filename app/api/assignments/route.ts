import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

// GET: 获取当前教师的所有作业
export async function GET() {
  try {
    const payload = await getCurrentUser()
    if (!payload) {
      return NextResponse.json({ error: '未登录' }, { status: 401 })
    }

    const assignments = await prisma.assignment.findMany({
      where: { teacherId: payload.userId },
      include: {
        class: { select: { id: true, name: true, grade: true } },
        lesson: { select: { id: true, name: true } },
        _count: { select: { results: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ assignments })
  } catch (error) {
    console.error('Get assignments error:', error)
    return NextResponse.json({ error: '获取作业失败' }, { status: 500 })
  }
}

// POST: 创建作业
export async function POST(request: NextRequest) {
  try {
    const payload = await getCurrentUser()
    if (!payload) {
      return NextResponse.json({ error: '未登录' }, { status: 401 })
    }

    const body = await request.json()
    const { title, classId, lessonId } = body

    if (!title || !classId) {
      return NextResponse.json({ error: '作业标题和班级为必填项' }, { status: 400 })
    }

    const assignment = await prisma.assignment.create({
      data: {
        teacherId: payload.userId,
        title,
        classId,
        lessonId: lessonId || null,
      },
    })

    return NextResponse.json({ success: true, assignment })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : '未知错误'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
