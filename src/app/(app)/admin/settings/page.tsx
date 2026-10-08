import { requireRole } from '@/lib/supabase/auth'
import { createClient } from '@/lib/supabase/server'
import { updatePricingRuleAction, addRiskAreaAction } from '@/lib/actions/settings'
import { Button, Card, PageHeader, SuccessNotice } from '@/components/ui'
import { VEHICLE_LABELS } from '@/lib/constants'
import type { VehicleType } from '@/lib/types'

function major(minor: number) { return (minor / 100).toFixed(0) }

export default async function SettingsPage({ searchParams }: { searchParams: Promise<{ success?: string }> }) {
  const { success } = await searchParams
  await requireRole(['super_admin'])
  const supabase = await createClient()
  const [{ data: rules }, { data: areas }] = await Promise.all([
    supabase.from('pricing_rules').select('*').order('vehicle_type'),
    supabase.from('risk_areas').select('*').order('name'),
  ])

  return <>
    <PageHeader title="System settings" description="Super Admin configuration for demo vehicle pricing and high-risk areas."/>
    <SuccessNotice message={success}/>
    <div className="grid gap-6">
      <Card className="overflow-hidden">
        <div className="border-b border-slate-100 p-5"><h2 className="font-black">Vehicle pricing</h2><p className="mt-1 text-xs text-slate-500">Amounts below are in NGN major units and remain server-authoritative.</p></div>
        <div className="grid gap-4 p-4">{rules?.map((rule) => <form key={rule.id} action={updatePricingRuleAction.bind(null, rule.id)} className="grid gap-3 rounded-2xl border border-slate-200 p-4 lg:grid-cols-[180px_repeat(4,1fr)_auto] lg:items-end">
          <div><p className="font-black">{VEHICLE_LABELS[rule.vehicle_type as VehicleType]}</p><p className="text-xs text-slate-400">{rule.currency}</p></div>
          <div><label className="bz-label">Roadside</label><input className="bz-input" name="roadside" type="number" defaultValue={major(Number(rule.roadside_base_minor))}/></div>
          <div><label className="bz-label">Recovery</label><input className="bz-input" name="recovery" type="number" defaultValue={major(Number(rule.recovery_base_minor))}/></div>
          <div><label className="bz-label">Annual</label><input className="bz-input" name="annual" type="number" defaultValue={major(Number(rule.annual_base_minor))}/></div>
          <div><label className="bz-label">Per km</label><input className="bz-input" name="perKm" type="number" defaultValue={major(Number(rule.per_km_minor))}/></div>
          <Button type="submit" pendingText="Saving…" variant="ghost">Save</Button>
        </form>)}</div>
      </Card>
      <div className="grid gap-5 lg:grid-cols-[1fr_.7fr]">
        <Card className="overflow-hidden">
          <div className="border-b border-slate-100 p-5"><h2 className="font-black">Configured demo risk areas</h2><p className="mt-1 text-xs text-slate-500">These zones are synthetic MVP configuration and are not claims about real-world crime levels.</p></div>
          {areas?.map((area) => <div key={area.id} className="grid gap-2 border-b border-slate-100 p-4 last:border-0 sm:grid-cols-[1fr_auto_auto]"><div><p className="font-bold">{area.name}</p><p className="text-xs text-slate-400">{Number(area.center_lat).toFixed(4)}, {Number(area.center_lng).toFixed(4)}</p></div><p className="text-sm font-semibold">Radius {Number(area.radius_km)} km</p><p className="text-sm font-black">₦{major(Number(area.security_fee_minor))}</p></div>)}
        </Card>
        <Card className="p-5">
          <h2 className="font-black">Add high-risk demo zone</h2>
          <form action={addRiskAreaAction} className="mt-4 grid gap-3">
            <div><label className="bz-label">Name</label><input name="name" className="bz-input" required/></div>
            <div className="grid grid-cols-2 gap-2"><div><label className="bz-label">Latitude</label><input name="lat" className="bz-input" type="number" step="any" required/></div><div><label className="bz-label">Longitude</label><input name="lng" className="bz-input" type="number" step="any" required/></div></div>
            <div className="grid grid-cols-2 gap-2"><div><label className="bz-label">Radius km</label><input name="radius" className="bz-input" type="number" step="0.1" required/></div><div><label className="bz-label">Security fee ₦</label><input name="fee" className="bz-input" type="number" required/></div></div>
            <Button type="submit" pendingText="Adding risk area…">Add risk area</Button>
          </form>
        </Card>
      </div>
    </div>
  </>
}
