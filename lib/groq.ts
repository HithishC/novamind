import Groq from 'groq-sdk'

function getGroqClient(): Groq {
  return new Groq({
    apiKey: process.env.GROQ_API_KEY || 'placeholder',
  })
}

export async function transcribeAudio(audioBlob: Blob): Promise<string> {
  const groq = getGroqClient()
  const arrayBuffer = await audioBlob.arrayBuffer()
  const uint8Array = new Uint8Array(arrayBuffer)
  const file = new File([uint8Array], 'audio.webm', { type: 'audio/webm' })

  const transcription = await groq.audio.transcriptions.create({
    file: file as any,
    model: 'whisper-large-v3',
    response_format: 'text',
  })

  return typeof transcription === 'string' ? transcription : ''
}

export default getGroqClient