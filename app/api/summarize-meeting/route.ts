export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import Groq from 'groq-sdk'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

export async function POST(req: Request) {
  try {
    const { transcript, title } = await req.json()
    const completion = await groq.chat.completions.create({
      model: 'llama3-70b-8192',
      messages: [
        {
          role: 'system',
          content: `You are a meeting assistant. Given a meeting transcript, return ONLY a JSON object like:
{"summary":"2-3 sentence summary of the meeting","actionItems":["action 1","action 2","action 3"]}
No explanation, just the JSON.`
        },
        { role: 'user', content: `Meeting: ${title || 'Untitled'}\n\nTranscript:\n${transcript}` }
      ],
      max_tokens: 1024,
    })
    const raw = completion.choices[0].message.content || '{}'
    const clean = raw.replace(/```json|```/g, '').trim()
    const result = JSON.parse(clean)
    return NextResponse.json(result)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Failed to summarize' }, { status: 500 })
  }
}