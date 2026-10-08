import { createClient } from '@/lib/supabase/server'

export async function getActiveCoverageForVehicle(vehicleId: string) {
  const supabase = await createClient()
  const now = new Date().toISOString()
  const { data, error } = await supabase
    .from('coverage_vehicles')
    .select('policy_id, coverage_policies!inner(id, account_id, status, starts_at, ends_at, total_amount_minor, currency)')
    .eq('vehicle_id', vehicleId)
    .eq('coverage_policies.status', 'active')
    .lte('coverage_policies.starts_at', now)
    .gt('coverage_policies.ends_at', now)
    .limit(1)
    .maybeSingle()
  if (error) throw error
  return data?.coverage_policies ?? null
}
