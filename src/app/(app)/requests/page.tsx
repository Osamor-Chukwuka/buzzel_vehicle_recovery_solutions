import { requireUser, getProfile } from '@/lib/supabase/auth'
import { createClient } from '@/lib/supabase/server'
import { Card, EmptyState, LinkButton, PageHeader, StatusBadge } from '@/components/ui'
import { SERVICE_LABELS } from '@/lib/constants'
import { formatDateTime, formatMoney } from '@/lib/format'
import type { RequestStatus, ServiceType } from '@/lib/types'

export default async function RequestsPage() {
  const user = await requireUser(); const profile = await getProfile(user.id); const supabase = await createClient()
  let query = supabase.from('service_requests').select('*, vehicles(registration_number, make, model)').order('created_at', { ascending: false })
  if (profile?.role === 'customer') query = query.eq('customer_user_id', user.id)
  if (profile?.role === 'team') query = query.eq('assigned_team_member_id', user.id)
  const { data: requests } = await query.limit(100)
  return <><PageHeader title={profile?.role === 'customer' ? 'Your requests' : 'Requests'} description="Track current jobs and review previous assistance or recovery requests." action={profile?.role === 'customer' ? <LinkButton href="/emergency">New request</LinkButton> : undefined}/>{requests?.length ? <div className="grid gap-3">{requests.map((request) => <a key={request.id} href={`/requests/${request.id}`}><Card className="p-4 transition hover:-translate-y-px hover:shadow-md"><div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><h2 className="font-black">{request.reference}</h2><StatusBadge status={request.status as RequestStatus}/></div><p className="mt-1 text-sm font-semibold text-slate-600">{SERVICE_LABELS[request.service_type as ServiceType]} · {request.vehicles?.registration_number}</p><p className="mt-1 truncate text-xs text-slate-400">{request.breakdown_address} · {formatDateTime(request.created_at)}</p></div><div className="text-left sm:text-right"><p className="text-xs text-slate-400">Amount due</p><p className="font-black">{request.covered_at_request ? 'Covered' : formatMoney(Number(request.amount_due_minor), request.currency)}</p></div></div></Card></a>)}</div> : <EmptyState title="No requests yet" description="When you need roadside assistance or recovery, start from the emergency/request flow." action={profile?.role === 'customer' ? <LinkButton href="/emergency">Request help</LinkButton> : undefined}/>}</>
}
