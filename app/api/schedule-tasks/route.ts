export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import Groq from 'groq-sdk'
import { prisma } from '@/lib/prisma'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

async function ensureUser() {
  const existing = await prisma.user.findFirst({ where: { email: 'system@novamind.ai' } })
  if (existing) return existing.id
  const user = await prisma.user.create({
    data: { id: 'cm00000000000000000000000', email: 'system@novamind.ai', name: 'NovaMind User', passwordHash: 'none' }
  })
  return user.id
}

export async function POST(req: Request) {
  try {
    const { transcript } = await req.json()
    const userId = await ensureUser()
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: 'Extract tasks from the user description. Return ONLY a JSON array: [{"title":"task name","description":"details","dueDate":"2026-05-01T10:00:00"}]. Use null for dueDate if not mentioned. Return only the JSON array, nothing else.' },
        { role: 'user', content: transcript }
      ],
      max_tokens: 1024,
    })
    const raw = completion.choices[0].message.content || '[]'
    const clean = raw.replace(/```json|```/g, '').trim()
    const tasks = JSON.parse(clean)
    const saved = await Promise.all(tasks.map((t: any) =>
      prisma.task.create({
        data: { userId, title: t.title, description: t.description || '', dueDate: t.dueDate ? new Date(t.dueDate) : null, source: 'VOICE' }
      })
    ))
    return NextResponse.json({ tasks: saved })
  } catch (e: any) {
    console.error(e)
    return NextResponse.json({ error: e?.message || 'Failed' }, { status: 500 })
  }
}