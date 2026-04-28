export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const formData = await req.formData()
  const language = formData.get('language') as string || 'en-IN'
  const userId = (session.user as any).id

  const existing = await prisma.voiceProfile.findFirst({
    where: { userId }
  })

  if (existing) {
    await prisma.voiceProfile.update({
      where: { id: existing.id },
      data: { language }
    })
  } else {
    await prisma.voiceProfile.create({
      data: { userId, language }
    })
  }

  return NextResponse.json({ success: true })
}