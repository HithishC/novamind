export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import Groq from 'groq-sdk'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

export async function POST(req: Request) {
  try {
    const { message, history = [] } = await req.json()
    const messages = [
      { role: 'system', content: 'You are NovaMind, a helpful AI voice assistant. Keep responses concise and clear.' },
      ...history,
      { role: 'user', content: message }
    ]
    const stream = await groq.chat.completions.create({
      model: 'llama3-70b-8192',
      messages,
      stream: true,
      max_tokens: 1024,
    })
    const encoder = new TextEncoder()
    const readable = new ReadableStream({
      async start(controller) {
        for await (const chunk of stream) {
          const text = chunk.choices[0]?.delta?.content || ''
          controller.enqueue(encoder.encode(text))
        }
        controller.close()
      }
    })
    return new Response(readable, { headers: { 'Content-Type': 'text/plain' } })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Chat failed' }, { status: 500 })
  }
}