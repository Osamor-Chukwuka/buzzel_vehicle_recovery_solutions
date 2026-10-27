'use server'

import { redirect } from 'next/navigation'
import { z } from 'zod'
import { requireRole } from '@/lib/supabase/auth'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getCurrentAccount } from '@/lib/queries/account'
import { calculateAnnualVehiclePrice, FALLBACK_PRICING } from '@/lib/domain/pricing'
import type { VehicleType } from '@/lib/types'
import type { PricingRule } from '@/lib/domain/pricing'
import { writeAudit } from '@/lib/audit'

const schema = z.object({ vehicleIds: z.array(z.uuid()).min(1) })

export async function createAnnualCoverageAction(formData: FormData) {
  const { user, profile } = await requireRole(['customer'])
  const account = await getCurrentAccount(user.id)
  if (!account) throw new Error('No account found')
  const parsed = schema.safeParse({ vehicleIds: formData.getAll('vehicleIds').map(String) })
  if (!parsed.success) redirect('/coverage?error=Select+at+least+one+vehicle')

  const supabase = await createClient()
  const { data: vehicles, error } = await supabase
    .from('vehicles').select('id, vehicle_type').in('id', parsed.data.vehicleIds).eq('account_id', account.id).eq('is_active', true)
  if (error || !vehicles || vehicles.length !== parsed.data.vehicleIds.length) redirect('/coverage?error=Invalid+vehicle+selection')

  const now = new Date().toISOString()
  const { data: existingCover } = await supabase
    .from('coverage_vehicles')
    .select('vehicle_id, coverage_policies!inner(status, starts_at, ends_at)')
    .in('vehicle_id', parsed.data.vehicleIds)
    .eq('coverage_policies.status', 'active')
    .lte('coverage_policies.starts_at', now)
    .gt('coverage_policies.ends_at', now)
  if (existingCover?.length) redirect('/coverage?error=One+or+more+selected+vehicles+already+have+active+cover')

  const { data: rules } = await supabase.from('pricing_rules').select('*').eq('active', true)
  const rulesMap = new Map<VehicleType, PricingRule>((rules ?? []).map((r) => [r.vehicle_type as VehicleType, {
    vehicleType: r.vehicle_type as VehicleType,
    roadsideBaseMinor: Number(r.roadside_base_minor), recoveryBaseMinor: Number(r.recovery_base_minor),
    annualBaseMinor: Number(r.annual_base_minor), perKmMinor: Number(r.per_km_minor),
  }]))
  const vehiclePrices = vehicles.map((vehicle) => ({
    vehicleId: vehicle.id,
    amountMinor: calculateAnnualVehiclePrice({
      vehicleType: vehicle.vehicle_type as VehicleType,
      rule: rulesMap.get(vehicle.vehicle_type as VehicleType) ?? FALLBACK_PRICING[vehicle.vehicle_type as VehicleType],
    }),
  }))
  const total = vehiclePrices.reduce((sum, row) => sum + row.amountMinor, 0)

  const admin = createAdminClient()
  const { data: policy, error: policyError } = await admin.from('coverage_policies').insert({
    account_id: account.id, status: 'pending', total_amount_minor: total,
    currency: process.env.BUZZEL_CURRENCY || 'NGN', created_by: user.id,
  }).select().single()
  if (policyError) throw policyError

  const { error: linksError } = await admin.from('coverage_vehicles').insert(vehiclePrices.map((row) => ({
    policy_id: policy.id, vehicle_id: row.vehicleId, annual_price_minor: row.amountMinor,
  })))
  if (linksError) throw linksError

  const reference = `BUZ-COV-${crypto.randomUUID().replaceAll('-', '').slice(0, 16).toUpperCase()}`
  const { data: payment, error: paymentError } = await admin.from('payments').insert({
    account_id: account.id, coverage_policy_id: policy.id, kind: 'annual_coverage', provider: 'paystack',
    provider_reference: reference, amount_minor: total, currency: process.env.BUZZEL_CURRENCY || 'NGN', status: 'pending',
  }).select().single()
  if (paymentError) throw paymentError

  await writeAudit({
    actorUserId: user.id, actorRole: profile?.role ?? 'customer', action: 'coverage.created',
    entityType: 'coverage_policy', entityId: policy.id,
    metadata: { vehicleIds: parsed.data.vehicleIds, totalAmountMinor: total },
  })
  redirect(`/payments/${payment.id}`)
}
