import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { hashPassword } from '@/lib/auth'

// 初始化管理员账户（通过环境变量配置，密码不会出现在代码中）
export async function POST() {
  try {
    const adminEmail = process.env.ADMIN_EMAIL
    const adminPassword = process.env.ADMIN_PASSWORD
    const adminName = process.env.ADMIN_NAME || '管理员'

    if (!adminEmail || !adminPassword) {
      return NextResponse.json({
        error: '未配置管理员环境变量 (ADMIN_EMAIL, ADMIN_PASSWORD)',
      }, { status: 400 })
    }

    // 检查管理员是否已存在
    const existing = await prisma.teacher.findUnique({ where: { email: adminEmail } })

    if (existing) {
      // 如果已存在但不是管理员，升级为管理员
      if (existing.role !== 'admin') {
        await prisma.teacher.update({
          where: { email: adminEmail },
          data: { role: 'admin', status: 'approved' },
        })
        return NextResponse.json({ success: true, message: '已将现有账户升级为管理员' })
      }
      return NextResponse.json({ success: true, message: '管理员账户已存在' })
    }

    // 创建管理员账户
    const hashedPassword = await hashPassword(adminPassword)
    await prisma.teacher.create({
      data: {
        email: adminEmail,
        password: hashedPassword,
        name: adminName,
        subject: '管理',
        role: 'admin',
        status: 'approved',
      },
    })

    return NextResponse.json({ success: true, message: '管理员账户创建成功' })
  } catch (error) {
    console.error('Admin init error:', error)
    return NextResponse.json({ error: '初始化失败' }, { status: 500 })
  }
}
