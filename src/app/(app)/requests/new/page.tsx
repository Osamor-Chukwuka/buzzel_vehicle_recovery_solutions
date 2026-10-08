import { requireUser } from '@/lib/supabase/auth'
import { createClient } from '@/lib/supabase/server'
import { getCurrentAccount } from '@/lib/queries/account'
import { ensureCurrentTermsAccepted } from '@/lib/terms'
import { createRequestAction } from '@/lib/actions/requests'
import { Button, Card, EmptyState, ErrorNotice, LinkButton, PageHeader } from '@/components/ui'
import { RequestFormFields } from '@/components/request-form'
import { VEHICLE_LABELS } from '@/lib/constants'
import type { VehicleType } from '@/lib/types'

export default async function NewRequestPage({ searchParams }: { searchParams: Promise<{ error?: string; vehicle?: string; lat?: string; lng?: string }> }) {
  const user = await requireUser(); await ensureCurrentTermsAccepted(user.id)
  const account = await getCurrentAccount(user.id); if (!account) throw new Error('Account not found')
  const supabase = await createClient(); const { data: vehicles } = await supabase.from('vehicles').select('*').eq('account_id', account.id).eq('is_active', true).order('created_at')
  const { error, vehicle, lat, lng } = await searchParams
  const initialLat = lat && Number.isFinite(Number(lat)) ? Number(lat) : undefined
  const initialLng = lng && Number.isFinite(Number(lng)) ? Number(lng) : undefined
  return <><PageHeader title="Request assistance" description="Tell us which vehicle needs help and where it is. Buzzel checks annual cover, risk requirements and any one-off amount due on the server."/><ErrorNotice message={error}/>{!vehicles?.length ? <EmptyState title="No registered vehicle" description="Add the vehicle first, then return to request assistance." action={<LinkButton href="/vehicles/new">Add vehicle</LinkButton>}/> : <Card className="mx-auto max-w-3xl p-5 sm:p-7"><form action={createRequestAction} className="grid gap-5"><div><label className="bz-label">Vehicle</label><select className="bz-input" name="vehicleId" defaultValue={vehicle || vehicles[0].id}>{vehicles.map((v) => <option key={v.id} value={v.id}>{v.registration_number} — {v.make || VEHICLE_LABELS[v.vehicle_type as VehicleType]} {v.model || ''}</option>)}</select></div><RequestFormFields initialLat={initialLat} initialLng={initialLng}/><div className="rounded-2xl bg-slate-50 p-4 text-xs leading-5 text-slate-600"><strong className="text-slate-900">What happens next?</strong> Buzzel checks whether this vehicle has active annual cover. Covered vehicles continue without an incident charge. Otherwise you will see the vehicle/distance/security-aware amount before payment.</div><Button type="submit" className="w-full sm:w-auto sm:justify-self-start">Continue to quote</Button></form></Card>}</>
}
