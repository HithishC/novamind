export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const meetings = await prisma.meeting.findMany({
      where: { userId: 'test-user' },
      orderBy: { createdAt: 'desc' }
    })
    return NextResponse.json(meetings)
  } catch (e) {
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const { title, transcript, summary, actionItems, participants, date } = await req.json()
    const meeting = await prisma.meeting.create({
      data: {
        userId: 'test-user',
        title,
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