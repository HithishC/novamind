export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

async function ensureUser() {
  const existing = await prisma.user.findFirst({ where: { email: 'system@novamind.ai' } })
  if (existing) return existing.id
  const user = await prisma.user.create({
    data: {
      id: 'cm00000000000000000000000',
      email: 'system@novamind.ai',
      name: 'NovaMind User',
      passwordHash: 'none',
    }
  })
  return user.id
}

export async function GET() {
  try {
    const userId = await ensureUser()
    const meetings = await prisma.meeting.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    })
    return NextResponse.json(meetings)
  } catch (e) {
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const userId = await ensureUser()
    const { title, transcript, summary, actionItems, participants, date } = await req.json()
    const meeting = await prisma.meeting.create({
      data: {
        userId,
        title: title || 'Untitled Meeting',
        transcript: transcript || '',
        summary: summary || '',
        actionItems: actionItems || [],
        participants: participants || [],
        date: date ? new Date(date) : new Date(),
      }
    })
    return NextResponse.json(meeting)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Failed to save' }, { status: 500 })
  }
}