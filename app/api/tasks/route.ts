export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const SYSTEM_USER_ID = 'cm00000000000000000000000'

async function ensureUser() {
  const existing = await prisma.user.findFirst({ where: { email: 'system@novamind.ai' } })
  if (existing) return existing.id
  const user = await prisma.user.create({
    data: {
      id: SYSTEM_USER_ID,
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
    const tasks = await prisma.task.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    })
    return NextResponse.json(tasks)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const userId = await ensureUser()
    const { title, description, dueDate, source } = await req.json()
    const task = await prisma.task.create({
      data: {
        userId,
        title: title || 'Untitled Task',
        description: description || '',
        dueDate: dueDate ? new Date(dueDate) : null,
        source: source === 'VOICE' ? 'VOICE' : 'MANUAL',
      }
    })
    return NextResponse.json(task)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Failed to create task' }, { status: 500 })
  }
}