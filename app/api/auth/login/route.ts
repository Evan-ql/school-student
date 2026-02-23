import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { verifyPassword, generateToken, getAuthCookieOptions } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()

    if (!username || !password) {
      return NextResponse.json({ error: '请输入用户名/邮箱和密码' }, { status: 400 })
    }

    // 查找用户 - 支持用户名或邮箱登录
    const teacher = await prisma.teacher.findFirst({
      where: {
        OR: [
          { email: username },
          { name: username }
        ]
      }
    })
    
    if (!teacher) {
      return NextResponse.json({ error: '用户名/邮箱或密码错误' }, { status: 401 })
    }

    // 验证密码
    const isValid = await verifyPassword(password, teacher.password)
    if (!isValid) {
      return NextResponse.json({ error: '用户名/邮箱或密码错误' }, { status: 401 })
    }

    // 检查审核状态（管理员不受限制）
    if (teacher.role !== 'admin') {
      if (teacher.status === 'pending') {
        return NextResponse.json({ error: '您的账户正在等待管理员审核，请耐心等待' }, { status: 403 })
      }
      if (teacher.status === 'rejected') {
        return NextResponse.json({ error: '您的注册申请已被拒绝，如有疑问请联系管理员' }, { status: 403 })
      }
    }

    // 生成 Token
    const token = generateToken({
      userId: teacher.id,
      email: teacher.email,
      name: teacher.name,
      subject: teacher.subject,
      role: teacher.role,
      status: teacher.status,
    })

    // 设置 Cookie
    const cookieOptions = getAuthCookieOptions()
    const response = NextResponse.json({
      success: true,
      user: {
        id: teacher.id,
        email: teacher.email,
        name: teacher.name,
        subject: teacher.subject,
        role: teacher.role,
        status: teacher.status,
      },
    })
    response.cookies.set(cookieOptions.name, token, cookieOptions)

    return response
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({ error: '登录失败，请稍后重试' }, { status: 500 })
  }
}
