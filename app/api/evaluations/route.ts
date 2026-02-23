import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

// GET: 获取学生评价
export async function GET(request: NextRequest) {
  try {
    const payload = await getCurrentUser()
    if (!payload) {
      return NextResponse.json({ error: '未登录' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const studentId = searchParams.get('studentId')
    const semester = searchParams.get('semester')

    const where: Record<string, unknown> = { teacherId: payload.userId }
    if (studentId) where.studentId = studentId
    if (semester) where.semester = semester

    const evaluations = await prisma.evaluation.findMany({
      where,
      include: {
        student: { select: { id: true, name: true, studentNo: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ evaluations })
  } catch (error) {
    console.error('Get evaluations error:', error)
    return NextResponse.json({ error: '获取评价失败' }, { status: 500 })
  }
}

// POST: 创建/更新学生评价
export async function POST(request: NextRequest) {
  try {
    const payload = await getCurrentUser()
    if (!payload) {
      return NextResponse.json({ error: '未登录' }, { status: 401 })
    }

    const body = await request.json()
    const { studentId, evaluations } = body

    if (!studentId || !evaluations || !Array.isArray(evaluations)) {
      return NextResponse.json({ error: '请提供学生和评价数据' }, { status: 400 })
    }

    // 批量创建评价
    const created = await prisma.evaluation.createMany({
      data: evaluations.map((e: { dimension: string; score: number; note?: string; semester?: string }) => ({
        teacherId: payload.userId,
        studentId,
        dimension: e.dimension,
        score: e.score,
        note: e.note || null,
        semester: e.semester || null,
      })),
    })

    return NextResponse.json({ success: true, count: created.count })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : '未知错误'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
