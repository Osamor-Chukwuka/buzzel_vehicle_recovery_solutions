import { redirect } from 'next/navigation'
import { requireUser } from '@/lib/supabase/auth'
import { createClient } from '@/lib/supabase/server'
import { matchesPaystackRequestedAmount, verifyPaystackTransaction } from '@/lib/payments/paystack'
import { finalizePayment } from '@/lib/payments/finalize'

function paymentPath(paymentId: string, error: string) {
  return `/payments/${paymentId}?error=${encodeURIComponent(error)}`
}

export default async function PaymentCallbackPage({ searchParams }: { searchParams: Promise<{ reference?: string }> }) {
  await requireUser()
  const { reference } = await searchParams
  if (!reference) throw new Error('Missing payment reference')

  const supabase = await createClient()
  const { data: payment } = await supabase.from('payments').select('*').eq('provider_reference', reference).maybeSingle()
  if (!payment) redirect('/dashboard?payment=failed')

  let verified: Awaited<ReturnType<typeof verifyPaystackTransaction>>
  try {
    verified = await verifyPaystackTransaction(reference)
  } catch (error) {
    console.error('Paystack verification failed', { paymentId: payment.id, reference, error })
    redirect(paymentPath(payment.id, 'We could not confirm the payment just yet. Please wait a moment and try again.'))
  }

  if (verified?.status !== 'success' || !matchesPaystackRequestedAmount(verified, Number(payment.amount_minor))) {
    redirect(paymentPath(payment.id, 'Paystack is still confirming this payment. Please wait a moment, then try again.'))
  }

  try {
    await finalizePayment(payment.id, { source: 'paystack_callback', ...verified })
  } catch (error) {
    console.error('Payment finalization failed', { paymentId: payment.id, reference, error })
    redirect(paymentPath(payment.id, 'Your payment was received, but we could not update your Buzzel account yet. Please try again shortly.'))
  }

  redirect('/dashboard?payment=success')
}
