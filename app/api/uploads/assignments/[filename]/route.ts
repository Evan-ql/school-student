import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const UPLOAD_DIR = path.join(process.cwd(), 'uploads', 'assignments')

const MIME_TYPES: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  gif: 'image/gif',
  webp: 'image/webp',
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  const { filename } = await params
  const filePath = path.join(UPLOAD_DIR, filename)

  // 安全检查：防止路径穿越
  if (!filePath.startsWith(UPLOAD_DIR)) {
    return NextResponse.json({ error: '非法路径' }, { status: 403 })
  }

  if (!fs.existsSync(filePath)) {
    return NextResponse.json({ error: '文件不存在' }, { status: 404 })
  }

  const ext = filename.split('.').pop()?.toLowerCase() || 'jpg'
  const contentType = MIME_TYPES[ext] || 'application/octet-stream'
  const fileBuffer = fs.readFileSync(filePath)

  return new NextResponse(fileBuffer, {
    headers: {
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  })
}
