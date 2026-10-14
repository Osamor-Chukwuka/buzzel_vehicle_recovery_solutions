import { notFound } from 'next/navigation'
import { requireUser } from '@/lib/supabase/auth'
import { createClient } from '@/lib/supabase/server'
import { beginPaymentAction, confirmPaymentAction } from '@/lib/actions/payments'
import { Button, Card, ErrorNotice, PageHeader } from '@/components/ui'
import { formatMoney } from '@/lib/format'
import { VEHICLE_LABELS } from '@/lib/constants'
import type { VehicleType } from '@/lib/types'

type CoverageVehicle = {
  annual_price_minor: number | string | null
  vehicles: {
    registration_number: string | null
    vehicle_type: VehicleType
  } | null
}

export default async function PaymentPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ error?: string }> }) {
  const { id } = await params
  const { error } = await searchParams
  await requireUser()
  const supabase = await createClient()
  const { data: payment } = await supabase.from('payments').select('*').eq('id', id).maybeSingle()
  if (!payment) notFound()

  const requestPromise = payment.request_id
    ? supabase.from('service_requests').select('*, vehicles(registration_number, make, model, vehicle_type)').eq('id', payment.request_id).maybeSingle()
    : Promise.resolve({ data: null })
  const policyPromise = payment.coverage_policy_id
    ? supabase.from('coverage_policies').select('*, coverage_vehicles(annual_price_minor, vehicles(registration_number, make, model, vehicle_type))').eq('id', payment.coverage_policy_id).maybeSingle()
    : Promise.resolve({ data: null })
  const [{ data: request }, { data: policy }] = await Promise.all([requestPromise, policyPromise])

  const serviceAndDistance = request ? Math.max(0, Number(request.quoted_amount_minor) - Number(request.security_fee_minor)) : 0

  return <>
    <PageHeader title="Review & pay" description="Review the amount before opening the payment provider. Raw card details are never stored in the Buzzel database." />
    <Card className="mx-auto max-w-xl overflow-hidden">
      <div className="bg-emerald-50 p-6 text-center">
        <p className="text-xs font-black uppercase tracking-widest text-emerald-700">Total to pay</p>
        <p className="mt-2 text-4xl font-black text-emerald-800">{formatMoney(Number(payment.amount_minor), payment.currency)}</p>
      </div>
      <div className="p-6">
        <ErrorNotice message={error} />
        {request && <div className="mb-5 rounded-2xl bg-slate-50 p-4">
          <p className="text-xs font-black uppercase tracking-wider text-slate-400">One-off request quote</p>
          <p className="mt-1 font-black">{request.vehicles?.registration_number} - {request.vehicles?.make || VEHICLE_LABELS[request.vehicles?.vehicle_type as VehicleType]} {request.vehicles?.model || ''}</p>
          <div className="mt-4 grid gap-2 text-sm">
            {payment.kind === 'security_surcharge' ? <div className="flex justify-between"><span className="text-slate-500">Additional security support</span><strong>{formatMoney(Number(payment.amount_minor), payment.currency)}</strong></div> : <>
              <div className="flex justify-between"><span className="text-slate-500">Service + distance</span><strong>{formatMoney(serviceAndDistance, payment.currency)}</strong></div>
              <div className="flex justify-between"><span className="text-slate-500">Security requirement</span><strong>{formatMoney(Number(request.security_fee_minor), payment.currency)}</strong></div>
            </>}
          </div>
        </div>}

        {policy && <div className="mb-5 rounded-2xl bg-slate-50 p-4">
          <p className="text-xs font-black uppercase tracking-wider text-slate-400">12-month annual coverage</p>
          <div className="mt-3 grid gap-2">
            {((policy.coverage_vehicles ?? []) as CoverageVehicle[]).map((item, index) => <div key={`${item.vehicles?.registration_number || index}`} className="flex items-center justify-between gap-4 text-sm">
              <div><p className="font-bold">{item.vehicles?.registration_number || 'Vehicle'}</p><p className="text-xs text-slate-400">{item.vehicles ? VEHICLE_LABELS[item.vehicles.vehicle_type as VehicleType] : 'Annual cover'}</p></div>
              <strong>{formatMoney(Number(item.annual_price_minor), payment.currency)}</strong>
            </div>)}
          </div>
          <p className="mt-4 text-xs leading-5 text-slate-500">Annual coverage includes roadside assistance, recovery and required security support for covered vehicles during the active period, with no additional incident charge.</p>
        </div>}

        <dl className="grid gap-3 text-sm">
          <div className="flex justify-between"><dt className="text-slate-500">Payment type</dt><dd className="font-bold capitalize">{payment.kind.replaceAll('_', ' ')}</dd></div>
          <div className="flex justify-between gap-4"><dt className="text-slate-500">Reference</dt><dd className="break-all text-right font-mono text-xs font-bold">{payment.provider_reference}</dd></div>
          <div className="flex justify-between"><dt className="text-slate-500">Status</dt><dd className="font-bold capitalize">{payment.status}</dd></div>
        </dl>
        {payment.status === 'paid' ? <a href="/dashboard" className="mt-6 block rounded-xl bg-slate-900 px-4 py-3 text-center font-bold text-white">Continue</a> : <div className="mt-6 space-y-3">
          <form action={beginPaymentAction.bind(null, id)}><Button type="submit" className="w-full">Continue to Paystack</Button></form>
          <form action={confirmPaymentAction.bind(null, id)}><Button type="submit" variant="ghost" pendingText="Checking payment..." className="w-full">I&apos;ve already paid - check status</Button></form>
          <p className="text-center text-xs leading-5 text-slate-400">Checking uses the existing Paystack reference and will not charge you again. {error ? 'Your payment may already be complete.' : 'Use it if you have completed checkout but were not returned here.'}</p>
        </div>}
      </div>
    </Card>
  </>
}
