import { notFound } from 'next/navigation'
import { requireUser } from '@/lib/supabase/auth'
import { createClient } from '@/lib/supabase/server'
import { completeDemoPaymentAction } from '@/lib/actions/payments'
import { Button, Card, PageHeader } from '@/components/ui'
import { formatMoney } from '@/lib/format'

export default async function DemoPaymentPage({params}:{params:Promise<{id:string}>}){const {id}=await params; await requireUser(); if(process.env.BUZZEL_DEMO_MODE!=='true')notFound(); const supabase=await createClient(); const {data:payment}=await supabase.from('payments').select('*').eq('id',id).maybeSingle(); if(!payment)notFound(); return <><PageHeader title="Demo payment" description="This screen simulates a successful provider transaction when external test keys are not configured."/><Card className="mx-auto max-w-lg p-6 text-center"><div className="mx-auto grid size-14 place-items-center rounded-full bg-blue-50 text-2xl">₦</div><p className="mt-4 text-sm text-slate-500">Confirm test payment</p><p className="mt-1 text-4xl font-black">{formatMoney(Number(payment.amount_minor),payment.currency)}</p><form action={completeDemoPaymentAction.bind(null,id)} className="mt-6"><Button type="submit" className="w-full">Complete test payment</Button></form><p className="mt-3 text-xs leading-5 text-slate-400">No real funds are transferred.</p></Card></>}
