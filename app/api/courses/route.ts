import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

// GET: 获取当前教师的所有课程
export async function GET() {
  try {
    const payload = await getCurrentUser()
    if (!payload) {
      return NextResponse.json({ error: '未登录' }, { status: 401 })
    }

    const courses = await prisma.course.findMany({
      where: { teacherId: payload.userId },
      include: {
        units: {
          include: {
            lessons: {
              orderBy: { sortOrder: 'asc' },
            },
          },
          orderBy: { sortOrder: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ courses })
  } catch (error) {
    console.error('Get courses error:', error)
    return NextResponse.json({ error: '获取课程失败' }, { status: 500 })
  }
}

// POST: 创建课程（含单元和课时）
export async function POST(request: NextRequest) {
  try {
    const payload = await getCurrentUser()
    if (!payload) {
      return NextResponse.json({ error: '未登录' }, { status: 401 })
    }

    const body = await request.json()
    const { grade, semester, subject, units } = body

    if (!grade || !semester || !subject) {
      return NextResponse.json({ error: '年级、学期和学科为必填项' }, { status: 400 })
    }

    const course = await prisma.course.create({
      data: {
        teacherId: payload.userId,
        grade,
        semester,
        subject,
        units: units ? {
          create: units.map((unit: { name: string; sortOrder: number; lessons?: { name: string; sortOrder: number; knowledgePoints?: string[] }[] }) => ({
            name: unit.name,
            sortOrder: unit.sortOrder,
            lessons: unit.lessons ? {
              create: unit.lessons.map((lesson: { name: string; sortOrder: number; knowledgePoints?: string[] }) => ({
                name: lesson.name,
                sortOrder: lesson.sortOrder,
                knowledgePoints: lesson.knowledgePoints || [],
              })),
            } : undefined,
          })),
        } : undefined,
      },
      include: {
        units: {
          include: { lessons: true },
          orderBy: { sortOrder: 'asc' },
        },
      },
    })

    return NextResponse.json({ success: true, course })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : '未知错误'
    console.error('Create course error:', error)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
