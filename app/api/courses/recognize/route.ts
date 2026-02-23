import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { callAI, callAIWithImage, isAIConfiguredForTeacher } from '@/lib/ai-service'

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
    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: '请上传文件' }, { status: 400 })
    }

    const fileName = file.name.toLowerCase()
    let aiResponse: string

    if (fileName.endsWith('.png') || fileName.endsWith('.jpg') || fileName.endsWith('.jpeg') || fileName.endsWith('.webp')) {
      const buffer = Buffer.from(await file.arrayBuffer())
      const base64 = buffer.toString('base64')
      const mimeType = file.type || 'image/png'

      aiResponse = await callAIWithImage(
        'course_recognition',
        base64,
        mimeType,
        '请从这张图片中识别课程结构，按学期→单元→课时的层级整理输出。',
        payload.userId
      )
    } else {
      let textContent = ''
      try {
        textContent = await file.text()
      } catch {
        return NextResponse.json(
          { error: '不支持的文件格式，请上传图片（PNG/JPG）或文本文件（TXT/MD/CSV）' },
          { status: 400 }
        )
      }

      if (!textContent.trim()) {
        return NextResponse.json({ error: '文件内容为空' }, { status: 400 })
      }

      aiResponse = await callAI(
        'course_recognition',
        `以下是课程相关文件的内容，请从中提取课程结构：\n\n文件名：${file.name}\n\n内容：\n${textContent}`,
        payload.userId
      )
    }

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
      message: '课程结构识别成功，请确认或修改后保存'
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : '未知错误'
    console.error('Course recognition error:', error)
    return NextResponse.json(
      { error: `识别失败：${message}` },
      { status: 500 }
    )
  }
}
