import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

// GET: 获取当前配置（隐藏 Key 中间部分）
export async function GET() {
  try {
    const payload = await getCurrentUser()
    if (!payload) {
      return NextResponse.json({ configured: false })
    }

    const config = await prisma.aiConfig.findUnique({
      where: { teacherId: payload.userId },
    })

    if (!config) {
      return NextResponse.json({ configured: false })
    }

    const maskedKey = config.apiKey.length > 8
      ? config.apiKey.slice(0, 4) + '****' + config.apiKey.slice(-4)
      : '****'

    return NextResponse.json({
      configured: true,
      provider: config.provider,
      apiKey: maskedKey,
      baseUrl: config.baseUrl || '',
      model: config.model || '',
    })
  } catch (error) {
    console.error('Get AI config error:', error)
    return NextResponse.json({ configured: false })
  }
}

// POST: 保存配置
export async function POST(request: NextRequest) {
  try {
    const payload = await getCurrentUser()
    if (!payload) {
      return NextResponse.json({ error: '未登录' }, { status: 401 })
    }

    const body = await request.json()
    const { provider, apiKey, baseUrl, model } = body

    if (!apiKey) {
      return NextResponse.json({ error: 'API Key 不能为空' }, { status: 400 })
    }

    await prisma.aiConfig.upsert({
      where: { teacherId: payload.userId },
      update: {
        provider: provider || 'openai',
        apiKey,
        baseUrl: baseUrl || '',
        model: model || '',
      },
      create: {
        teacherId: payload.userId,
        provider: provider || 'openai',
        apiKey,
        baseUrl: baseUrl || '',
        model: model || '',
      },
    })

    return NextResponse.json({ success: true, message: 'AI API 配置已保存' })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : '未知错误'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

// PUT: 测试连接
export async function PUT() {
  try {
    const payload = await getCurrentUser()
    if (!payload) {
      return NextResponse.json({ error: '未登录' }, { status: 401 })
    }

    const config = await prisma.aiConfig.findUnique({
      where: { teacherId: payload.userId },
    })

    if (!config) {
      return NextResponse.json({ error: '尚未配置 AI API' }, { status: 400 })
    }

    let testUrl = ''
    let headers: Record<string, string> = {}
    let body = ''

    if (config.provider === 'anthropic') {
      testUrl = 'https://api.anthropic.com/v1/messages'
      headers = {
        'Content-Type': 'application/json',
        'x-api-key': config.apiKey,
        'anthropic-version': '2023-06-01',
      }
      body = JSON.stringify({
        model: config.model || 'claude-sonnet-4-20250514',
        max_tokens: 20,
        messages: [{ role: 'user', content: '回复"连接成功"两个字' }],
      })
    } else {
      const base = config.baseUrl || 'https://api.openai.com/v1'
      testUrl = `${base}/chat/completions`
      headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`,
      }
      body = JSON.stringify({
        model: config.model || 'gpt-4o-mini',
        messages: [{ role: 'user', content: '回复"连接成功"两个字' }],
        max_tokens: 20,
      })
    }

    const response = await fetch(testUrl, { method: 'POST', headers, body })

    if (response.ok) {
      return NextResponse.json({ success: true, message: '连接测试成功！AI API 可正常使用' })
    } else {
      const errorData = await response.text()
      return NextResponse.json({
        success: false,
        message: `连接失败 (${response.status})：${errorData.slice(0, 200)}`
      })
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : '未知错误'
    return NextResponse.json({
      success: false,
      message: `连接失败：${message}`
    })
  }
}
