export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { chatWithOpenAI } from '@/lib/openai'
import Groq from 'groq-sdk'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY || 'placeholder' })

export async function POST(req: Request) {
  const { message, model, history } = await req.json()

  const messages = [
    ...history,
    { role: 'user', content: message }
  ]

  const systemPrompt = 'You are a helpful personal voice assistant.'

  if (model === 'groq') {
    const response = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages
      ],
      stream: true,
    })

    const stream = new ReadableStream({
      async start(controller) {
        for await (const chunk of response) {
          const text = chunk.choices[0]?.delta?.content || ''
          if (text) controller.enqueue(new TextEncoder().encode(text))
        }
        controller.close()
      }
    })

    return new Response(stream, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' }
    })
  }

  const response = await chatWithOpenAI(messages, systemPrompt)

  const stream = new ReadableStream({
    async start(controller) {
      for await (const chunk of response) {
        const text = chunk.choices[0]?.delta?.content || ''
        if (text) controller.enqueue(new TextEncoder().encode(text))
      }
      controller.close()
    }
  })

  return new Response(stream, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' }
  })
}