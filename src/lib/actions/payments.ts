'use server'

import { redirect } from 'next/navigation'
import { requireUser } from '@/lib/supabase/auth'
import { createClient } from '@/lib/supabase/server'
import { initializePaystack, matchesPaystackRequestedAmount, verifyPaystackTransaction } from '@/lib/payments/paystack'
import { finalizePayment } from '@/lib/payments/finalize'

export async function beginPaymentAction(paymentId: string) {
  const user = await requireUser()
  const supabase = await createClient()
  const { data: payment, error: paymentError } = await supabase.from('payments').select('*').eq('id', paymentId).single()
  if (paymentError || !payment) {
    console.error('Payment lookup failed before Paystack initialization', { paymentId, error: paymentError })
    redirect(`/payments/${paymentId}?error=${encodeURIComponent('We could not load this payment. Please refresh the page and try again.')}`)
  }
  if (payment.status === 'paid') redirect('/dashboard')

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  let paystack: Awaited<ReturnType<typeof initializePaystack>>
  try {
    paystack = await initializePaystack({
      email: user.email || 'customer@example.com', amountMinor: Number(payment.amount_minor), reference: payment.provider_reference,
      callbackUrl: `${appUrl}/payments/callback`, metadata: { paymentId: payment.id, kind: payment.kind },
    })
  } catch (error) {
    console.error('Paystack initialization failed', {
      paymentId: payment.id,
      providerReference: payment.provider_reference,
      error: error instanceof Error ? error.message : error,
    })
    redirect(`/payments/${payment.id}?error=${encodeURIComponent('Paystack is temporarily unavailable. No charge was made. Please try again or contact Buzzel support.')}`)
  }

  if (!paystack) {
    if (process.env.BUZZEL_DEMO_MODE === 'true') redirect(`/payments/${paymentId}/demo`)
    console.error('Paystack initialization is not configured', { paymentId: payment.id })
    redirect(`/payments/${payment.id}?error=${encodeURIComponent('Online payment is not configured right now. No charge was made. Please contact Buzzel support.')}`)
  }
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

export async function confirmPaymentAction(paymentId: string) {
  await requireUser()
  const supabase = await createClient()
  const { data: payment } = await supabase.from('payments').select('*').eq('id', paymentId).single()
  if (!payment) throw new Error('Payment not found')
  if (payment.status === 'paid') redirect('/dashboard?payment=success')

  let verified: Awaited<ReturnType<typeof verifyPaystackTransaction>>
  try {
    verified = await verifyPaystackTransaction(payment.provider_reference)
  } catch (error) {
    console.error('Manual Paystack verification failed', { paymentId: payment.id, error })
    redirect(`/payments/${payment.id}?error=${encodeURIComponent('We could not confirm the payment just yet. Please wait a moment and try again.')}`)
  }

  if (verified?.status !== 'success' || !matchesPaystackRequestedAmount(verified, Number(payment.amount_minor))) {
    redirect(`/payments/${payment.id}?error=${encodeURIComponent('Paystack is still confirming this payment. Please wait a moment, then check again.')}`)
  }

  try {
    await finalizePayment(payment.id, { source: 'manual_paystack_verification', ...verified })
  } catch (error) {
    console.error('Manual payment finalization failed', { paymentId: payment.id, error })
    redirect(`/payments/${payment.id}?error=${encodeURIComponent('Your payment was received, but we could not update your Buzzel account yet. Please try again shortly.')}`)
  }

  redirect('/dashboard?payment=success')
}
