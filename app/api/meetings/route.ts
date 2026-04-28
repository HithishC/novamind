export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { chatWithOpenAI } from '@/lib/openai'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const meetings = await prisma.meeting.findMany({
    where: { userId: (session.user as any).id },
    orderBy: { createdAt: 'desc' }
  })

  return NextResponse.json(meetings)
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { title, participants, date, notes, transcript } = await req.json()

  let summary = ''
  let actionItems: string[] = []

  if (transcript) {
    try {
      const response = await chatWithOpenAI(
        [{ role: 'user', content: transcript }],
        'Extract a summary and action items from this meeting transcript. Return JSON only, no markdown: { "summary": "...", "actionItems": ["...", "..."] }'
      )

      let fullText = ''
      for await (const chunk of response) {
        fullText += chunk.choices[0]?.delta?.content || ''
      }

      const parsed = JSON.parse(fullText)
      summary = parsed.summary || ''
      actionItems = parsed.actionItems || []
    } catch {
      summary = ''
      actionItems = []
    }
  }

  const meeting = await prisma.meeting.create({
    data: {
      userId: (session.user as any).id,
      title,
      participants: participants || [],
      date: date ? new Date(date) : new Date(),
      notes: notes || '',
      transcript: transcript || '',
      summary,
      actionItems,
    }
  })

  return NextResponse.json(meeting)
}