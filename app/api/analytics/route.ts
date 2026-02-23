import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

// GET: 获取教学进度和学生分析数据
export async function GET() {
  try {
    const payload = await getCurrentUser()
    if (!payload) {
      return NextResponse.json({ error: '未登录' }, { status: 401 })
    }

    // 获取教师的课程和教学进度
    const courses = await prisma.course.findMany({
      where: { teacherId: payload.userId },
      include: {
        units: {
          include: {
            lessons: {
              include: {
                assignments: {
                  select: { id: true, status: true, createdAt: true },
                },
              },
              orderBy: { sortOrder: 'asc' },
            },
          },
          orderBy: { sortOrder: 'asc' },
        },
      },
    })

    // 获取教师的班级和学生
    const classTeachers = await prisma.classTeacher.findMany({
      where: { teacherId: payload.userId, isActive: true },
      include: {
        class: {
          include: {
            students: {
              include: {
                evaluations: true,
                assignmentResults: {
                  include: { assignment: { select: { title: true, createdAt: true } } },
                },
              },
            },
          },
        },
      },
    })

    const classes = classTeachers.map(ct => ct.class)

    return NextResponse.json({ courses, classes })
  } catch (error) {
    console.error('Get analytics error:', error)
    return NextResponse.json({ error: '获取分析数据失败' }, { status: 500 })
  }
}
