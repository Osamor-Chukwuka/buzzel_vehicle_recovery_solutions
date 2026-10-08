'use server'

import { redirect } from 'next/navigation'
import { requireUser } from '@/lib/supabase/auth'
import { createClient } from '@/lib/supabase/server'
import { initializePaystack } from '@/lib/payments/paystack'
import { finalizePayment } from '@/lib/payments/finalize'

export async function beginPaymentAction(paymentId: string) {
  const user = await requireUser()
  const supabase = await createClient()
  const { data: payment } = await supabase.from('payments').select('*').eq('id', paymentId).single()
  if (!payment) throw new Error('Payment not found')
  if (payment.status === 'paid') redirect('/dashboard')

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const paystack = await initializePaystack({
    email: user.email || 'customer@example.com', amountMinor: Number(payment.amount_minor), reference: payment.provider_reference,
    callbackUrl: `${appUrl}/payments/callback`, metadata: { paymentId: payment.id, kind: payment.kind },
  })
  if (!paystack) { redirect(`/payments/${paymentId}/demo`); throw new Error('Redirecting to demo payment') }
  redirect(paystack.authorization_url)
}

export async function completeDemoPaymentAction(paymentId: string) {
  const user = await requireUser()
  const supabase = await createClient()
  const { data: payment } = await supabase.from('payments').select('id, status').eq('id', paymentId).single()
  if (!payment) throw new Error('Payment not found')
  if (process.env.BUZZEL_DEMO_MODE !== 'true') throw new Error('Demo payments are disabled')
  await finalizePayment(payment.id, { source: 'demo', confirmedBy: user.id })
  redirect('/dashboard?payment=success')
}
