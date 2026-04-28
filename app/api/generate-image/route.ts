export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { generateImage } from '@/lib/openai'

export async function POST(req: Request) {

  const { prompt } = await req.json()
  if (!prompt) return NextResponse.json({ error: 'Prompt is required' }, { status: 400 })

  const imageUrl = await generateImage(prompt)
  return NextResponse.json({ imageUrl })
}