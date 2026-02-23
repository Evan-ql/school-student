import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { hashPassword } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const { email, password, name, subject, school } = await request.json()

    // 参数校验
    if (!email || !password || !name || !subject) {
      return NextResponse.json({ error: '请填写所有必填项' }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ error: '密码至少6位' }, { status: 400 })
    }

    // 检查邮箱是否已注册
    const existing = await prisma.teacher.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json({ error: '该邮箱已注册' }, { status: 409 })
    }

    // 创建用户（默认状态为 pending，需要管理员审核）
    const hashedPassword = await hashPassword(password)
    const teacher = await prisma.teacher.create({
      data: {
        email,
        password: hashedPassword,
        name,
        subject,
        school: school || null,
        role: 'teacher',
        status: 'pending',
      },
    })

    return NextResponse.json({
      success: true,
      message: '注册成功，请等待管理员审核后即可登录',
      user: { id: teacher.id, email: teacher.email, name: teacher.name },
    })
  } catch (error) {
    console.error('Register error:', error)
    return NextResponse.json({ error: '注册失败，请稍后重试' }, { status: 500 })
  }
}
