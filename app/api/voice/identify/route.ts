export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { authOptions } from '@/lib/auth'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { transcribeAudio } from '@/lib/groq'

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const formData = await req.formData()
  const audioFile = formData.get('audio') as Blob

  const transcript = await transcribeAudio(audioFile)

  const profiles = await prisma.voiceProfile.findMany({
    include: { user: true }
  })

  return NextResponse.json({
    transcript,
    profiles: profiles.map(p => ({
      numericId: p.user.numericId,
      name: p.user.name,
      language: p.language
    }))
  })
}