import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

// GET: 获取当前教师的所有班级
export async function GET() {
  try {
    const payload = await getCurrentUser()
    if (!payload) {
      return NextResponse.json({ error: '未登录' }, { status: 401 })
    }

    const classTeachers = await prisma.classTeacher.findMany({
      where: { teacherId: payload.userId, isActive: true },
      include: {
        class: {
          include: {
            students: true,
            _count: { select: { students: true, assignments: true } },
          },
        },
      },
    })

    const classes = classTeachers.map(ct => ({
      ...ct.class,
      role: ct.role,
      studentCount: ct.class._count.students,
      assignmentCount: ct.class._count.assignments,
    }))

    return NextResponse.json({ classes })
  } catch (error) {
    console.error('Get classes error:', error)
    return NextResponse.json({ error: '获取班级失败' }, { status: 500 })
  }
}

// POST: 创建班级
export async function POST(request: NextRequest) {
  try {
    const payload = await getCurrentUser()
    if (!payload) {
      return NextResponse.json({ error: '未登录' }, { status: 401 })
    }

    const body = await request.json()
    const { name, grade, academicYear, students } = body

    if (!name || !grade || !academicYear) {
      return NextResponse.json({ error: '班级名称、年级和学年为必填项' }, { status: 400 })
    }

    const newClass = await prisma.class.create({
      data: {
        name,
        grade,
        academicYear,
        teachers: {
          create: {
            teacherId: payload.userId,
            role: 'primary',
          },
        },
        students: students ? {
          create: students.map((s: { name: string; studentNo: string; enrollmentYear: number }) => ({
            name: s.name,
            studentNo: s.studentNo,
            enrollmentYear: s.enrollmentYear,
          })),
        } : undefined,
      },
      include: {
        students: true,
        _count: { select: { students: true } },
      },
    })

    return NextResponse.json({ success: true, class: newClass })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : '未知错误'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
