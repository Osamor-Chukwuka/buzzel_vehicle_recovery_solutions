import { requireUser } from '@/lib/supabase/auth'
import { createClient } from '@/lib/supabase/server'
import { getCurrentAccount } from '@/lib/queries/account'
import { createAnnualCoverageAction } from '@/lib/actions/coverage'
import { Button, Card, EmptyState, LinkButton, PageHeader, ErrorNotice } from '@/components/ui'
import { formatMoney, formatDate } from '@/lib/format'
import { VEHICLE_LABELS } from '@/lib/constants'
import type { VehicleType } from '@/lib/types'

export default async function CoveragePage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const user = await requireUser(); const account = await getCurrentAccount(user.id); if (!account) throw new Error('Account not found')
  const supabase = await createClient()
  const [{ data: vehicles }, { data: policies }, { data: rules }] = await Promise.all([
    supabase.from('vehicles').select('*').eq('account_id', account.id).eq('is_active', true),
    supabase.from('coverage_policies').select('*, coverage_vehicles(vehicle_id)').eq('account_id', account.id).order('created_at', { ascending: false }),
    supabase.from('pricing_rules').select('*').eq('active', true),
  ])
  const activeVehicleIds = new Set((policies ?? []).filter((p) => p.status === 'active' && new Date(p.ends_at) > new Date()).flatMap((p) => p.coverage_vehicles?.map((x:any) => x.vehicle_id) ?? []))
  const prices = new Map<string, number>((rules ?? []).map((r) => [r.vehicle_type, Number(r.annual_base_minor)]))
  const { error } = await searchParams
  return <><PageHeader title="Annual coverage" description="Pay once to cover selected vehicles for 12 months. Active annual cover includes roadside assistance, recovery and security support with no incident charge."/>{error && <ErrorNotice message={error}/>}<Card className="mb-6 overflow-hidden"><div className="bg-slate-950 p-5 text-white sm:p-6"><p className="text-xs font-black uppercase tracking-widest text-red-300">Pay once</p><h2 className="mt-2 text-2xl font-black">12 months of Buzzel cover</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">Pricing varies by vehicle category so a motorcycle, car and lorry are not charged the same amount. Security provision is included in the annual price.</p></div></Card>
    {!vehicles?.length ? <EmptyState title="Add a vehicle first" description="Annual cover is purchased against registered vehicles." action={<LinkButton href="/vehicles/new">Add vehicle</LinkButton>}/> : <form action={createAnnualCoverageAction}><div className="grid gap-3">{vehicles.map((vehicle) => { const active = activeVehicleIds.has(vehicle.id); return <label key={vehicle.id} className={`flex items-center gap-4 rounded-2xl border bg-white p-4 ${active ? 'border-emerald-200 opacity-70' : 'border-slate-200 hover:border-red-200'}`}><input type="checkbox" name="vehicleIds" value={vehicle.id} disabled={active} className="size-5 accent-[#d92f2f]"/><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h3 className="font-black">{vehicle.make || VEHICLE_LABELS[vehicle.vehicle_type as VehicleType]} {vehicle.model || ''}</h3>{active && <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-700">Already covered</span>}</div><p className="mt-1 text-xs font-semibold text-slate-500">{vehicle.registration_number} · {VEHICLE_LABELS[vehicle.vehicle_type as VehicleType]}</p></div><div className="text-right"><p className="font-black">{formatMoney(prices.get(vehicle.vehicle_type) ?? 0)}</p><p className="text-[11px] text-slate-400">per year</p></div></label>})}</div><Button type="submit" className="mt-5 w-full sm:w-auto">Review & pay annual cover</Button></form>}
    {policies?.length ? <div className="mt-8"><h2 className="mb-3 text-lg font-black">Coverage history</h2><div className="grid gap-3">{policies.slice(0,5).map((policy) => <Card key={policy.id} className="flex items-center justify-between gap-4 p-4"><div><p className="font-black capitalize">{policy.status} policy</p><p className="mt-1 text-xs text-slate-500">{policy.starts_at ? `${formatDate(policy.starts_at)} – ${formatDate(policy.ends_at)}` : 'Awaiting payment'} · {policy.coverage_vehicles?.length ?? 0} vehicle(s)</p></div><p className="font-black">{formatMoney(Number(policy.total_amount_minor), policy.currency)}</p></Card>)}</div></div> : null}</>
}
