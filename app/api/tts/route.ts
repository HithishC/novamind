export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { synthesizeSpeech } from '@/lib/elevenlabs'

export async function POST(req: Request) {

  const { text } = await req.json()
  if (!text) return NextResponse.json({ error: 'Text is required' }, { status: 400 })

  const audioBuffer = await synthesizeSpeech(text)

  return new Response(audioBuffer, {
    headers: { 'Content-Type': 'audio/mpeg' }
  })
}