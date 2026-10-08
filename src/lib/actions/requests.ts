'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { requireUser, getProfile, requireRole } from '@/lib/supabase/auth'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getCurrentAccount } from '@/lib/queries/account'
import { getActiveCoverageForVehicle } from '@/lib/queries/coverage'
import { calculateOneOffQuote, FALLBACK_PRICING } from '@/lib/domain/pricing'
import { assessRisk, haversineKm } from '@/lib/domain/risk'
import { geocodeAddress } from '@/lib/maps/geocode'
import { sendUserEmail } from '@/lib/email/resend'
import { assertTransition } from '@/lib/domain/status'
import type { RequestStatus, RiskLevel, ServiceType, VehicleType } from '@/lib/types'
import { writeAudit } from '@/lib/audit'

const createSchema = z.object({
  vehicleId: z.uuid(),
  serviceType: z.enum(['roadside_assistance', 'vehicle_recovery']),
  breakdownAddress: z.string().min(3),
  breakdownLat: z.coerce.number().min(-90).max(90).optional(),
  breakdownLng: z.coerce.number().min(-180).max(180).optional(),
  destinationAddress: z.string().optional(),
  destinationLat: z.coerce.number().min(-90).max(90).optional(),
  destinationLng: z.coerce.number().min(-180).max(180).optional(),
  assistanceDetails: z.string().max(1000).optional(),
})

function optionalNumber(value: FormDataEntryValue | null) {
  if (value === null || String(value).trim() === '') return undefined
  return Number(value)
}

