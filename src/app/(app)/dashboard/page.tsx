import Link from 'next/link'
import { redirect } from 'next/navigation'
import { requireUser, getProfile } from '@/lib/supabase/auth'
import { createClient } from '@/lib/supabase/server'
import { getCurrentAccount } from '@/lib/queries/account'
import { Card, LinkButton, Stat, StatusBadge, EmptyState, SuccessNotice } from '@/components/ui'
import { Icon } from '@/components/icon'
import { formatDate } from '@/lib/format'
import { VEHICLE_LABELS } from '@/lib/constants'
import type { RequestStatus, VehicleType } from '@/lib/types'

type CoverageSummary = {
  ends_at: string | null
}

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

  const covered = new Map<string, CoverageSummary>()
  for (const policy of coverage ?? []) {
    for (const link of policy.coverage_vehicles ?? []) {
      covered.set(link.vehicle_id, { ends_at: policy.ends_at })
    }
  }

  const activeRequests = (requests ?? []).filter((request) => !['completed', 'cancelled'].includes(request.status)).length
  const { payment } = await searchParams
  const firstName = profile?.full_name?.split(' ')[0]

  return <>
    <SuccessNotice message={payment === 'success' ? 'Payment successful. Your Buzzel account has been updated.' : null}/>

    <section className="dashboard-welcome relative isolate mb-6 overflow-hidden rounded-[1.75rem] bg-slate-950 px-6 py-7 text-white shadow-[0_28px_65px_rgba(15,23,42,.2)] sm:px-8 sm:py-9">
      <div className="absolute -right-16 -top-20 -z-10 size-72 rounded-full bg-[var(--buzzel-red)]/35 blur-3xl"/>
      <div className="absolute bottom-0 right-[18%] -z-10 h-32 w-48 skew-x-[-22deg] rounded-t-full bg-blue-500/15 blur-2xl"/>
      <div className="relative flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/8 px-3 py-1.5 text-[11px] font-black uppercase tracking-[.18em] text-red-100 backdrop-blur-md">
            <span className="size-1.5 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,.8)]"/>Recovery workspace
          </div>
          <h1 className="text-3xl font-black tracking-[-.045em] sm:text-5xl">Good to see you{firstName ? `, ${firstName}` : ''}.</h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-slate-300 sm:text-base">{account.account_type === 'company' ? `${account.name} fleet dashboard` : 'Everything you need to protect your vehicle and get moving again—right here.'}</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <LinkButton href="/vehicles/new" variant="ghost" className="border-white/15 bg-white/10 text-white shadow-none hover:border-white/25 hover:bg-white/15">Add vehicle</LinkButton>
          <LinkButton href="/emergency" className="gap-2 bg-white text-slate-950 shadow-[0_14px_30px_rgba(0,0,0,.25)] hover:bg-red-50"><Icon name="emergency" className="size-4"/>Request help</LinkButton>
        </div>
      </div>
      <div className="relative mt-7 flex flex-wrap gap-x-6 gap-y-2 border-t border-white/10 pt-5 text-xs font-semibold text-slate-300">
        <span className="flex items-center gap-2"><Icon name="location" className="size-4 text-red-300"/>Live-location assisted</span>
        <span className="flex items-center gap-2"><Icon name="clock" className="size-4 text-red-300"/>Recovery updates</span>
        <span className="flex items-center gap-2"><Icon name="lock" className="size-4 text-red-300"/>Secure payments</span>
      </div>
    </section>

    <div className="bz-grid grid-cols-2 lg:grid-cols-4">
      <Stat label="Vehicles" value={vehicles?.length ?? 0}/>
      <Stat label="Covered" value={covered.size} note="Active annual cover"/>
      <Stat label="Active requests" value={activeRequests}/>
      <Stat label="Account" value={account.account_type === 'company' ? 'Company' : 'Individual'}/>
    </div>

    <div className="mt-8 grid gap-7 xl:grid-cols-[1.15fr_.85fr]">
      <section>
        <div className="mb-4 flex items-center justify-between">
          <div><p className="text-[10px] font-black uppercase tracking-[.2em] text-slate-400">Garage</p><h2 className="mt-1 text-xl font-black tracking-tight text-slate-950">Your vehicles</h2></div>
          <Link href="/vehicles" className="group inline-flex min-h-11 items-center gap-1.5 rounded-xl px-3 text-sm font-extrabold text-[var(--buzzel-red)] transition-colors hover:bg-red-50">View all<Icon name="arrow-right" className="size-4 transition-transform group-hover:translate-x-0.5"/></Link>
        </div>
        {vehicles?.length ? <div className="grid gap-4 sm:grid-cols-2">
          {vehicles.slice(0, 4).map((vehicle) => {
            const policy = covered.get(vehicle.id)
            return <Card key={vehicle.id} className="group overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-[var(--buzzel-red)] via-orange-400 to-amber-300 opacity-0 transition-opacity group-hover:opacity-100"/>
              <div className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-start gap-3">
                    <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-slate-950 text-white"><Icon name="vehicle" className="size-5"/></span>
                    <div className="min-w-0"><p className="text-[10px] font-black uppercase tracking-[.16em] text-slate-400">{VEHICLE_LABELS[vehicle.vehicle_type as VehicleType]}</p><h3 className="mt-1 truncate font-black text-slate-950">{vehicle.make || 'Vehicle'} {vehicle.model || ''}</h3><p className="mt-1 text-sm font-semibold text-slate-500">{vehicle.registration_number}</p></div>
                  </div>
                </div>
                <span className={`mt-4 inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold ${policy ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>{policy ? `Covered to ${formatDate(policy.ends_at)}` : 'Pay per request'}</span>
                <div className="mt-5 flex gap-2"><LinkButton href={`/requests/new?vehicle=${vehicle.id}`} className="min-h-10 flex-1 px-3 py-2 text-xs">Request help</LinkButton>{!policy && <LinkButton href="/coverage" variant="ghost" className="min-h-10 px-3 py-2 text-xs">Cover</LinkButton>}</div>
              </div>
            </Card>
          })}
        </div> : <EmptyState title="Add your first vehicle" description="Register a vehicle to buy annual cover or request roadside assistance." action={<LinkButton href="/vehicles/new">Add vehicle</LinkButton>}/>}
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <div><p className="text-[10px] font-black uppercase tracking-[.2em] text-slate-400">Activity</p><h2 className="mt-1 text-xl font-black tracking-tight text-slate-950">Recent requests</h2></div>
          <Link href="/requests" className="group inline-flex min-h-11 items-center gap-1.5 rounded-xl px-3 text-sm font-extrabold text-[var(--buzzel-red)] transition-colors hover:bg-red-50">History<Icon name="arrow-right" className="size-4 transition-transform group-hover:translate-x-0.5"/></Link>
        </div>
        <Card className="overflow-hidden">
          {requests?.length ? <div className="divide-y divide-slate-100">{requests.map((request) => <Link key={request.id} href={`/requests/${request.id}`} className="group flex min-h-20 items-center justify-between gap-3 p-4 transition-colors hover:bg-slate-50">
            <div className="flex min-w-0 items-center gap-3"><span className="grid size-10 shrink-0 place-items-center rounded-xl bg-red-50 text-[var(--buzzel-red)] transition-colors group-hover:bg-[var(--buzzel-red)] group-hover:text-white"><Icon name="route" className="size-5"/></span><div className="min-w-0"><p className="text-sm font-black text-slate-950">{request.reference}</p><p className="mt-1 truncate text-xs text-slate-500">{request.breakdown_address}</p></div></div>
            <StatusBadge status={request.status as RequestStatus}/>
          </Link>)}</div> : <div className="p-8 text-center"><span className="mx-auto grid size-11 place-items-center rounded-xl bg-slate-100 text-slate-500"><Icon name="route" className="size-5"/></span><p className="mt-3 text-sm font-bold text-slate-700">No requests yet</p><p className="mt-1 text-xs text-slate-500">Your recovery activity will appear here.</p></div>}
        </Card>
      </section>
    </div>
  </>
}
