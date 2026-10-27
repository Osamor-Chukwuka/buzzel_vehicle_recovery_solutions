import { createAdminClient } from '@/lib/supabase/admin'
import { writeAudit } from '@/lib/audit'
import { annualCoverageDates } from '@/lib/domain/coverage'
import { sendUserEmail } from '@/lib/email/resend'
import { after } from 'next/server'

function sendReceiptInBackground(userId: string, subject: string, html: string) {
  after(async () => {
    try {
      await sendUserEmail(userId, subject, html)
    } catch (error) {
      console.error('Payment receipt email failed', error)
    }
  })
}

export async function finalizePayment(paymentId: string, providerPayload: Record<string, unknown> = {}) {
  const admin = createAdminClient()
  const { data: initialPayment, error: paymentError } = await admin.from('payments').select('*').eq('id', paymentId).single()
  let payment = initialPayment
  if (paymentError || !payment) throw paymentError ?? new Error('Payment not found')

  let newlyPaid = false
  if (payment.status !== 'paid') {
    const paidAt = new Date().toISOString()
    const { data: updatedPayment, error: updateError } = await admin
      .from('payments')
      .update({ status: 'paid', paid_at: paidAt, provider_payload: providerPayload })
      .eq('id', payment.id)
      .neq('status', 'paid')
      .select('*')
      .maybeSingle()
    if (updateError) throw updateError

    if (updatedPayment) {
      payment = updatedPayment
      newlyPaid = true
    } else {
      const { data: latestPayment, error: latestError } = await admin.from('payments').select('*').eq('id', payment.id).single()
      if (latestError || !latestPayment) throw latestError ?? new Error('Payment could not be reloaded')
      if (latestPayment.status !== 'paid') throw new Error('Payment could not be marked as paid')
      payment = latestPayment
    }
  }

  let repairedLinkedRecord = false

  if (payment.coverage_policy_id) {
    const { data: existingPolicy, error: policyLookupError } = await admin
      .from('coverage_policies')
      .select('account_id, status, ends_at')
      .eq('id', payment.coverage_policy_id)
      .single()
    if (policyLookupError || !existingPolicy) throw policyLookupError ?? new Error('Coverage policy not found')

    let policy = existingPolicy
    if (existingPolicy.status !== 'active') {
      const { startsAt, endsAt } = annualCoverageDates(new Date())
      const { data: activatedPolicy, error: activationError } = await admin
        .from('coverage_policies')
        .update({ status: 'active', starts_at: startsAt.toISOString(), ends_at: endsAt.toISOString() })
        .eq('id', payment.coverage_policy_id)
        .neq('status', 'active')
        .select('account_id, status, ends_at')
        .maybeSingle()
      if (activationError) throw activationError
      if (activatedPolicy) {
        policy = activatedPolicy
        repairedLinkedRecord = true
      } else {
        const { data: latestPolicy, error: latestPolicyError } = await admin
          .from('coverage_policies')
          .select('account_id, status, ends_at')
          .eq('id', payment.coverage_policy_id)
          .single()
        if (latestPolicyError || !latestPolicy || latestPolicy.status !== 'active') {
          throw latestPolicyError ?? new Error('Coverage policy could not be activated')
        }
        policy = latestPolicy
      }
    }

    if (policy) {
      const { data: account } = await admin.from('accounts').select('owner_user_id').eq('id', policy.account_id).single()
      if (account?.owner_user_id && (newlyPaid || repairedLinkedRecord)) {
        const endsAt = policy.ends_at ? new Date(policy.ends_at) : null
        const endDate = endsAt && Number.isFinite(endsAt.getTime()) ? endsAt.toLocaleDateString('en-GB') : 'the policy end date shown in your account'
        sendReceiptInBackground(account.owner_user_id, 'Your Buzzel annual cover is active', `<p>Your annual Buzzel vehicle cover is now active until <strong>${endDate}</strong>.</p>`)
      }
    }
  }

  if (payment.request_id) {
    const { data: request } = await admin.from('service_requests').select('status, customer_user_id, reference').eq('id', payment.request_id).single()
    if (request?.status === 'awaiting_payment') {
      const { data: advancedRequest, error } = await admin
        .from('service_requests')
        .update({ status: 'ready_for_assignment' })
        .eq('id', payment.request_id)
        .eq('status', 'awaiting_payment')
        .select('id')
        .maybeSingle()
      if (error) throw error
      if (advancedRequest) {
        repairedLinkedRecord = true
        const { error: historyError } = await admin.from('request_status_history').insert({
          request_id: payment.request_id,
          from_status: 'awaiting_payment',
          to_status: 'ready_for_assignment',
          changed_by: null,
          note: 'Payment confirmed',
        })
        if (historyError) throw historyError
      }
    }
    if (request?.customer_user_id && (newlyPaid || repairedLinkedRecord)) sendReceiptInBackground(request.customer_user_id, 'Buzzel payment confirmed', `<p>Payment for request <strong>${request.reference}</strong> has been confirmed.</p>`)
  }

  if (newlyPaid || repairedLinkedRecord) {
    await writeAudit({
      action: newlyPaid ? 'payment.confirmed' : 'payment.reconciled', entityType: 'payment', entityId: payment.id,
      metadata: { kind: payment.kind, requestId: payment.request_id, coveragePolicyId: payment.coverage_policy_id },
    }).catch((error) => console.error('Payment audit write failed', error))
  }
  return payment
}
