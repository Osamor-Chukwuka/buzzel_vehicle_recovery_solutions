import { NextResponse } from 'next/server'
import { generateText, type ModelMessage } from 'ai'
import { z } from 'zod'
import { geminiErrorMessage, isGeminiConfigured, withGeminiFallback } from '@/lib/ai/gemini'
import { requestClientKey, takeAiRequest } from '@/lib/ai/rate-limit'

export const runtime = 'nodejs'
export const maxDuration = 30

const requestSchema = z.object({
  messages: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string().trim().min(1).max(800),
  })).min(1).max(10),
})

const SYSTEM_PROMPT = `You are Buzzel AI, the concise and calm assistant for Buzzel Vehicle Recovery Solutions.
Help visitors understand emergency recovery, roadside assistance, annual cover, payments and how to use the application.
Never claim to see a user's account, payment, live request, location or dispatch status. Direct signed-in users to the relevant page for those details.
Never claim that help has been dispatched. You may help the user begin at /emergency, explore annual cover at /coverage, or sign in at /auth/login.
If someone describes immediate danger, injury, fire, fuel leakage or danger from moving traffic, tell them to contact the appropriate emergency service first and move to safety if they can do so safely.
Do not provide risky repair instructions. Keep answers under 120 words, use plain text, and ask at most one useful follow-up question.`

export async function POST(request: Request) {
  if (!isGeminiConfigured()) return NextResponse.json({ error: 'Buzzel AI has not been configured yet.' }, { status: 503 })
  if (!takeAiRequest(`chat:${requestClientKey(request)}`, 20)) return NextResponse.json({ error: 'You have sent several messages quickly. Please wait a few minutes and try again.' }, { status: 429 })

  try {
    const parsed = requestSchema.safeParse(await request.json())
    if (!parsed.success) return NextResponse.json({ error: 'That message could not be processed.' }, { status: 400 })
    const messages: ModelMessage[] = parsed.data.messages.map((message) => ({ role: message.role, content: message.content }))
    const { text } = await withGeminiFallback((model) => generateText({
      model,
      system: SYSTEM_PROMPT,
      messages,
      maxOutputTokens: 320,
      temperature: 0.35,
      maxRetries: 0,
      timeout: 8_000,
    }))
    return NextResponse.json({ message: text.trim() })
  } catch (error) {
    console.error('Gemini chat failed after model fallbacks:', geminiErrorMessage(error))
    return NextResponse.json({ error: 'Buzzel AI is temporarily unavailable. You can still use the normal navigation or call support.' }, { status: 503 })
  }
}
