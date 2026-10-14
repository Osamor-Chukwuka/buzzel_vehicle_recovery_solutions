import crypto from 'node:crypto'

const PAYSTACK_REQUEST_TIMEOUT_MS = 8_000

export type PaystackTransaction = {
  status: string
  reference: string
  amount: number
  requested_amount?: number
  currency?: string
  metadata?: Record<string, unknown>
}

/**
 * Paystack's `amount` can include a channel fee (for example, bank transfers).
 * `requested_amount` is the amount the merchant initialized, so it is the
 * value that must match the amount recorded by Buzzel.
 */
export function matchesPaystackRequestedAmount(transaction: Pick<PaystackTransaction, 'amount' | 'requested_amount'>, expectedAmountMinor: number) {
  const requestedAmount = Number(transaction.requested_amount ?? transaction.amount)
  return Number.isFinite(requestedAmount) && requestedAmount === Number(expectedAmountMinor)
}

async function paystackFetch(url: string, init: RequestInit) {
  try {
    return await fetch(url, { ...init, signal: AbortSignal.timeout(PAYSTACK_REQUEST_TIMEOUT_MS) })
  } catch (error) {
    const message = error instanceof Error && error.name === 'TimeoutError'
      ? 'Paystack did not respond in time.'
      : 'Could not reach Paystack.'
    throw new Error(message, { cause: error })
  }
}

export async function initializePaystack(input: {
  email: string
  amountMinor: number
  reference: string
  callbackUrl: string
  metadata: Record<string, unknown>
}) {
  const secret = process.env.PAYSTACK_SECRET_KEY
  if (!secret) return null
  const response = await paystackFetch('https://api.paystack.co/transaction/initialize', {
    method: 'POST',
    headers: { Authorization: `Bearer ${secret}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: input.email,
      amount: input.amountMinor,
      currency: process.env.BUZZEL_CURRENCY || 'NGN',
      reference: input.reference,
      callback_url: input.callbackUrl,
      metadata: input.metadata,
    }),
    cache: 'no-store',
  })
  if (!response.ok) throw new Error(`Paystack initialization failed: ${await response.text()}`)
  const data = await response.json()
  return data.data as { authorization_url: string; access_code: string; reference: string }
}

export function verifyPaystackSignature(rawBody: string, signature: string | null) {
  const secret = process.env.PAYSTACK_SECRET_KEY
  if (!secret || !signature) return false
  const hash = crypto.createHmac('sha512', secret).update(rawBody).digest('hex')
  const expected = Buffer.from(hash)
  const received = Buffer.from(signature)
  if (expected.length !== received.length) return false
  return crypto.timingSafeEqual(expected, received)
}

export async function verifyPaystackTransaction(reference: string) {
  const secret = process.env.PAYSTACK_SECRET_KEY
  if (!secret) return null
  const response = await paystackFetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
    headers: { Authorization: `Bearer ${secret}` }, cache: 'no-store',
  })
  if (!response.ok) return null
  const data = await response.json()
  return data.data as PaystackTransaction
}
