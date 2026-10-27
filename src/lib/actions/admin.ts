'use server'

import crypto from 'node:crypto'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { requireRole } from '@/lib/supabase/auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { writeAudit } from '@/lib/audit'
import { sendEmail, sendUserEmail } from '@/lib/email/resend'
import { escapeHtml } from '@/lib/html'

export async function assignRequestAction(requestId: string, formData: FormData) {
  const { user, profile } = await requireRole(['admin', 'super_admin'])
  const teamMemberId = z.uuid().parse(formData.get('teamMemberId'))
  const admin = createAdminClient()
  const [{ data: request }, { data: team }] = await Promise.all([
    admin.from('service_requests').select('*').eq('id', requestId).single(),
    admin.from('profiles').select('id, role').eq('id', teamMemberId).single(),
  ])
  if (!request) throw new Error('Request not found')
  if (!team || team.role !== 'team') throw new Error('Selected user is not a recovery team member')
  if (!['ready_for_assignment', 'assigned'].includes(request.status)) throw new Error('Request is not ready for assignment')

  if (request.assigned_team_member_id) {
    await admin.from('request_assignments').update({ unassigned_at: new Date().toISOString() }).eq('request_id', requestId).is('unassigned_at', null)
  }
  await admin.from('request_assignments').insert({ request_id: requestId, team_member_id: teamMemberId, assigned_by: user.id })
  const from = request.status
  const { error } = await admin.from('service_requests').update({ assigned_team_member_id: teamMemberId, status: 'assigned' }).eq('id', requestId)
  if (error) throw error
  await admin.from('request_status_history').insert({ request_id: requestId, from_status: from, to_status: 'assigned', changed_by: user.id, note: request.assigned_team_member_id ? 'Request reassigned' : 'Request assigned' })
  await writeAudit({ actorUserId: user.id, actorRole: profile.role, action: request.assigned_team_member_id ? 'request.reassigned' : 'request.assigned', entityType: 'service_request', entityId: requestId, metadata: { teamMemberId } })
  await Promise.all([
    sendUserEmail(request.customer_user_id, 'Your Buzzel recovery team has been assigned', `<p>A recovery team member has been assigned to request <strong>${request.reference}</strong>. You can follow the status and use the in-app chat.</p>`).catch(console.error),
    sendUserEmail(teamMemberId, 'New Buzzel job assigned', `<p>You have been assigned Buzzel request <strong>${request.reference}</strong>.</p>`).catch(console.error),
  ])
  revalidatePath(`/admin/requests/${requestId}`); revalidatePath('/admin/requests'); revalidatePath('/team')
  redirect(`/requests/${requestId}?success=Recovery+team+assignment+saved`)
}

export async function resolveDisputeAction(disputeId: string, formData: FormData) {
  const { user, profile } = await requireRole(['admin', 'super_admin'])
  const resolution = z.string().min(5).max(2000).parse(formData.get('resolution'))
  const nextStatus = z.enum(['in_progress', 'awaiting_customer_confirmation', 'completed', 'cancelled']).parse(formData.get('nextStatus'))
  const admin = createAdminClient()
  const { data: dispute } = await admin.from('disputes').select('*').eq('id', disputeId).single()
  if (!dispute || dispute.status === 'resolved') throw new Error('Open dispute not found')
  const { data: request } = await admin.from('service_requests').select('status').eq('id', dispute.request_id).single()
  if (!request) throw new Error('Request not found')
  const now = new Date().toISOString()
  await admin.from('disputes').update({ status: 'resolved', resolution_notes: resolution, resolved_by: user.id, resolved_at: now }).eq('id', disputeId)
  await admin.from('service_requests').update({ status: nextStatus }).eq('id', dispute.request_id)
  await admin.from('request_status_history').insert({ request_id: dispute.request_id, from_status: request.status, to_status: nextStatus, changed_by: user.id, note: `Dispute resolved: ${resolution}` })
  await writeAudit({ actorUserId: user.id, actorRole: profile.role, action: 'dispute.resolved', entityType: 'dispute', entityId: disputeId, reason: resolution, metadata: { requestId: dispute.request_id, nextStatus } })
  const { data: resolvedRequest } = await admin.from('service_requests').select('customer_user_id, assigned_team_member_id, reference').eq('id', dispute.request_id).single()
  if (resolvedRequest) {
    const recipients = [resolvedRequest.customer_user_id, resolvedRequest.assigned_team_member_id].filter(Boolean) as string[]
    await Promise.all(recipients.map((id) => sendUserEmail(id, 'Buzzel dispute resolved', `<p>The dispute on request <strong>${resolvedRequest.reference}</strong> has been resolved.</p><p>${escapeHtml(resolution)}</p>`).catch(console.error)))
  }
  revalidatePath('/admin/disputes'); revalidatePath(`/requests/${dispute.request_id}`)
  redirect('/admin/disputes?success=Dispute+resolved+successfully')
}

