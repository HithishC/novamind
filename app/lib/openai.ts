import OpenAI from "openai";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
if (!OPENAI_API_KEY) {
  throw new Error("OPENAI_API_KEY is not defined in .env");
}
export const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

/**
 * Stream a chat completion from GPT‑4o.
 * @param messages - array of OpenAI chat messages (role/content)
 * @param systemPrompt - optional system prompt; defaults to a helpful voice assistant.
 * @returns ReadableStream of the response.
 */
export async function chatWithOpenAI(
  messages: OpenAI.Chat.ChatCompletionMessageParam[],
  systemPrompt = "You are a helpful personal voice assistant."
): Promise<ReadableStream> {
  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [{ role: "system", content: systemPrompt }, ...messages],
    stream: true,
  });
  // The SDK returns a special object; convert to a standard ReadableStream.
  // @ts-ignore – the SDK's type declaration does not expose toReadableStream.
  return (response as any).toReadableStream();
}

/**
 * Generate an image using DALL·E 3.
 * @param prompt - textual description of the image.
 * @returns URL of the generated image.
 */
export async function generateImage(prompt: string): Promise<string> {
  const resp = await openai.images.generate({
    model: "dall-e-3",
    prompt,
    size: "1024x1024",
    n: 1,
  });
  const url = resp.data?.[0]?.url;
  if (!url) {
    throw new Error("Failed to generate image via OpenAI");
  }
  return url;
}
