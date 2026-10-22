import { NextResponse } from 'next/server'
import { generateText, Output, type UserContent } from 'ai'
import { z } from 'zod'
import { geminiErrorMessage, isGeminiConfigured, withGeminiFallback } from '@/lib/ai/gemini'
import { recoveryAssessmentSchema } from '@/lib/ai/assessment'
import { requestClientKey, takeAiRequest } from '@/lib/ai/rate-limit'

export const runtime = 'nodejs'
export const maxDuration = 30

const requestSchema = z.object({
  description: z.string().trim().min(10).max(1500),
  image: z.string().max(4_200_000).refine((value) => /^data:image\/(jpeg|png|webp);base64,/.test(value), 'Unsupported image').optional(),
})

const SYSTEM_PROMPT = `You are Buzzel AI Rescue Copilot, assisting with UK roadside incidents.
Analyse only the information and optional vehicle photo supplied. Never invent damage, certainty, location, account data, dispatch status or an arrival time.
This is a preliminary operational assessment, not a mechanical diagnosis. Prefer cautious, plain-language descriptions.
If there is fire, smoke, fuel leakage, collision injury, danger from traffic, a submerged vehicle, or another immediate threat, set riskLevel to urgent, recommendedService to emergency_services, and put contacting the appropriate emergency service first in safetyActions.
Use roadside_assistance for issues likely serviceable safely at the location. Use vehicle_recovery when towing, a flatbed, specialist lifting or transport is likely required.
Only report visibleObservations that can genuinely be seen in the supplied photo. If there is no photo, return an empty visibleObservations array.
Keep safetyActions specific and short. Do not tell an untrained user to open a hot cooling system, touch damaged high-voltage components, crawl under a vehicle, or attempt roadside repairs in moving traffic.`

export async function POST(request: Request) {
  if (!isGeminiConfigured()) return NextResponse.json({ error: 'Buzzel AI has not been configured yet.' }, { status: 503 })
  if (!takeAiRequest(`assessment:${requestClientKey(request)}`, 10)) return NextResponse.json({ error: 'Too many AI assessments. Please wait a few minutes and try again.' }, { status: 429 })

  try {
    const parsed = requestSchema.safeParse(await request.json())
    if (!parsed.success) return NextResponse.json({ error: 'Describe the incident in at least 10 characters and use a JPEG, PNG or WebP image under 3 MB.' }, { status: 400 })

    const content: UserContent = [
      { type: 'text', text: `Customer description:\n${parsed.data.description}\n\nReturn a concise preliminary recovery assessment.` },
    ]
    if (parsed.data.image) content.push({ type: 'file', mediaType: parsed.data.image.slice(5, parsed.data.image.indexOf(';')), data: parsed.data.image })

    const { output } = await withGeminiFallback((model) => generateText({
      model,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content }],
      output: Output.object({ schema: recoveryAssessmentSchema }),
      maxOutputTokens: 900,
      temperature: 0.2,
      maxRetries: 0,
      timeout: 8_000,
    }))

    return NextResponse.json({ assessment: output })
  } catch (error) {
    console.error('Gemini recovery assessment failed after model fallbacks:', geminiErrorMessage(error))
    return NextResponse.json({ error: 'Buzzel AI could not complete the assessment. You can still continue with a standard recovery request.' }, { status: 503 })
  }
}
