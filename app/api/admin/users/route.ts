import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth'

// 获取用户列表
export async function GET(request: NextRequest) {
  const admin = await requireAdmin()
  if (!admin) {
    return NextResponse.json({ error: '无权限' }, { status: 403 })
  }

  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status') // pending | approved | rejected | all
  const search = searchParams.get('search') || ''

  const where: Record<string, unknown> = {}

  // 不显示管理员自己
  where.role = 'teacher'

  if (status && status !== 'all') {
    where.status = status
  }

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
      { school: { contains: search, mode: 'insensitive' } },
    ]
  }

  const users = await prisma.teacher.findMany({
    where,
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
    },
    orderBy: { createdAt: 'desc' },
  })

  // 统计各状态数量
  const counts = await prisma.teacher.groupBy({
    by: ['status'],
    where: { role: 'teacher' },
    _count: true,
  })

  const stats = {
    total: counts.reduce((sum, c) => sum + c._count, 0),
    pending: counts.find(c => c.status === 'pending')?._count || 0,
    approved: counts.find(c => c.status === 'approved')?._count || 0,
    rejected: counts.find(c => c.status === 'rejected')?._count || 0,
  }

  return NextResponse.json({ users, stats })
}
