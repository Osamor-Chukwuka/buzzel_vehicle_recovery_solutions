'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { requireRole } from '@/lib/supabase/auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { writeAudit } from '@/lib/audit'

export async function updatePricingRuleAction(ruleId: string, formData: FormData) {
  const { user, profile } = await requireRole(['super_admin'])
  const parsed = z.object({
    roadside: z.coerce.number().min(0), recovery: z.coerce.number().min(0), annual: z.coerce.number().min(0), perKm: z.coerce.number().min(0),
  }).parse({ roadside: formData.get('roadside'), recovery: formData.get('recovery'), annual: formData.get('annual'), perKm: formData.get('perKm') })
  const supabase = createAdminClient()
  const { error } = await supabase.from('pricing_rules').update({
    roadside_base_minor: Math.round(parsed.roadside * 100), recovery_base_minor: Math.round(parsed.recovery * 100),
    annual_base_minor: Math.round(parsed.annual * 100), per_km_minor: Math.round(parsed.perKm * 100), updated_by: user.id,
  }).eq('id', ruleId)
  if (error) throw error
  await writeAudit({ actorUserId: user.id, actorRole: profile.role, action: 'pricing.updated', entityType: 'pricing_rule', entityId: ruleId, metadata: parsed })
  revalidatePath('/admin/settings')
  redirect('/admin/settings?success=Pricing+updated+successfully')
}

export async function addRiskAreaAction(formData: FormData) {
  const { user, profile } = await requireRole(['super_admin'])
  const parsed = z.object({ name: z.string().min(2), lat: z.coerce.number().min(-90).max(90), lng: z.coerce.number().min(-180).max(180), radius: z.coerce.number().positive(), fee: z.coerce.number().min(0) }).parse({ name: formData.get('name'), lat: formData.get('lat'), lng: formData.get('lng'), radius: formData.get('radius'), fee: formData.get('fee') })
  const supabase = createAdminClient()
  const { data, error } = await supabase.from('risk_areas').insert({ name: parsed.name, center_lat: parsed.lat, center_lng: parsed.lng, radius_km: parsed.radius, risk_level: 'high', security_fee_minor: Math.round(parsed.fee * 100), updated_by: user.id }).select().single()
  if (error) throw error
  await writeAudit({ actorUserId: user.id, actorRole: profile.role, action: 'risk_area.created', entityType: 'risk_area', entityId: data.id, metadata: parsed })
  revalidatePath('/admin/settings')
  redirect('/admin/settings?success=Risk+area+added+successfully')
}
