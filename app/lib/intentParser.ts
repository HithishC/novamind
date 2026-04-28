import { chatWithOpenAI } from '@/lib/openai'

export interface Intent {
  type: 'task' | 'meeting' | 'image' | 'chat' | 'code' | 'unknown'
  title?: string
  description?: string
  date?: string
  participants?: string[]
  imagePrompt?: string
}

export async function parseIntent(transcript: string): Promise<Intent> {
  try {
    const messages = [{ role: 'user' as const, content: transcript }]
    const systemPrompt = 'Extract intent from voice input. Return JSON only, no markdown: { "type": "task"|"meeting"|"image"|"chat"|"code"|"unknown", "title": "...", "description": "...", "date": "...", "participants": [], "imagePrompt": "..." }'

    const response = await chatWithOpenAI(messages, systemPrompt)

    let fullText = ''
    for await (const chunk of response) {
      fullText += chunk.choices[0]?.delta?.content || ''
    }

    return JSON.parse(fullText) as Intent
  } catch {
    return { type: 'unknown' }
  }
}