import { requireRole } from '@/lib/supabase/auth'
import { createClient } from '@/lib/supabase/server'
import { Card, EmptyState, PageHeader, Stat } from '@/components/ui'
import { formatDate } from '@/lib/format'
import { VEHICLE_LABELS } from '@/lib/constants'
import type { VehicleType } from '@/lib/types'
import { isCoverageActive } from '@/lib/domain/coverage'

export default async function AdminCustomersPage() {
  await requireRole(['admin', 'super_admin'])
  const supabase = await createClient()

  const [{ data: accounts }, { data: vehicles }, { data: coverage }] = await Promise.all([
    supabase.from('accounts').select('*').order('created_at', { ascending: false }),
    supabase.from('vehicles').select('*').eq('is_active', true).order('created_at', { ascending: false }),
    supabase.from('coverage_policies').select('*, coverage_vehicles(vehicle_id)').order('created_at', { ascending: false }),
  ])

  const vehicleCount = new Map<string, number>()
  for (const vehicle of vehicles ?? []) vehicleCount.set(vehicle.account_id, (vehicleCount.get(vehicle.account_id) ?? 0) + 1)

  const now = new Date()
  const activeCoverByAccount = new Map<string, { vehicleIds: Set<string>; endsAt: string | null }>()
  for (const policy of coverage ?? []) {
    if (!isCoverageActive(policy, now)) continue
    const current = activeCoverByAccount.get(policy.account_id) ?? { vehicleIds: new Set<string>(), endsAt: policy.ends_at }
    for (const link of policy.coverage_vehicles ?? []) current.vehicleIds.add(link.vehicle_id)
    if (!current.endsAt || new Date(policy.ends_at) > new Date(current.endsAt)) current.endsAt = policy.ends_at
    activeCoverByAccount.set(policy.account_id, current)
  }

  const companyCount = (accounts ?? []).filter((account) => account.account_type === 'company').length
  const coveredVehicleCount = [...activeCoverByAccount.values()].reduce((sum, item) => sum + item.vehicleIds.size, 0)

  return <>
    <PageHeader title="Customers & fleets" description="View individual and company accounts, fleet size and active annual coverage." />
    <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
      <Stat label="Customer accounts" value={accounts?.length ?? 0} />
      <Stat label="Company fleets" value={companyCount} />
      <Stat label="Registered vehicles" value={vehicles?.length ?? 0} />
      <Stat label="Covered vehicles" value={coveredVehicleCount} />
    </div>

    {!accounts?.length ? <EmptyState title="No customer accounts yet" description="New individual and company accounts will appear here after registration." /> : <div className="grid gap-4">
      {accounts.map((account) => {
        const accountVehicles = (vehicles ?? []).filter((vehicle) => vehicle.account_id === account.id)
        const activeCoverage = activeCoverByAccount.get(account.id)
        return <Card key={account.id} className="overflow-hidden">
          <div className="flex flex-col gap-3 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-black text-slate-950">{account.name}</h2>
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold capitalize text-slate-600">{account.account_type}</span>
              </div>
              <p className="mt-1 text-xs text-slate-400">Joined {formatDate(account.created_at)} · {vehicleCount.get(account.id) ?? 0} vehicle(s)</p>
            </div>
            <div className="text-left sm:text-right">
              <p className={`text-sm font-black ${activeCoverage ? 'text-emerald-700' : 'text-slate-500'}`}>{activeCoverage ? `${activeCoverage.vehicleIds.size} covered` : 'No active annual cover'}</p>
              {activeCoverage?.endsAt && <p className="mt-1 text-xs text-slate-400">Latest policy ends {formatDate(activeCoverage.endsAt)}</p>}
            </div>
          </div>
          <div className="grid gap-2 p-4 sm:grid-cols-2 xl:grid-cols-3">
            {accountVehicles.length ? accountVehicles.map((vehicle) => <div key={vehicle.id} className="rounded-xl bg-slate-50 p-3">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">{VEHICLE_LABELS[vehicle.vehicle_type as VehicleType]}</p>
              <p className="mt-1 font-black">{vehicle.make || 'Vehicle'} {vehicle.model || ''}</p>
              <p className="mt-1 text-xs font-semibold text-slate-500">{vehicle.registration_number}</p>
            </div>) : <p className="p-2 text-sm text-slate-500">No active vehicles.</p>}
          </div>
        </Card>
      })}
    </div>}
  </>
}
