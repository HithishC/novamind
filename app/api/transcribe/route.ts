export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import Groq from 'groq-sdk'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const audio = formData.get('audio') as File
    if (!audio) return NextResponse.json({ error: 'No audio' }, { status: 400 })
    const transcription = await groq.audio.transcriptions.create({
      file: audio,
      model: 'whisper-large-v3-turbo',
      language: 'en',
      response_format: 'json',
    })
    return NextResponse.json({ text: transcription.text })
  } catch (e: any) {
    console.error('Transcribe error:', e?.message || e)
    return NextResponse.json({ error: e?.message || 'Transcription failed' }, { status: 500 })
  }
}