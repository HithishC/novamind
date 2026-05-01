export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import Groq from 'groq-sdk'

export async function POST(req: Request) {
  try {
    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json({ error: 'GROQ_API_KEY not set' }, { status: 500 })
    }
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })
    const { message, history = [] } = await req.json()
    const messages = [
      { role: 'system' as const, content: 'You are NovaMind, a helpful AI voice assistant. Be concise and clear.' },
      ...history,
      { role: 'user' as const, content: message }
    ]
    const stream = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages,
      stream: true,
      max_tokens: 1024,
    })
    const encoder = new TextEncoder()
    const readable = new ReadableStream({
      async start(controller) {
        for await (const chunk of stream) {
          const text = chunk.choices[0]?.delta?.content || ''
          if (text) controller.enqueue(encoder.encode(text))
        }
        controller.close()
      }
    })
    return new Response(readable, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } })
  } catch (e: any) {
    console.error('Chat error:', e?.message || e)
    return NextResponse.json({ error: e?.message || 'Chat failed' }, { status: 500 })
  }
}
