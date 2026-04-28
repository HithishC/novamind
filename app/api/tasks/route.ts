export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const tasks = await prisma.task.findMany({
      where: { userId: 'test-user' },
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
    const { title, description, dueDate, source } = await req.json()
    const task = await prisma.task.create({
      data: {
        userId: 'test-user',
        title,
        description: description || '',
        dueDate: dueDate ? new Date(dueDate) : null,
        source: source || 'MANUAL',
      }
    })
    return NextResponse.json(task)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Failed to create task' }, { status: 500 })
  }
}