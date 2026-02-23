import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

// POST: 添加学生到班级
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const payload = await getCurrentUser()
    if (!payload) {
      return NextResponse.json({ error: '未登录' }, { status: 401 })
    }

    const { id: classId } = await params
    const body = await request.json()
    const { students } = body

    if (!students || !Array.isArray(students) || students.length === 0) {
      return NextResponse.json({ error: '请提供学生信息' }, { status: 400 })
    }

    const created = await prisma.student.createMany({
      data: students.map((s: { name: string; studentNo: string; enrollmentYear: number }) => ({
        classId,
        name: s.name,
        studentNo: s.studentNo,
        enrollmentYear: s.enrollmentYear,
      })),
    })

    return NextResponse.json({ success: true, count: created.count })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : '未知错误'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
