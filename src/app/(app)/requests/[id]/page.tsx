import { notFound } from 'next/navigation'
import { requireUser, getProfile } from '@/lib/supabase/auth'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { Card, Button, LinkButton, PageHeader, StatusBadge, SuccessNotice } from '@/components/ui'
import { ChatPanel } from '@/components/chat-panel'
import { MapCard } from '@/components/map-card'
import { RequestTimeline } from '@/components/request-timeline'
import { formatDateTime, formatMoney } from '@/lib/format'
import { SERVICE_LABELS, VEHICLE_LABELS } from '@/lib/constants'
import type { RequestStatus, ServiceType, VehicleType } from '@/lib/types'
import { teamNextStatuses } from '@/lib/domain/status'
import { updateTeamStatusAction, confirmCompletionAction, adminCloseRequestAction, raiseDisputeAction } from '@/lib/actions/requests'
import { assignRequestAction, requestSecurityAction, reviewSecurityAction } from '@/lib/actions/admin'

type ParticipantProfile = { id: string; full_name: string | null; role: string }
type TeamMember = { id: string; full_name: string | null; phone: string | null }
type RequestMessage = { id: number; request_id: string; sender_user_id: string; body: string; created_at: string }

export default async function RequestDetailPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ success?: string }> }) {
  const { id } = await params
  const { success } = await searchParams
  const user = await requireUser(); const profile = await getProfile(user.id); if (!profile) notFound()
  const supabase = await createClient()
  const { data: accessible } = await supabase.from('service_requests').select('id').eq('id', id).maybeSingle()
  if (!accessible) notFound()
  const admin = createAdminClient()
  const [{ data: request }, { data: messages }, { data: disputes }, { data: securityRequests }, { data: teamMembers }, { data: payments }] = await Promise.all([
    admin.from('service_requests').select('*, vehicles(*)').eq('id', id).single(),
    admin.from('request_messages').select('*').eq('request_id', id).order('created_at').limit(200),
    admin.from('disputes').select('*').eq('request_id', id).order('created_at', { ascending: false }),
    admin.from('security_requests').select('*').eq('request_id', id).order('created_at', { ascending: false }),
    profile.role === 'admin' || profile.role === 'super_admin' ? admin.from('profiles').select('id, full_name, phone').eq('role', 'team').order('full_name') : Promise.resolve({ data: [] as TeamMember[] }),
    admin.from('payments').select('*').eq('request_id', id).order('created_at', { ascending: false }),
  ])
  if (!request) notFound()
  const status = request.status as RequestStatus
  const isAdmin = profile.role === 'admin' || profile.role === 'super_admin'
  const isTeam = profile.role === 'team'
  const isCustomer = profile.role === 'customer'
  const nextStatuses = isTeam || isAdmin ? teamNextStatuses(status) : []
  const latestDispute = disputes?.[0]
  const latestPayment = payments?.[0]
  const pendingPayment = payments?.find((item) => item.status === 'pending')
  const pendingSecurity = securityRequests?.find((x) => x.status === 'requested')
  const participantIds = [...new Set([request.customer_user_id, request.assigned_team_member_id, ...(messages ?? []).map((message) => message.sender_user_id)].filter(Boolean))] as string[]
  const { data: participantProfiles } = participantIds.length ? await admin.from('profiles').select('id, full_name, role').in('id', participantIds) : { data: [] as ParticipantProfile[] }
  const participants = (participantProfiles ?? []) as ParticipantProfile[]
  const senderLabels = Object.fromEntries(participants.map((participant) => [participant.id, { name: participant.full_name || participant.role.replaceAll('_', ' '), role: participant.role }]))
  const assignedProfile = request.assigned_team_member_id ? participants.find((participant) => participant.id === request.assigned_team_member_id) : null

  return <>
    <PageHeader title={request.reference} description={`${SERVICE_LABELS[request.service_type as ServiceType]} · ${request.breakdown_address}`} action={<StatusBadge status={status}/>} />
    <SuccessNotice message={success}/>
    <div className="grid gap-5 xl:grid-cols-[1.1fr_.9fr]">
      <div className="grid gap-5">
        <Card className="overflow-hidden p-4 sm:p-5"><MapCard lat={request.breakdown_lat} lng={request.breakdown_lng} label={request.breakdown_address}/><div className="mt-4 grid gap-3 sm:grid-cols-2"><div><p className="text-xs font-bold uppercase tracking-wider text-slate-400">Pickup / breakdown</p><p className="mt-1 text-sm font-semibold">{request.breakdown_address}</p></div>{request.destination_address && <div><p className="text-xs font-bold uppercase tracking-wider text-slate-400">Destination</p><p className="mt-1 text-sm font-semibold">{request.destination_address}</p></div>}</div></Card>
        <Card className="p-5"><h2 className="font-black">Vehicle & service</h2><div className="mt-4 grid grid-cols-2 gap-4 text-sm sm:grid-cols-4"><div><p className="text-xs text-slate-400">Vehicle</p><p className="mt-1 font-bold">{request.vehicles?.make || VEHICLE_LABELS[request.vehicles?.vehicle_type as VehicleType]} {request.vehicles?.model || ''}</p></div><div><p className="text-xs text-slate-400">Registration</p><p className="mt-1 font-bold">{request.vehicles?.registration_number}</p></div><div><p className="text-xs text-slate-400">Risk</p><p className={`mt-1 font-bold capitalize ${request.risk_level === 'high' ? 'text-red-700' : 'text-emerald-700'}`}>{request.risk_level}</p></div><div><p className="text-xs text-slate-400">Security</p><p className="mt-1 font-bold">{request.security_required ? 'Required' : 'Not required'}</p></div></div>{request.assigned_team_member_id && <div className="mt-4 rounded-xl bg-blue-50 p-3 text-sm text-blue-800"><strong>Assigned team:</strong> {assignedProfile?.full_name || 'Recovery team member'}</div>}{request.assistance_details && <div className="mt-4 rounded-xl bg-slate-50 p-3 text-sm text-slate-600"><strong className="text-slate-900">Request note:</strong> {request.assistance_details}</div>}</Card>
        <ChatPanel requestId={id} currentUserId={user.id} initialMessages={(messages ?? []) as RequestMessage[]} senderLabels={senderLabels}/>
      </div>
      <div className="grid content-start gap-5">
        <Card className="p-5"><div className="flex items-center justify-between"><h2 className="font-black">Request status</h2><span className="text-xs text-slate-400">Created {formatDateTime(request.created_at)}</span></div><div className="mt-5"><RequestTimeline status={status}/></div></Card>
        <Card className="p-5"><h2 className="font-black">Payment & cover</h2><div className="mt-4 grid gap-3 text-sm"><div className="flex justify-between"><span className="text-slate-500">Annual coverage</span><strong>{request.covered_at_request ? 'Active — no incident charge' : 'Not used'}</strong></div><div className="flex justify-between"><span className="text-slate-500">Quoted amount</span><strong>{formatMoney(Number(request.quoted_amount_minor), request.currency)}</strong></div><div className="flex justify-between"><span className="text-slate-500">Security charge</span><strong>{request.covered_at_request ? 'Included' : formatMoney(Number(request.security_fee_minor), request.currency)}</strong></div><div className="flex justify-between border-t border-slate-100 pt-3"><span className="font-bold">Amount due</span><strong className="text-lg">{request.covered_at_request ? formatMoney(0, request.currency) : formatMoney(Number(request.amount_due_minor), request.currency)}</strong></div>{latestPayment && <div className="flex justify-between"><span className="text-slate-500">Latest payment</span><strong className="capitalize">{latestPayment.status}</strong></div>}{pendingPayment && isCustomer && <LinkButton href={`/payments/${pendingPayment.id}`} className="mt-2 w-full">Pay {pendingPayment.kind === 'security_surcharge' ? 'security surcharge' : 'amount due'}</LinkButton>}</div></Card>

        {(isTeam || isAdmin) && <Card className="p-5"><h2 className="font-black">Operational actions</h2>{nextStatuses.length > 0 && <div className="mt-4 grid gap-2">{nextStatuses.map((next) => <form key={next} action={updateTeamStatusAction.bind(null, id, next)}><Button type="submit" className="w-full">{next === 'awaiting_customer_confirmation' ? 'Mark work finished' : `Move to ${next.replaceAll('_',' ')}`}</Button></form>)}</div>}{!request.security_required && !pendingSecurity && <form action={requestSecurityAction.bind(null, id)} className="mt-4 grid gap-2"><label className="bz-label">Need security support?</label><textarea name="reason" className="bz-input min-h-20" placeholder="Why is security required?" required/><Button type="submit" variant="ghost">Request security</Button></form>}{request.security_required && <p className="mt-3 rounded-xl bg-amber-50 p-3 text-sm font-semibold text-amber-800">Security support is flagged for this job.</p>}{pendingSecurity && <p className="mt-3 rounded-xl bg-blue-50 p-3 text-sm font-semibold text-blue-700">Security request awaiting Admin review.</p>}</Card>}

        {isAdmin && <Card className="p-5"><h2 className="font-black">Admin controls</h2><form action={assignRequestAction.bind(null, id)} className="mt-4 grid gap-2"><label className="bz-label">Assign recovery team member</label><select name="teamMemberId" className="bz-input" defaultValue={request.assigned_team_member_id || ''} required><option value="" disabled>Select team member</option>{((teamMembers ?? []) as TeamMember[]).map((member) => <option key={member.id} value={member.id}>{member.full_name || member.id.slice(0,8)}</option>)}</select><Button type="submit" variant="secondary">{request.assigned_team_member_id ? 'Reassign job' : 'Assign job'}</Button></form>{pendingSecurity && <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-3"><p className="text-sm font-bold">Security request</p><p className="mt-1 text-xs text-amber-800">{pendingSecurity.reason}</p><div className="mt-3 flex gap-2"><form action={reviewSecurityAction.bind(null, pendingSecurity.id, true)}><Button type="submit" className="min-h-9 px-3 py-2 text-xs">Approve</Button></form><form action={reviewSecurityAction.bind(null, pendingSecurity.id, false)}><Button type="submit" variant="ghost" className="min-h-9 px-3 py-2 text-xs">Decline</Button></form></div></div>} {status === 'awaiting_customer_confirmation' && <form action={adminCloseRequestAction.bind(null, id)} className="mt-5 grid gap-2 border-t border-slate-100 pt-5"><label className="bz-label">Close without customer confirmation</label><textarea name="reason" className="bz-input min-h-20" placeholder="A reason is required and will be audited." required/><Button type="submit" variant="danger">Admin close job</Button></form>}</Card>}

        {isCustomer && status === 'awaiting_customer_confirmation' && <Card className="border-emerald-200 p-5"><h2 className="font-black">Was the job completed?</h2><p className="mt-1 text-sm leading-6 text-slate-500">The assigned team has marked the work as finished. Confirm only if the requested assistance/recovery has actually been completed.</p><form action={confirmCompletionAction.bind(null, id)} className="mt-4"><Button type="submit" className="w-full">Yes, confirm completion</Button></form></Card>}

        {(isCustomer || isTeam) && !['completed','cancelled'].includes(status) && !['open','under_review'].includes(latestDispute?.status ?? 'resolved') && <Card className="p-5"><h2 className="font-black">Raise a dispute</h2><p className="mt-1 text-xs leading-5 text-slate-500">Use this when the job, completion status, service or operational handling needs Admin review.</p><form action={raiseDisputeAction.bind(null, id)} className="mt-4 grid gap-2"><input name="reason" className="bz-input" placeholder="Short reason" required/><textarea name="description" className="bz-input min-h-20" placeholder="Describe what happened"/><Button type="submit" variant="ghost">Raise dispute</Button></form></Card>}
        {latestDispute && latestDispute.status !== 'resolved' && <Card className="border-red-200 bg-red-50 p-5"><h2 className="font-black text-red-900">Dispute under review</h2><p className="mt-2 text-sm text-red-700">{latestDispute.reason}</p></Card>}
      </div>
    </div>
  </>
}
