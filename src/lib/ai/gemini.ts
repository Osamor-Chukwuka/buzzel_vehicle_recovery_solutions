import { createGoogle } from '@ai-sdk/google'

const DEFAULT_GEMINI_MODEL = 'gemini-3.8-flash'
const DEFAULT_FALLBACK_MODELS = ['gemini-3.5-flash-lite', 'gemini-3.6-flash']

export const GEMINI_MODEL = process.env.GEMINI_MODEL?.trim() || DEFAULT_GEMINI_MODEL

export function geminiModelIds() {
  const configuredFallbacks = process.env.GEMINI_FALLBACK_MODELS
    ?.split(',')
    .map((model) => model.trim())
    .filter(Boolean)

  return [...new Set([GEMINI_MODEL, ...(configuredFallbacks?.length ? configuredFallbacks : DEFAULT_FALLBACK_MODELS)])]
}

export function geminiModel(modelId = GEMINI_MODEL) {
  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY?.trim() || process.env.GEMINI_API_KEY?.trim()
  if (!apiKey) throw new Error('Gemini is not configured')
  return createGoogle({ apiKey })(modelId)
}

export function isGeminiConfigured() {
  return Boolean(process.env.GOOGLE_GENERATIVE_AI_API_KEY?.trim() || process.env.GEMINI_API_KEY?.trim())
}

function providerStatusCode(error: unknown, seen = new Set<unknown>()): number | undefined {
  if (!error || typeof error !== 'object' || seen.has(error)) return undefined
  seen.add(error)

  const candidate = error as { statusCode?: unknown; lastError?: unknown; cause?: unknown; errors?: unknown }
  if (typeof candidate.statusCode === 'number') return candidate.statusCode

  const nested = providerStatusCode(candidate.lastError, seen) ?? providerStatusCode(candidate.cause, seen)
  if (nested) return nested

  if (Array.isArray(candidate.errors)) {
    for (const item of candidate.errors) {
      const status = providerStatusCode(item, seen)
      if (status) return status
    }
  }

  return undefined
}

function canTryFallback(error: unknown) {
  const status = providerStatusCode(error)
  if (status === 404 || status === 408 || status === 409 || status === 429 || (status !== undefined && status >= 500)) return true
  if (error && typeof error === 'object' && (error as { isRetryable?: unknown }).isRetryable === true) return true

  const message = geminiErrorMessage(error).toLowerCase()
  return message.includes('timeout') || message.includes('timed out') || message.includes('aborted')
}

export function geminiErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Unknown Gemini provider error'
}

export async function withGeminiFallback<T>(operation: (model: ReturnType<typeof geminiModel>, modelId: string) => Promise<T>) {
  const modelIds = geminiModelIds()
  let lastError: unknown

  for (const [index, modelId] of modelIds.entries()) {
    try {
      return await operation(geminiModel(modelId), modelId)
    } catch (error) {
      lastError = error
      const nextModel = modelIds[index + 1]
      if (!nextModel || !canTryFallback(error)) throw error

      console.warn(`Gemini model ${modelId} is unavailable (${providerStatusCode(error) ?? 'provider error'}); trying ${nextModel}.`)
    }
  }

  throw lastError
}
