import { createAdminClient } from '@/lib/supabase/admin'
import { writeAudit } from '@/lib/audit'
import { annualCoverageDates } from '@/lib/domain/coverage'
import { sendUserEmail } from '@/lib/email/resend'

export async function finalizePayment(paymentId: string, providerPayload: Record<string, unknown> = {}) {
  const admin = createAdminClient()
  const { data: payment, error: paymentError } = await admin.from('payments').select('*').eq('id', paymentId).single()
  if (paymentError || !payment) throw paymentError ?? new Error('Payment not found')
  if (payment.status === 'paid') return payment

  const paidAt = new Date().toISOString()
  const { error: updateError } = await admin.from('payments').update({ status: 'paid', paid_at: paidAt, provider_payload: providerPayload }).eq('id', payment.id)
  if (updateError) throw updateError

  if (payment.coverage_policy_id) {
    const { startsAt, endsAt } = annualCoverageDates(new Date())
    const { data: policy, error } = await admin.from('coverage_policies').update({
      status: 'active', starts_at: startsAt.toISOString(), ends_at: endsAt.toISOString(),
    }).eq('id', payment.coverage_policy_id).select('account_id').single()
    if (error) throw error
    if (policy) {
      const { data: account } = await admin.from('accounts').select('owner_user_id').eq('id', policy.account_id).single()
      if (account?.owner_user_id) await sendUserEmail(account.owner_user_id, 'Your Buzzel annual cover is active', `<p>Your annual Buzzel vehicle cover is now active until <strong>${endsAt.toLocaleDateString('en-GB')}</strong>.</p>`).catch(console.error)
    }
  }

  if (payment.request_id) {
    const { data: request } = await admin.from('service_requests').select('status, customer_user_id, reference').eq('id', payment.request_id).single()
    if (request?.status === 'awaiting_payment') {
      const { error } = await admin.from('service_requests').update({ status: 'ready_for_assignment' }).eq('id', payment.request_id)
      if (error) throw error
      await admin.from('request_status_history').insert({
        request_id: payment.request_id,
        from_status: 'awaiting_payment',
        to_status: 'ready_for_assignment',
        changed_by: null,
        note: 'Payment confirmed',
      })
    }
    if (request?.customer_user_id) await sendUserEmail(request.customer_user_id, 'Buzzel payment confirmed', `<p>Payment for request <strong>${request.reference}</strong> has been confirmed.</p>`).catch(console.error)
  }

  await writeAudit({
    action: 'payment.confirmed', entityType: 'payment', entityId: payment.id,
    metadata: { kind: payment.kind, requestId: payment.request_id, coveragePolicyId: payment.coverage_policy_id },
  })
  return { ...payment, status: 'paid', paid_at: paidAt }
}
