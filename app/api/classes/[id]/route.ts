import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

// GET: 获取班级详情
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const payload = await getCurrentUser()
    if (!payload) {
      return NextResponse.json({ error: '未登录' }, { status: 401 })
    }

    const { id } = await params
    const classData = await prisma.class.findUnique({
      where: { id },
      include: {
        students: { orderBy: { studentNo: 'asc' } },
        teachers: { include: { teacher: { select: { id: true, name: true, subject: true } } } },
        _count: { select: { students: true, assignments: true } },
      },
    })

    if (!classData) {
      return NextResponse.json({ error: '班级不存在' }, { status: 404 })
    }

    return NextResponse.json({ class: classData })
  } catch (error) {
    console.error('Get class error:', error)
    return NextResponse.json({ error: '获取班级详情失败' }, { status: 500 })
  }
}

// PUT: 更新班级信息
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const payload = await getCurrentUser()
    if (!payload) {
      return NextResponse.json({ error: '未登录' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { name, grade, academicYear, status } = body

    const updated = await prisma.class.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(grade && { grade }),
        ...(academicYear && { academicYear }),
        ...(status && { status }),
      },
    })

    return NextResponse.json({ success: true, class: updated })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : '未知错误'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

// DELETE: 删除班级
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const payload = await getCurrentUser()
    if (!payload) {
      return NextResponse.json({ error: '未登录' }, { status: 401 })
    }

    const { id } = await params
    await prisma.class.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : '未知错误'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