export async function inviteTeamMemberAction(formData: FormData) {
  const { user, profile } = await requireRole(['admin', 'super_admin'])
  const parsed = z.object({ email: z.email(), role: z.enum(['team', 'admin']) }).parse({ email: formData.get('email'), role: formData.get('role') })
  if (parsed.role === 'admin' && profile.role !== 'super_admin') throw new Error('Only a Super Admin can invite another Admin')

  const token = crypto.randomBytes(32).toString('hex')
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex')
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  const admin = createAdminClient()
  const { data: invitation, error } = await admin.from('team_invitations').insert({
    email: parsed.email.toLowerCase(), invited_role: parsed.role, token_hash: tokenHash,
    invited_by: user.id, expires_at: expiresAt.toISOString(),
  }).select().single()
  if (error) throw error

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const inviteUrl = `${appUrl}/auth/signup?invite=${encodeURIComponent(token)}&email=${encodeURIComponent(parsed.email)}`
  try {
    await sendEmail({
      to: parsed.email,
      subject: 'You have been invited to Buzzel',
      html: `<p>You have been invited to join Buzzel as <strong>${parsed.role}</strong>.</p><p><a href="${inviteUrl}">Accept invitation</a></p><p>This invite expires in 7 days.</p>`,
    })
  } catch (deliveryError) {
    await admin.from('team_invitations').update({ status: 'revoked' }).eq('id', invitation.id)
    console.error('Team invitation delivery failed', deliveryError)
    redirect('/admin/team?error=The+invitation+could+not+be+sent.+Check+the+email+configuration+and+try+again')
  }
  await writeAudit({ actorUserId: user.id, actorRole: profile.role, action: 'team.invited', entityType: 'team_invitation', entityId: invitation.id, metadata: { email: parsed.email, role: parsed.role } })
  revalidatePath('/admin/team')
  redirect('/admin/team?success=Invitation+sent+successfully')
}

export async function requestSecurityAction(requestId: string, formData: FormData) {
  const { user, profile } = await requireRole(['team', 'admin', 'super_admin'])
  const reason = z.string().min(3).max(500).parse(formData.get('reason'))
  const admin = createAdminClient()
  const { data: request } = await admin.from('service_requests').select('*').eq('id', requestId).single()
  if (!request) throw new Error('Request not found')
  if (profile.role === 'team' && request.assigned_team_member_id !== user.id) throw new Error('This job is not assigned to you')
  const { data: securityRequest, error } = await admin.from('security_requests').insert({ request_id: requestId, requested_by: user.id, reason }).select().single()
  if (error) throw error
  await writeAudit({ actorUserId: user.id, actorRole: profile.role, action: 'security.requested', entityType: 'security_request', entityId: securityRequest.id, metadata: { requestId } })
  revalidatePath(`/requests/${requestId}`)
  redirect(`/requests/${requestId}?success=Security+request+submitted`)
}

export async function reviewSecurityAction(securityRequestId: string, approved: boolean) {
  const { user, profile } = await requireRole(['admin', 'super_admin'])
  const admin = createAdminClient()
  const { data: securityRequest } = await admin.from('security_requests').select('*, service_requests(*)').eq('id', securityRequestId).single()
  if (!securityRequest || securityRequest.status !== 'requested') throw new Error('Security request not found')
  const request = securityRequest.service_requests
  await admin.from('security_requests').update({ status: approved ? 'approved' : 'declined', reviewed_by: user.id, reviewed_at: new Date().toISOString() }).eq('id', securityRequestId)
  if (approved) {
    await admin.from('service_requests').update({ security_required: true, security_source: 'team' }).eq('id', request.id)
    // Annual coverage includes security; no additional payment is created for covered requests.
    if (!request.covered_at_request) {
      const { data: riskArea } = await admin.from('risk_areas').select('security_fee_minor').eq('active', true).order('security_fee_minor', { ascending: false }).limit(1).maybeSingle()
      const fee = Number(riskArea?.security_fee_minor ?? 2_500_000)
      await admin.from('service_requests').update({ security_fee_minor: fee, amount_due_minor: Number(request.amount_due_minor) + fee }).eq('id', request.id)
      const reference = `BUZ-SEC-${crypto.randomUUID().replaceAll('-', '').slice(0, 16).toUpperCase()}`
      await admin.from('payments').insert({ account_id: request.account_id, request_id: request.id, kind: 'security_surcharge', provider: 'paystack', provider_reference: reference, amount_minor: fee, currency: request.currency, status: 'pending' })
    }
  }
  await writeAudit({ actorUserId: user.id, actorRole: profile.role, action: approved ? 'security.approved' : 'security.declined', entityType: 'security_request', entityId: securityRequestId, metadata: { requestId: request.id } })
  await sendUserEmail(request.customer_user_id, approved ? 'Security support approved for your Buzzel request' : 'Security support update for your Buzzel request', approved && !request.covered_at_request ? `<p>Security support was approved for request <strong>${request.reference}</strong>. An additional security payment is now available in your request.</p>` : `<p>Security support for request <strong>${request.reference}</strong> has been ${approved ? 'approved and is included in your annual cover' : 'declined'}.</p>`).catch(console.error)
  revalidatePath(`/admin/requests/${request.id}`); revalidatePath(`/requests/${request.id}`)
  redirect(`/requests/${request.id}?success=${approved ? 'Security+request+approved' : 'Security+request+declined'}`)
}


export async function updateStaffRoleAction(staffUserId: string, formData: FormData) {
  const { user, profile } = await requireRole(['super_admin'])
  if (staffUserId === user.id) throw new Error('You cannot change your own Super Admin role here')
  const role = z.enum(['team', 'admin']).parse(formData.get('role'))
  const admin = createAdminClient()
  const { data: target } = await admin.from('profiles').select('id, role, full_name').eq('id', staffUserId).single()
  if (!target || target.role === 'super_admin' || target.role === 'customer') throw new Error('This staff role cannot be changed here')
  const previousRole = target.role
  const { error } = await admin.from('profiles').update({ role }).eq('id', staffUserId)
  if (error) throw error
  await writeAudit({ actorUserId: user.id, actorRole: profile.role, action: 'staff.role_changed', entityType: 'profile', entityId: staffUserId, metadata: { from: previousRole, to: role } })
  await sendUserEmail(staffUserId, 'Your Buzzel staff role was updated', `<p>Your Buzzel role is now <strong>${role}</strong>.</p>`).catch(console.error)
  revalidatePath('/admin/team')
  redirect('/admin/team?success=Staff+role+updated+successfully')
}
