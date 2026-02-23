import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requireAdmin, hashPassword } from '@/lib/auth'

// 获取单个用户详情
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdmin()
  if (!admin) {
    return NextResponse.json({ error: '无权限' }, { status: 403 })
  }

  const { id } = await params

  const user = await prisma.teacher.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      name: true,
      subject: true,
      school: true,
      role: true,
      status: true,
      createdAt: true,
      updatedAt: true,
      _count: {
        select: {
          classes: true,
          courses: true,
          assignments: true,
        },
      },
    },
  })

  if (!user) {
    return NextResponse.json({ error: '用户不存在' }, { status: 404 })
  }

  return NextResponse.json({ user })
}

// 更新用户（审核、修改信息、重置密码）
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdmin()
  if (!admin) {
    return NextResponse.json({ error: '无权限' }, { status: 403 })
  }

  const { id } = await params
  const body = await request.json()
  const { action, status, name, subject, school, password } = body

  // 不允许修改管理员
  const target = await prisma.teacher.findUnique({ where: { id } })
  if (!target) {
    return NextResponse.json({ error: '用户不存在' }, { status: 404 })
  }
  if (target.role === 'admin') {
    return NextResponse.json({ error: '不能修改管理员账户' }, { status: 403 })
  }

  // 审核操作
  if (action === 'approve' || action === 'reject') {
    const newStatus = action === 'approve' ? 'approved' : 'rejected'
    const user = await prisma.teacher.update({
      where: { id },
      data: { status: newStatus },
      select: { id: true, name: true, email: true, status: true },
    })
    return NextResponse.json({ success: true, user, message: action === 'approve' ? '已通过审核' : '已拒绝申请' })
  }

  // 重置密码
  if (action === 'reset_password' && password) {
    const hashed = await hashPassword(password)
    await prisma.teacher.update({
      where: { id },
      data: { password: hashed },
    })
    return NextResponse.json({ success: true, message: '密码已重置' })
  }

  // 更新用户信息
  const updateData: Record<string, unknown> = {}
  if (status) updateData.status = status
  if (name) updateData.name = name
  if (subject) updateData.subject = subject
  if (school !== undefined) updateData.school = school

  if (Object.keys(updateData).length === 0) {
    return NextResponse.json({ error: '没有需要更新的内容' }, { status: 400 })
  }

  const user = await prisma.teacher.update({
    where: { id },
    data: updateData,
    select: { id: true, name: true, email: true, status: true, subject: true, school: true },
  })

  return NextResponse.json({ success: true, user })
}

// 删除用户
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdmin()
  if (!admin) {
    return NextResponse.json({ error: '无权限' }, { status: 403 })
  }

  const { id } = await params

  // 不允许删除管理员
  const target = await prisma.teacher.findUnique({ where: { id } })
  if (!target) {
    return NextResponse.json({ error: '用户不存在' }, { status: 404 })
  }
  if (target.role === 'admin') {
    return NextResponse.json({ error: '不能删除管理员账户' }, { status: 403 })
  }

  await prisma.teacher.delete({ where: { id } })
  return NextResponse.json({ success: true, message: '用户已删除' })
}