export async function createRequestAction(formData: FormData) {
  const user = await requireUser()
  const profile = await getProfile(user.id)
  const account = await getCurrentAccount(user.id)
  if (!account) throw new Error('No account found')

  const parsed = createSchema.safeParse({
    vehicleId: formData.get('vehicleId'), serviceType: formData.get('serviceType'),
    breakdownAddress: formData.get('breakdownAddress'), breakdownLat: optionalNumber(formData.get('breakdownLat')),
    breakdownLng: optionalNumber(formData.get('breakdownLng')), destinationAddress: formData.get('destinationAddress') || undefined,
    destinationLat: optionalNumber(formData.get('destinationLat')), destinationLng: optionalNumber(formData.get('destinationLng')),
    assistanceDetails: formData.get('assistanceDetails') || undefined,
  })
  if (!parsed.success) redirect('/requests/new?error=Please+check+the+request+details')
  if (parsed.data.serviceType === 'vehicle_recovery' && !parsed.data.destinationAddress?.trim()) {
    redirect('/requests/new?error=Recovery+destination+is+required')
  }

  const supabase = await createClient()
  const { data: vehicle } = await supabase.from('vehicles').select('*').eq('id', parsed.data.vehicleId).eq('account_id', account.id).eq('is_active', true).maybeSingle()
  if (!vehicle) redirect('/requests/new?error=Vehicle+not+found')

  const coverage = await getActiveCoverageForVehicle(vehicle.id)
  const covered = Boolean(coverage)

  const { data: ruleRow } = await supabase.from('pricing_rules').select('*').eq('vehicle_type', vehicle.vehicle_type).eq('active', true).maybeSingle()
  const rule = ruleRow ? {
    vehicleType: vehicle.vehicle_type as VehicleType,
    roadsideBaseMinor: Number(ruleRow.roadside_base_minor), recoveryBaseMinor: Number(ruleRow.recovery_base_minor),
    annualBaseMinor: Number(ruleRow.annual_base_minor), perKmMinor: Number(ruleRow.per_km_minor),
  } : FALLBACK_PRICING[vehicle.vehicle_type as VehicleType]

  const [breakdownGeocode, destinationGeocode] = await Promise.all([
    parsed.data.breakdownLat === undefined || parsed.data.breakdownLng === undefined ? geocodeAddress(parsed.data.breakdownAddress) : Promise.resolve(null),
    parsed.data.serviceType === 'vehicle_recovery' && parsed.data.destinationAddress && (parsed.data.destinationLat === undefined || parsed.data.destinationLng === undefined)
      ? geocodeAddress(parsed.data.destinationAddress) : Promise.resolve(null),
  ])
  const breakdownLat = parsed.data.breakdownLat ?? breakdownGeocode?.lat
  const breakdownLng = parsed.data.breakdownLng ?? breakdownGeocode?.lng
  const destinationLat = parsed.data.destinationLat ?? destinationGeocode?.lat
  const destinationLng = parsed.data.destinationLng ?? destinationGeocode?.lng
  const breakdownAddress = breakdownGeocode?.address || parsed.data.breakdownAddress.trim()
  const destinationAddress = destinationGeocode?.address || parsed.data.destinationAddress?.trim() || null

  const { data: riskRows } = await supabase.from('risk_areas').select('*').eq('active', true)
  const lat = breakdownLat
  const lng = breakdownLng
  const risk = lat !== undefined && lng !== undefined
    ? assessRisk(lat, lng, (riskRows ?? []).map((area) => ({
      id: area.id, name: area.name, centerLat: Number(area.center_lat), centerLng: Number(area.center_lng),
      radiusKm: Number(area.radius_km), level: area.risk_level as RiskLevel, securityFeeMinor: Number(area.security_fee_minor),
    })))
    : { level: 'normal' as const, securityRequired: false, securityFeeMinor: 0, matchedArea: null }

  const distanceKm = breakdownLat !== undefined && breakdownLng !== undefined && destinationLat !== undefined && destinationLng !== undefined
    ? haversineKm(breakdownLat, breakdownLng, destinationLat, destinationLng)
    : 0

  const quote = calculateOneOffQuote({
    serviceType: parsed.data.serviceType as ServiceType, vehicleType: vehicle.vehicle_type as VehicleType,
    distanceKm, securityFeeMinor: covered ? 0 : risk.securityFeeMinor, rule,
  })
  const amountDue = covered ? 0 : quote.totalMinor
  const status: RequestStatus = amountDue > 0 ? 'awaiting_payment' : 'ready_for_assignment'

  const admin = createAdminClient()
  const { data: request, error } = await admin.from('service_requests').insert({
    account_id: account.id, customer_user_id: user.id, vehicle_id: vehicle.id,
    service_type: parsed.data.serviceType, status,
    breakdown_address: breakdownAddress, breakdown_lat: breakdownLat ?? null, breakdown_lng: breakdownLng ?? null,
    destination_address: destinationAddress, destination_lat: destinationLat ?? null, destination_lng: destinationLng ?? null,
    assistance_details: parsed.data.assistanceDetails?.trim() || null, distance_km: distanceKm,
    risk_level: risk.level, risk_area_id: risk.matchedArea?.id ?? null, security_required: risk.securityRequired,
    security_source: risk.securityRequired ? 'system' : null, security_fee_minor: covered ? 0 : risk.securityFeeMinor,
    covered_at_request: covered, coverage_policy_id: coverage?.id ?? null,
    quoted_amount_minor: quote.totalMinor, amount_due_minor: amountDue, currency: process.env.BUZZEL_CURRENCY || 'NGN',
  }).select().single()
  if (error) throw error

  await admin.from('request_status_history').insert({ request_id: request.id, from_status: null, to_status: status, changed_by: user.id, note: covered ? 'Active annual coverage validated' : 'One-off request created' })
  await writeAudit({ actorUserId: user.id, actorRole: profile?.role ?? 'customer', action: 'request.created', entityType: 'service_request', entityId: request.id, metadata: { covered, riskLevel: risk.level, amountDueMinor: amountDue } })

  if (amountDue > 0) {
    const reference = `BUZ-REQ-${crypto.randomUUID().replaceAll('-', '').slice(0, 16).toUpperCase()}`
    const { data: payment, error: paymentError } = await admin.from('payments').insert({
      account_id: account.id, request_id: request.id, kind: 'one_off_request', provider: 'paystack',
      provider_reference: reference, amount_minor: amountDue, currency: process.env.BUZZEL_CURRENCY || 'NGN', status: 'pending',
    }).select().single()
    if (paymentError) throw paymentError
    redirect(`/payments/${payment.id}`)
  }

  redirect(`/requests/${request.id}`)
}

export async function updateTeamStatusAction(requestId: string, nextStatus: RequestStatus) {
  const { user, profile } = await requireRole(['team', 'admin', 'super_admin'])
  const admin = createAdminClient()
  const { data: request, error } = await admin.from('service_requests').select('*').eq('id', requestId).single()
  if (error || !request) throw error ?? new Error('Request not found')
  if (profile.role === 'team' && request.assigned_team_member_id !== user.id) throw new Error('This job is not assigned to you')
  const { data: outstandingPayments } = await admin.from('payments').select('id, kind').eq('request_id', requestId).eq('status', 'pending')
  if (outstandingPayments?.some((payment) => payment.kind === 'security_surcharge')) {
    throw new Error('The approved security surcharge must be paid before this job can progress')
  }
  assertTransition(request.status as RequestStatus, nextStatus)
  if (nextStatus === 'completed') throw new Error('Team members cannot directly finalize a request')

  const update: Record<string, unknown> = { status: nextStatus }
  if (nextStatus === 'awaiting_customer_confirmation') update.team_completed_at = new Date().toISOString()
  const { error: updateError } = await admin.from('service_requests').update(update).eq('id', requestId)
  if (updateError) throw updateError
  await admin.from('request_status_history').insert({ request_id: requestId, from_status: request.status, to_status: nextStatus, changed_by: user.id })
  await writeAudit({ actorUserId: user.id, actorRole: profile.role, action: 'request.status_changed', entityType: 'service_request', entityId: requestId, metadata: { from: request.status, to: nextStatus } })
  if (request.customer_user_id !== user.id) {
    await sendUserEmail(request.customer_user_id, `Buzzel request update: ${nextStatus.replaceAll('_', ' ')}`, `<p>Your Buzzel request <strong>${request.reference}</strong> is now <strong>${nextStatus.replaceAll('_', ' ')}</strong>.</p>`).catch(console.error)
  }
  revalidatePath(`/requests/${requestId}`); revalidatePath('/team')
  redirect(`/requests/${requestId}?success=${encodeURIComponent(`Status updated to ${nextStatus.replaceAll('_', ' ')}`)}`)
}

