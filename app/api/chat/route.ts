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
      {
        role: 'system' as const,
        content: `You are NovaMind, an advanced AI assistant built on LLaMA 3.3 70B. You are highly intelligent, articulate, and thoughtful.

Your behavior:
- Engage deeply with any topic: coding, science, philosophy, math, creative writing, analysis, reasoning
- Give thorough, well-structured answers when the question deserves it
- Be concise when the question is simple
- Think step by step for complex problems and show your reasoning
- Use markdown formatting: headers, bullet points, code blocks where appropriate
- Never refuse to engage with intellectual topics
- Have a personality: curious, direct, confident but not arrogant
- Remember the full conversation context and refer back to it naturally
- If asked to write code, write complete working code with explanations
- If asked to analyze something, be thorough and nuanced

You are not a simple voice assistant. You are a full reasoning AI capable of handling anything.`
      },
      ...history,
      { role: 'user' as const, content: message }
    ]
    const stream = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages,
      stream: true,
      max_tokens: 4096,
      temperature: 0.7,
      top_p: 0.9,
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