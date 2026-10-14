import { NextResponse } from 'next/server'
import { matchesPaystackRequestedAmount, verifyPaystackSignature } from '@/lib/payments/paystack'
import { createAdminClient } from '@/lib/supabase/admin'
import { finalizePayment } from '@/lib/payments/finalize'

export async function POST(request: Request) {
  const raw = await request.text()
  if (!verifyPaystackSignature(raw, request.headers.get('x-paystack-signature'))) return new NextResponse('Invalid signature', { status: 401 })
  const event = JSON.parse(raw)
  if (event.event !== 'charge.success') return NextResponse.json({ received: true })
  const reference = event.data?.reference
  const admin = createAdminClient()
  const { data: payment } = await admin.from('payments').select('id, amount_minor').eq('provider_reference', reference).maybeSingle()
  if (!payment || !matchesPaystackRequestedAmount(event.data ?? {}, Number(payment.amount_minor))) return new NextResponse('Payment mismatch', { status: 400 })
  await finalizePayment(payment.id, event.data ?? {})
  return NextResponse.json({ received: true })
}
