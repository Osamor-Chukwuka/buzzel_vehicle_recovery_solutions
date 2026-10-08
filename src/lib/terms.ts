import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export const CURRENT_TERMS_VERSION = '2026-10-08'

export async function hasCurrentTermsAccepted(userId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase.from('terms_acceptances').select('id').eq('user_id', userId).eq('declaration_version', CURRENT_TERMS_VERSION).eq('terms_version', CURRENT_TERMS_VERSION).eq('privacy_version', CURRENT_TERMS_VERSION).limit(1).maybeSingle()
  if (error) throw error
  return Boolean(data)
}

export async function acceptCurrentTerms(userId: string) {
  if (await hasCurrentTermsAccepted(userId)) return
  const supabase = await createClient()
  const { error } = await supabase.from('terms_acceptances').insert({
    user_id: userId,
    declaration_version: CURRENT_TERMS_VERSION,
    terms_version: CURRENT_TERMS_VERSION,
    privacy_version: CURRENT_TERMS_VERSION,
  })
  if (error) throw error
}

export async function ensureCurrentTermsAccepted(userId: string) {
  if (await hasCurrentTermsAccepted(userId)) return
  const cookieStore = await cookies()
  const pending = cookieStore.get('buzzel_pending_terms')?.value
  if (pending !== CURRENT_TERMS_VERSION) redirect('/declaration')
  await acceptCurrentTerms(userId)
  cookieStore.delete('buzzel_pending_terms')
}
