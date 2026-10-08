import { redirect } from 'next/navigation'
import { requireUser, getProfile } from '@/lib/supabase/auth'
import { createClient } from '@/lib/supabase/server'
import { getCurrentAccount } from '@/lib/queries/account'
import { Card, LinkButton, PageHeader, Stat, StatusBadge, EmptyState } from '@/components/ui'
import { formatDate } from '@/lib/format'
import { VEHICLE_LABELS } from '@/lib/constants'
import type { RequestStatus, VehicleType } from '@/lib/types'

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ payment?: string }> }) {
  const user = await requireUser()
  const profile = await getProfile(user.id)
  if (profile?.role === 'team') redirect('/team')
  if (profile?.role === 'admin' || profile?.role === 'super_admin') redirect('/admin')
  const account = await getCurrentAccount(user.id)
  if (!account) throw new Error('Customer account not found')
  const supabase = await createClient()
  const [{ data: vehicles }, { data: requests }, { data: coverage }] = await Promise.all([
    supabase.from('vehicles').select('*').eq('account_id', account.id).eq('is_active', true).order('created_at', { ascending: false }),
    supabase.from('service_requests').select('*').eq('account_id', account.id).order('created_at', { ascending: false }).limit(5),
    supabase.from('coverage_policies').select('*, coverage_vehicles(vehicle_id)').eq('account_id', account.id).eq('status', 'active').order('created_at', { ascending: false }),
  ])
  const covered = new Map<string, any>()
  for (const policy of coverage ?? []) for (const link of policy.coverage_vehicles ?? []) covered.set(link.vehicle_id, policy)
  const activeRequests = (requests ?? []).filter((r) => !['completed', 'cancelled'].includes(r.status)).length
  const { payment } = await searchParams

  return <>
    {payment === 'success' && <div className="mb-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-bold text-emerald-700">Payment successful. Your Buzzel account has been updated.</div>}
    <PageHeader title={`Hi${profile?.full_name ? `, ${profile.full_name.split(' ')[0]}` : ''}`} description={account.account_type === 'company' ? `${account.name} fleet dashboard` : 'Your vehicles, cover and active recovery requests.'} action={<LinkButton href="/emergency">Request help</LinkButton>} />
    <div className="bz-grid grid-cols-2 lg:grid-cols-4"><Stat label="Vehicles" value={vehicles?.length ?? 0}/><Stat label="Covered" value={covered.size} note="Active annual cover"/><Stat label="Active requests" value={activeRequests}/><Stat label="Account" value={account.account_type === 'company' ? 'Company' : 'Individual'}/></div>

    <div className="mt-6 grid gap-6 xl:grid-cols-[1.15fr_.85fr]">
      <div><div className="mb-3 flex items-center justify-between"><h2 className="text-lg font-black">Your vehicles</h2><a href="/vehicles" className="text-sm font-bold text-[#c52626]">View all</a></div>{vehicles?.length ? <div className="grid gap-3 sm:grid-cols-2">{vehicles.slice(0,4).map((vehicle) => { const policy = covered.get(vehicle.id); return <Card key={vehicle.id} className="p-4"><div className="flex items-start justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-wider text-slate-400">{VEHICLE_LABELS[vehicle.vehicle_type as VehicleType]}</p><h3 className="mt-1 font-black">{vehicle.make || 'Vehicle'} {vehicle.model || ''}</h3><p className="mt-1 text-sm font-semibold text-slate-500">{vehicle.registration_number}</p></div><span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${policy ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>{policy ? `Covered to ${formatDate(policy.ends_at)}` : 'Pay per request'}</span></div><div className="mt-4 flex gap-2"><LinkButton href={`/requests/new?vehicle=${vehicle.id}`} className="min-h-9 flex-1 px-3 py-2 text-xs">Request help</LinkButton>{!policy && <LinkButton href="/coverage" variant="ghost" className="min-h-9 px-3 py-2 text-xs">Cover</LinkButton>}</div></Card>})}</div> : <EmptyState title="Add your first vehicle" description="Register a vehicle to buy annual cover or request roadside assistance." action={<LinkButton href="/vehicles/new">Add vehicle</LinkButton>}/>}</div>
      <div><div className="mb-3 flex items-center justify-between"><h2 className="text-lg font-black">Recent requests</h2><a href="/requests" className="text-sm font-bold text-[#c52626]">History</a></div><Card className="divide-y divide-slate-100 overflow-hidden">{requests?.length ? requests.map((request) => <a key={request.id} href={`/requests/${request.id}`} className="flex items-center justify-between gap-3 p-4 hover:bg-slate-50"><div><p className="text-sm font-black">{request.reference}</p><p className="mt-1 line-clamp-1 text-xs text-slate-500">{request.breakdown_address}</p></div><StatusBadge status={request.status as RequestStatus}/></a>) : <div className="p-7 text-center text-sm text-slate-500">No requests yet.</div>}</Card></div>
    </div>
  </>
}