export async function confirmCompletionAction(requestId: string) {
  const user = await requireUser()
  const profile = await getProfile(user.id)
  const admin = createAdminClient()
  const { data: request } = await admin.from('service_requests').select('*').eq('id', requestId).single()
  if (!request || request.customer_user_id !== user.id) throw new Error('Request not found')
  if (request.status !== 'awaiting_customer_confirmation') throw new Error('This request is not awaiting confirmation')
  const now = new Date().toISOString()
  await admin.from('service_requests').update({ status: 'completed', customer_confirmed_at: now }).eq('id', requestId)
  await admin.from('request_status_history').insert({ request_id: requestId, from_status: request.status, to_status: 'completed', changed_by: user.id, note: 'Customer confirmed completion' })
  await writeAudit({ actorUserId: user.id, actorRole: profile?.role ?? 'customer', action: 'request.customer_confirmed', entityType: 'service_request', entityId: requestId })
  if (request.assigned_team_member_id) await sendUserEmail(request.assigned_team_member_id, 'Buzzel job completed', `<p>The customer confirmed completion for request <strong>${request.reference}</strong>.</p>`).catch(console.error)
  revalidatePath(`/requests/${requestId}`)
  redirect(`/requests/${requestId}?success=Request+completion+confirmed`)
}

export async function adminCloseRequestAction(requestId: string, formData: FormData) {
  const { user, profile } = await requireRole(['admin', 'super_admin'])
  const reason = z.string().min(5).parse(formData.get('reason'))
  const admin = createAdminClient()
  const { data: request } = await admin.from('service_requests').select('status').eq('id', requestId).single()
  if (!request) throw new Error('Request not found')
  if (request.status !== 'awaiting_customer_confirmation') throw new Error('Admin close is only available after the team marks the work finished')
  const now = new Date().toISOString()
  await admin.from('service_requests').update({ status: 'completed', admin_closed_at: now, admin_closed_by: user.id, admin_close_reason: reason }).eq('id', requestId)
  await admin.from('request_status_history').insert({ request_id: requestId, from_status: request.status, to_status: 'completed', changed_by: user.id, note: `Admin override: ${reason}` })
  await writeAudit({ actorUserId: user.id, actorRole: profile.role, action: 'request.admin_closed', entityType: 'service_request', entityId: requestId, reason })
  revalidatePath(`/requests/${requestId}`); revalidatePath('/admin/requests')
  redirect(`/requests/${requestId}?success=Request+closed+successfully`)
}

export async function raiseDisputeAction(requestId: string, formData: FormData) {
  const user = await requireUser()
  const profile = await getProfile(user.id)
  const reason = z.string().min(3).max(120).parse(formData.get('reason'))
  const description = z.string().max(2000).optional().parse(formData.get('description') || undefined)
  const admin = createAdminClient()
  const { data: request } = await admin.from('service_requests').select('*').eq('id', requestId).single()
  if (!request || (request.customer_user_id !== user.id && request.assigned_team_member_id !== user.id)) throw new Error('You cannot dispute this request')
  const { data: dispute, error } = await admin.from('disputes').insert({ request_id: requestId, raised_by: user.id, reason, description: description ?? null }).select().single()
  if (error) throw error
  if (request.status !== 'disputed') {
    await admin.from('service_requests').update({ status: 'disputed' }).eq('id', requestId)
    await admin.from('request_status_history').insert({ request_id: requestId, from_status: request.status, to_status: 'disputed', changed_by: user.id, note: 'Dispute raised' })
  }
  await writeAudit({ actorUserId: user.id, actorRole: profile?.role ?? 'customer', action: 'dispute.raised', entityType: 'dispute', entityId: dispute.id, metadata: { requestId } })
  revalidatePath(`/requests/${requestId}`)
  redirect(`/requests/${requestId}?success=Dispute+submitted+for+review`)
}
