import crypto from 'node:crypto'

export async function initializePaystack(input: {
  email: string
  amountMinor: number
  reference: string
  callbackUrl: string
  metadata: Record<string, unknown>
}) {
  const secret = process.env.PAYSTACK_SECRET_KEY
  if (!secret) return null
  const response = await fetch('https://api.paystack.co/transaction/initialize', {
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
  const response = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
    headers: { Authorization: `Bearer ${secret}` }, cache: 'no-store',
  })
  if (!response.ok) return null
  const data = await response.json()
  return data.data as { status: string; reference: string; amount: number; metadata?: Record<string, unknown> }
}
