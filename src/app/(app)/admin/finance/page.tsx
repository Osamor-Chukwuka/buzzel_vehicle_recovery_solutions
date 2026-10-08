import { requireRole } from '@/lib/supabase/auth'
import { createClient } from '@/lib/supabase/server'
import { Card, EmptyState, PageHeader, Stat } from '@/components/ui'
import { formatDateTime, formatMoney } from '@/lib/format'

export default async function AdminFinancePage() {
  await requireRole(['admin', 'super_admin'])
  const supabase = await createClient()
  const [{ data: payments }, { data: policies }] = await Promise.all([
    supabase.from('payments').select('*').order('created_at', { ascending: false }).limit(100),
    supabase.from('coverage_policies').select('*').order('created_at', { ascending: false }).limit(100),
  ])

  const paid = (payments ?? []).filter((payment) => payment.status === 'paid')
  const pending = (payments ?? []).filter((payment) => payment.status === 'pending')
  const paidTotal = paid.reduce((sum, payment) => sum + Number(payment.amount_minor), 0)
  const activePolicies = (policies ?? []).filter((policy) => policy.status === 'active' && policy.ends_at && new Date(policy.ends_at) > new Date()).length

  return <>
    <PageHeader title="Coverage & payments" description="Operational view of annual cover purchases, one-off request payments and security surcharges." />
    <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
      <Stat label="Paid payments" value={paid.length} />
      <Stat label="Pending payments" value={pending.length} />
      <Stat label="Active annual policies" value={activePolicies} />
      <Stat label="Paid value" value={formatMoney(paidTotal, paid[0]?.currency || 'NGN')} />
    </div>

    {!payments?.length ? <EmptyState title="No payments yet" description="Annual coverage and one-off payment records will appear here." /> : <Card className="overflow-hidden">
      <div className="border-b border-slate-100 p-4"><h2 className="font-black">Recent payments</h2></div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-400"><tr><th className="px-4 py-3">Reference</th><th className="px-4 py-3">Type</th><th className="px-4 py-3">Amount</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Created</th><th className="px-4 py-3">Linked to</th></tr></thead>
          <tbody className="divide-y divide-slate-100">
            {payments.map((payment) => <tr key={payment.id} className="bg-white">
              <td className="px-4 py-3 font-mono text-xs font-bold">{payment.provider_reference || '—'}</td>
              <td className="px-4 py-3 font-semibold capitalize">{payment.kind.replaceAll('_', ' ')}</td>
              <td className="px-4 py-3 font-black">{formatMoney(Number(payment.amount_minor), payment.currency)}</td>
              <td className="px-4 py-3"><span className={`rounded-full px-2.5 py-1 text-xs font-bold capitalize ${payment.status === 'paid' ? 'bg-emerald-50 text-emerald-700' : payment.status === 'failed' ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700'}`}>{payment.status}</span></td>
              <td className="px-4 py-3 text-xs text-slate-500">{formatDateTime(payment.created_at)}</td>
              <td className="px-4 py-3 text-xs text-slate-500">{payment.request_id ? <a className="font-bold text-[#c52626]" href={`/requests/${payment.request_id}`}>Request</a> : payment.coverage_policy_id ? 'Annual policy' : '—'}</td>
            </tr>)}
          </tbody>
        </table>
      </div>
    </Card>}
  </>
}
