import OpenAI from 'openai'

let _openai: OpenAI | null = null

function getOpenAIClient(): OpenAI {
  if (!_openai) {
    _openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY || 'placeholder',
    })
  }
  return _openai
}

export async function chatWithOpenAI(messages: any[], systemPrompt: string) {
  const openai = getOpenAIClient()
  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: systemPrompt },
      ...messages
    ],
    stream: true,
  })
  return response
}

export async function generateImage(prompt: string) {
  const openai = getOpenAIClient()
  const response = await openai.images.generate({
    model: 'dall-e-3',
    prompt,
    size: '1024x1024',
    n: 1,
  })
  return response.data?.[0]?.url ?? ''
}

export default getOpenAIClient