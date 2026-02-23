import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { hashPassword, generateToken, getAuthCookieOptions } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const { email, password, name, subject } = await request.json()

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

    // 创建用户
    const hashedPassword = await hashPassword(password)
    const teacher = await prisma.teacher.create({
      data: { email, password: hashedPassword, name, subject },
    })

    // 生成 Token
    const token = generateToken({
      userId: teacher.id,
      email: teacher.email,
      name: teacher.name,
      subject: teacher.subject,
    })

    // 设置 Cookie
    const cookieOptions = getAuthCookieOptions()
    const response = NextResponse.json({
      success: true,
      user: { id: teacher.id, email: teacher.email, name: teacher.name, subject: teacher.subject },
    })
    response.cookies.set(cookieOptions.name, token, cookieOptions)

    return response
  } catch (error) {
    console.error('Register error:', error)
    return NextResponse.json({ error: '注册失败，请稍后重试' }, { status: 500 })
  }
}
