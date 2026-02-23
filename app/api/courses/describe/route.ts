import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { callAI, isAIConfiguredForTeacher } from '@/lib/ai-service'

export async function POST(request: NextRequest) {
  const payload = await getCurrentUser()
  if (!payload) {
    return NextResponse.json({ error: '未登录' }, { status: 401 })
  }

  const configured = await isAIConfiguredForTeacher(payload.userId)
  if (!configured) {
    return NextResponse.json(
      { error: '尚未配置 AI API，请先到设置页面配置' },
      { status: 400 }
    )
  }

  try {
    const body = await request.json()
    const { description, subject } = body

    if (!description || !description.trim()) {
      return NextResponse.json({ error: '请输入课程描述' }, { status: 400 })
    }

    const prompt = subject
      ? `教师所教学科为"${subject}"。\n\n用户描述：${description}`
      : `用户描述：${description}`

    const aiResponse = await callAI('course_description_create', prompt, payload.userId)

    let courseData
    try {
      const jsonMatch = aiResponse.match(/```(?:json)?\s*([\s\S]*?)```/)
      const jsonStr = jsonMatch ? jsonMatch[1].trim() : aiResponse.trim()
      courseData = JSON.parse(jsonStr)
    } catch {
      return NextResponse.json({
        success: true,
        raw: true,
        content: aiResponse,
        message: 'AI 返回了非标准格式，请手动调整'
      })
    }

    if (courseData.error) {
      return NextResponse.json({ error: courseData.error }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      raw: false,
      data: courseData,
      message: '课程结构生成成功，请确认或修改后保存'
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : '未知错误'
    console.error('Course description create error:', error)
    return NextResponse.json(
      { error: `生成失败：${message}` },
      { status: 500 }
    )
  }
}
