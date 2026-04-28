export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const config = await prisma.userConfig.findUnique({
    where: { userId: (session.user as any).id }
  })

  return NextResponse.json(config)
}

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const data = await req.json()

  const config = await prisma.userConfig.upsert({
    where: { userId: (session.user as any).id },
    update: data,
    create: {
      userId: (session.user as any).id,
      ...data
    }
  })

  return NextResponse.json(config)
}