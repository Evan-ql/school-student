/**
 * 统一 AI 调用服务层
 * 根据用户配置的 API 自动选择服务商，携带对应场景的系统 Prompt
 */

import prisma from './prisma'
import { getSystemPrompt, type AIScene } from './ai-prompts'

interface AIConfig {
  provider: string
  apiKey: string
  baseUrl: string | null
  model: string | null
}

async function readConfigForTeacher(teacherId: string): Promise<AIConfig | null> {
  try {
    const config = await prisma.aiConfig.findUnique({
      where: { teacherId },
    })
    if (!config) return null
    return {
      provider: config.provider,
      apiKey: config.apiKey,
      baseUrl: config.baseUrl,
      model: config.model,
    }
  } catch (e) {
    console.error('Error reading AI config:', e)
    return null
  }
}

export async function isAIConfiguredForTeacher(teacherId: string): Promise<boolean> {
  const config = await readConfigForTeacher(teacherId)
  return config !== null && config.apiKey.length > 0
}

// 向后兼容：检查是否有任何已配置的 AI（用于不需要特定教师的场景）
export function isAIConfigured(): boolean {
  // 这个函数现在需要异步，但为了兼容保留同步签名
  // 在实际使用中应该用 isAIConfiguredForTeacher
  return true // 让调用方自行处理
}

/**
 * 调用 AI —— 纯文本场景
 */
export async function callAI(scene: AIScene, userMessage: string, teacherId?: string): Promise<string> {
  let config: AIConfig | null = null
  if (teacherId) {
    config = await readConfigForTeacher(teacherId)
  }
  if (!config) throw new Error('AI API 尚未配置，请先在设置页面配置')

  const systemPrompt = getSystemPrompt(scene)

  if (config.provider === 'anthropic') {
    return callAnthropic(config, systemPrompt, userMessage)
  } else {
    return callOpenAICompatible(config, systemPrompt, userMessage)
  }
}

/**
 * 调用 AI —— 图片场景
 */
export async function callAIWithImage(scene: AIScene, imageBase64: string, mimeType: string, userMessage?: string, teacherId?: string): Promise<string> {
  let config: AIConfig | null = null
  if (teacherId) {
    config = await readConfigForTeacher(teacherId)
  }
  if (!config) throw new Error('AI API 尚未配置，请先在设置页面配置')

  const systemPrompt = getSystemPrompt(scene)
  const textMessage = userMessage || '请分析这张图片中的内容'

  if (config.provider === 'anthropic') {
    return callAnthropicWithImage(config, systemPrompt, imageBase64, mimeType, textMessage)
  } else {
    return callOpenAICompatibleWithImage(config, systemPrompt, imageBase64, mimeType, textMessage)
  }
}

// ========== OpenAI 兼容接口 ==========

async function callOpenAICompatible(config: AIConfig, systemPrompt: string, userMessage: string): Promise<string> {
  const baseUrl = config.baseUrl || 'https://api.openai.com/v1'
  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      model: config.model || 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
      temperature: 0.3,
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`AI 调用失败 (${response.status}): ${error.slice(0, 200)}`)
  }

  const data = await response.json()
  return data.choices[0].message.content
}

async function callOpenAICompatibleWithImage(config: AIConfig, systemPrompt: string, imageBase64: string, mimeType: string, userMessage: string): Promise<string> {
  const baseUrl = config.baseUrl || 'https://api.openai.com/v1'
  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      model: config.model || 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        {
          role: 'user',
          content: [
            { type: 'text', text: userMessage },
            { type: 'image_url', image_url: { url: `data:${mimeType};base64,${imageBase64}` } },
          ],
        },
      ],
      temperature: 0.3,
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`AI 调用失败 (${response.status}): ${error.slice(0, 200)}`)
  }

  const data = await response.json()
  return data.choices[0].message.content
}

// ========== Anthropic 接口 ==========

async function callAnthropic(config: AIConfig, systemPrompt: string, userMessage: string): Promise<string> {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': config.apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: config.model || 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      system: systemPrompt,
      messages: [
        { role: 'user', content: userMessage },
      ],
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`AI 调用失败 (${response.status}): ${error.slice(0, 200)}`)
  }

  const data = await response.json()
  return data.content[0].text
}

async function callAnthropicWithImage(config: AIConfig, systemPrompt: string, imageBase64: string, mimeType: string, userMessage: string): Promise<string> {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': config.apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: config.model || 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: userMessage },
            { type: 'image', source: { type: 'base64', media_type: mimeType, data: imageBase64 } },
          ],
        },
      ],
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`AI 调用失败 (${response.status}): ${error.slice(0, 200)}`)
  }

  const data = await response.json()
  return data.content[0].text
}
