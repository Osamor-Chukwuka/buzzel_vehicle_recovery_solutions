import Link from 'next/link'
import { requireRole } from '@/lib/supabase/auth'
import { createClient } from '@/lib/supabase/server'
import { resolveDisputeAction } from '@/lib/actions/admin'
import { Button, Card, PageHeader, SuccessNotice } from '@/components/ui'
import { formatDateTime } from '@/lib/format'

export default async function DisputesPage({ searchParams }: { searchParams: Promise<{ success?: string }> }) {
  const { success } = await searchParams
  await requireRole(['admin', 'super_admin'])
  const supabase = await createClient()
  const { data: disputes } = await supabase.from('disputes').select('*, service_requests(reference, status)').order('created_at', { ascending: false })

  return <>
    <PageHeader title="Dispute management" description="Customers and assigned team members can raise disputes. Only Admin/Super Admin can resolve them."/>
    <SuccessNotice message={success}/>
    <div className="grid gap-4">
      {disputes?.length ? disputes.map((dispute) => <Card key={dispute.id} className="p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"><div><div className="flex gap-2"><Link href={`/requests/${dispute.request_id}`} className="font-black text-[#c52626]">{dispute.service_requests?.reference}</Link><span className={`rounded-full px-2 py-1 text-[11px] font-bold ${dispute.status === 'resolved' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>{dispute.status}</span></div><h2 className="mt-2 font-black">{dispute.reason}</h2><p className="mt-1 text-sm leading-6 text-slate-600">{dispute.description || 'No additional description.'}</p><p className="mt-2 text-xs text-slate-400">Raised {formatDateTime(dispute.created_at)}</p></div></div>
        {dispute.status !== 'resolved' ? <form action={resolveDisputeAction.bind(null, dispute.id)} className="mt-5 grid gap-3 rounded-2xl bg-slate-50 p-4 sm:grid-cols-[1fr_180px_auto] sm:items-end"><div><label className="bz-label">Resolution notes</label><textarea name="resolution" className="bz-input min-h-20" required/></div><div><label className="bz-label">Request after resolution</label><select name="nextStatus" className="bz-input"><option value="in_progress">In progress</option><option value="awaiting_customer_confirmation">Awaiting confirmation</option><option value="completed">Completed</option><option value="cancelled">Cancelled</option></select></div><Button type="submit" pendingText="Resolving…">Resolve</Button></form> : <div className="mt-4 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800"><strong>Resolution:</strong> {dispute.resolution_notes}</div>}
      </Card>) : <Card className="p-8 text-center text-sm text-slate-500">No disputes.</Card>}
    </div>
  </>
}
