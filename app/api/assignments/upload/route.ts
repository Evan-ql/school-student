import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { callAIWithImage } from '@/lib/ai-service'
import fs from 'fs'
import path from 'path'

const UPLOAD_DIR = path.join(process.cwd(), 'uploads', 'assignments')

function ensureUploadDir() {
  if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true })
  }
}

export async function POST(request: NextRequest) {
  try {
    const payload = await getCurrentUser()
    if (!payload) {
      return NextResponse.json({ error: '未登录' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const assignmentId = formData.get('assignmentId') as string
    const studentId = formData.get('studentId') as string

    if (!file || !assignmentId || !studentId) {
      return NextResponse.json({ error: '缺少必填字段' }, { status: 400 })
    }

    // 保存文件到本地
    ensureUploadDir()
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64 = buffer.toString('base64')
    const ext = file.name.split('.').pop() || 'jpg'
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
    const filePath = path.join(UPLOAD_DIR, fileName)
    fs.writeFileSync(filePath, buffer)

    const imageUrl = `/api/uploads/assignments/${fileName}`

    // AI 分析
    let analysisData: Record<string, unknown> = {}
    try {
      const analysis = await callAIWithImage(
        'assignment_grading',
        base64,
        file.type || 'image/jpeg',
        '请批改这份作业',
        payload.userId
      )
      analysisData = JSON.parse(analysis || '{}')
    } catch (e) {
      console.error('AI analysis failed:', e)
    }

    const result = await prisma.assignmentResult.create({
      data: {
        assignmentId,
        studentId,
        score: typeof analysisData.score === 'number' ? analysisData.score : null,
        feedback: typeof analysisData.feedback === 'string' ? analysisData.feedback : null,
        aiAnalysis: JSON.stringify(analysisData),
        weakPoints: Array.isArray(analysisData.weakPoints) ? analysisData.weakPoints as string[] : [],
        strongPoints: Array.isArray(analysisData.strongPoints) ? analysisData.strongPoints as string[] : [],
      },
    })

    await prisma.assignment.update({
      where: { id: assignmentId },
      data: { imageUrl, status: 'graded' },
    })

    return NextResponse.json({ success: true, data: result })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : '未知错误'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
