import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

export async function analyzeAssignment(imageBase64: string, assignmentType: string) {
  const message = await client.messages.create({
    model: 'claude-opus-4-20250514',
    max_tokens: 4096,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'image',
            source: {
              type: 'base64',
              media_type: 'image/jpeg',
              data: imageBase64,
            },
          },
          {
            type: 'text',
            text: `请分析这份${assignmentType}作业，提取以下信息：
1. 学生姓名
2. 题目列表（题号、题目内容、学生答案、正确答案、是否正确）
3. 总分和得分
4. 错误类型分类（计算错误、概念理解错误、粗心大意等）
5. 知识点掌握情况

请以JSON格式返回结果。`,
          },
        ],
      },
    ],
  })

  return message.content[0].type === 'text' ? message.content[0].text : null
}

export async function generateStudentReport(studentData: any) {
  const message = await client.messages.create({
    model: 'claude-opus-4-20250514',
    max_tokens: 2048,
    messages: [
      {
        role: 'user',
        content: `基于以下学生数据，生成个性化学习报告：
${JSON.stringify(studentData, null, 2)}

请包含：
1. 整体表现总结
2. 优势知识点
3. 薄弱知识点
4. 学习建议
5. 针对性练习推荐`,
      },
    ],
  })

  return message.content[0].type === 'text' ? message.content[0].text : null
}
