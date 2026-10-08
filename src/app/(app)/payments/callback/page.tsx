import { redirect } from 'next/navigation'
import { requireUser } from '@/lib/supabase/auth'
import { createClient } from '@/lib/supabase/server'
import { verifyPaystackTransaction } from '@/lib/payments/paystack'
import { finalizePayment } from '@/lib/payments/finalize'

export default async function PaymentCallbackPage({searchParams}:{searchParams:Promise<{reference?:string}>}){await requireUser(); const {reference}=await searchParams; if(!reference) throw new Error('Missing payment reference'); const supabase=await createClient(); const {data:payment}=await supabase.from('payments').select('*').eq('provider_reference',reference).maybeSingle(); if(!payment)redirect('/dashboard?payment=failed'); const verified=await verifyPaystackTransaction(reference); if(verified?.status==='success'&&Number(verified.amount)===Number(payment.amount_minor)){await finalizePayment(payment.id,{source:'paystack_callback',...verified}); redirect('/dashboard?payment=success')} redirect(`/payments/${payment.id}`)}
