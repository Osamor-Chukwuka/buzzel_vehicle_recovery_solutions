import { requireUser } from '@/lib/supabase/auth'
import { createClient } from '@/lib/supabase/server'
import { getCurrentAccount } from '@/lib/queries/account'
import { Card, EmptyState, LinkButton, PageHeader, SuccessNotice } from '@/components/ui'
import { VEHICLE_LABELS } from '@/lib/constants'
import type { VehicleType } from '@/lib/types'

type CoverageLink = { vehicle_id: string; coverage_policies: Array<{ ends_at: string }> }

export default async function VehiclesPage({ searchParams }: { searchParams: Promise<{ success?: string }> }) {
  const { success } = await searchParams
  const user = await requireUser(); const account = await getCurrentAccount(user.id); if (!account) throw new Error('Account not found')
  const supabase = await createClient()
  const [{ data: vehicles }, { data: coverageLinks }] = await Promise.all([
    supabase.from('vehicles').select('*').eq('account_id', account.id).eq('is_active', true).order('created_at', { ascending: false }),
    supabase.from('coverage_vehicles').select('vehicle_id, coverage_policies!inner(status, starts_at, ends_at)').eq('coverage_policies.status', 'active'),
  ])
  const coveredIds = new Set(((coverageLinks ?? []) as CoverageLink[]).filter((link) => link.coverage_policies.some((policy) => new Date(policy.ends_at) > new Date())).map((link) => link.vehicle_id))
  return <><PageHeader title={account.account_type === 'company' ? 'Fleet' : 'Vehicles'} description="Vehicles registered under this Buzzel account." action={<LinkButton href="/vehicles/new">Add vehicle</LinkButton>}/><SuccessNotice message={success}/>{vehicles?.length ? <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{vehicles.map((vehicle) => <Card key={vehicle.id} className="p-5"><div className="flex items-start justify-between"><div className="grid size-11 place-items-center rounded-xl bg-red-50 font-black text-[#c52626]">V</div><span className={`rounded-full px-2.5 py-1 text-xs font-bold ${coveredIds.has(vehicle.id) ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>{coveredIds.has(vehicle.id) ? 'Covered' : 'Not covered'}</span></div><h2 className="mt-4 text-lg font-black">{vehicle.make || VEHICLE_LABELS[vehicle.vehicle_type as VehicleType]} {vehicle.model || ''}</h2><p className="mt-1 text-sm font-bold text-slate-500">{vehicle.registration_number}</p><dl className="mt-4 grid grid-cols-2 gap-3 text-xs"><div><dt className="text-slate-400">Type</dt><dd className="mt-1 font-bold">{VEHICLE_LABELS[vehicle.vehicle_type as VehicleType]}</dd></div><div><dt className="text-slate-400">Year</dt><dd className="mt-1 font-bold">{vehicle.year || '—'}</dd></div></dl><div className="mt-5 flex gap-2"><LinkButton href={`/requests/new?vehicle=${vehicle.id}`} className="flex-1">Request help</LinkButton>{!coveredIds.has(vehicle.id) && <LinkButton href="/coverage" variant="ghost">Cover</LinkButton>}</div></Card>)}</div> : <EmptyState title="No vehicles yet" description="Add a car, motorcycle, tricycle, bus/van or lorry." action={<LinkButton href="/vehicles/new">Add vehicle</LinkButton>}/>}</>
}
